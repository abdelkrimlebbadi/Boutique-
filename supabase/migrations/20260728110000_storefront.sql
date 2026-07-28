-- Small additions needed for the storefront: no real sales history exists
-- yet to derive "best-sellers" from, no weight to compute shipping
-- estimates, and no social-proof content source.

alter table product_variants
  add column weight_grams integer check (weight_grams is null or weight_grams > 0);

alter table products
  add column is_bestseller boolean not null default false;

create index products_is_bestseller_idx on products (is_bestseller) where is_bestseller;

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  author_name text not null,
  quote text not null,
  rating smallint not null check (rating between 1 and 5),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index testimonials_locale_idx on testimonials (locale, position);

alter table testimonials enable row level security;

create policy "public read testimonials"
  on testimonials for select
  to anon, authenticated
  using (true);
