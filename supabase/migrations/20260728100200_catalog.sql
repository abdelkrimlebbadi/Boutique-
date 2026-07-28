-- Product catalog: categories, products, variants, images, prices, and the
-- many-to-many link between products and categories.

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  parent_id uuid references categories (id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on categories
  for each row
  execute function set_updated_at();

create table category_translations (
  category_id uuid not null references categories (id) on delete cascade,
  locale text not null check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  name text not null,
  description text,
  seo_title text,
  seo_desc text,
  primary key (category_id, locale)
);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status product_status not null default 'draft',
  base_cost_usd integer not null check (base_cost_usd >= 0),
  -- Printful "sync product" (template) id, distinct from the per-variant
  -- sync variant id stored on product_variants.printful_variant_id.
  printful_variant_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column products.base_cost_usd is 'Printful base cost in USD cents.';
comment on column products.printful_variant_id is 'Printful sync product (template) id — not a variant id.';

create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();

create table product_translations (
  product_id uuid not null references products (id) on delete cascade,
  locale text not null check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  name text not null,
  description text,
  seo_title text,
  seo_desc text,
  search_vector tsvector generated always as (
    to_tsvector(
      case locale
        when 'fr' then 'french'::regconfig
        when 'en' then 'english'::regconfig
        when 'es' then 'spanish'::regconfig
        else 'simple'::regconfig
      end,
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(seo_title, '') || ' ' ||
      coalesce(seo_desc, '')
    )
  ) stored,
  primary key (product_id, locale)
);

create index product_translations_search_vector_idx
  on product_translations using gin (search_vector);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  sku text not null unique,
  size text,
  color text,
  -- Printful sync variant id.
  printful_variant_id text,
  stock_policy stock_policy not null default 'made_to_order',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_variants_product_id_idx on product_variants (product_id);

create trigger product_variants_set_updated_at
  before update on product_variants
  for each row
  execute function set_updated_at();

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  alt text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_id_position_idx
  on product_images (product_id, position);

create table prices (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants (id) on delete cascade,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  amount_cents integer not null check (amount_cents >= 0),
  compare_at_cents integer check (compare_at_cents is null or compare_at_cents >= amount_cents),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (variant_id, currency)
);

create index prices_variant_id_idx on prices (variant_id);

create trigger prices_set_updated_at
  before update on prices
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- product <-> category link
-- ---------------------------------------------------------------------------

create table product_categories (
  product_id uuid not null references products (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  primary key (product_id, category_id)
);

create index product_categories_category_id_idx on product_categories (category_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — public read of the active catalog, no client writes.
-- Catalog mutations go through Server Actions using the service_role key,
-- which bypasses RLS entirely (see CLAUDE.md: Server Actions for mutations).
-- ---------------------------------------------------------------------------

alter table categories enable row level security;
alter table category_translations enable row level security;
alter table products enable row level security;
alter table product_translations enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table prices enable row level security;
alter table product_categories enable row level security;

create policy "public read categories"
  on categories for select
  to anon, authenticated
  using (true);

create policy "public read category translations"
  on category_translations for select
  to anon, authenticated
  using (true);

create policy "public read active products"
  on products for select
  to anon, authenticated
  using (status = 'active');

create policy "public read active product translations"
  on product_translations for select
  to anon, authenticated
  using (exists (
    select 1 from products p
    where p.id = product_translations.product_id and p.status = 'active'
  ));

create policy "public read active product variants"
  on product_variants for select
  to anon, authenticated
  using (exists (
    select 1 from products p
    where p.id = product_variants.product_id and p.status = 'active'
  ));

create policy "public read active product images"
  on product_images for select
  to anon, authenticated
  using (exists (
    select 1 from products p
    where p.id = product_images.product_id and p.status = 'active'
  ));

create policy "public read active prices"
  on prices for select
  to anon, authenticated
  using (exists (
    select 1 from product_variants v
    join products p on p.id = v.product_id
    where v.id = prices.variant_id and p.status = 'active'
  ));

create policy "public read product categories"
  on product_categories for select
  to anon, authenticated
  using (exists (
    select 1 from products p
    where p.id = product_categories.product_id and p.status = 'active'
  ));
