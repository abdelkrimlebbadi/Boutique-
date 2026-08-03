-- Demo catalog data so the storefront is visually testable end to end.
-- Fixed UUIDs for readability/cross-referencing across statements — the
-- version/variant nibbles (3rd/4th group: 4xxx/8xxx) are deliberately kept
-- RFC4122-valid so they pass zod's strict `.uuid()` schemas (e.g.
-- addToCartSchema in src/actions/cart.ts); an earlier all-zeros version of
-- these ids passed Postgres's uuid type but failed that validation at
-- runtime. Image URLs point at a public placeholder CDN (picsum.photos) —
-- swap for Supabase Storage URLs once real product photography exists
-- (adjust the remotePatterns entry in next.config.ts accordingly).

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

insert into categories (id, slug, position) values
  ('10000000-0000-4000-8000-000000000001', 't-shirts', 1),
  ('10000000-0000-4000-8000-000000000002', 'hoodies', 2),
  ('10000000-0000-4000-8000-000000000003', 'posters', 3);

insert into category_translations (category_id, locale, name, description) values
  ('10000000-0000-4000-8000-000000000001', 'fr', 'T-shirts', 'T-shirts imprimés à la demande.'),
  ('10000000-0000-4000-8000-000000000001', 'en', 'T-Shirts', 'Print-on-demand t-shirts.'),
  ('10000000-0000-4000-8000-000000000001', 'es', 'Camisetas', 'Camisetas impresas bajo demanda.'),
  ('10000000-0000-4000-8000-000000000001', 'ar', 'قمصان', 'قمصان مطبوعة عند الطلب.'),
  ('10000000-0000-4000-8000-000000000002', 'fr', 'Sweats à capuche', 'Hoodies imprimés à la demande.'),
  ('10000000-0000-4000-8000-000000000002', 'en', 'Hoodies', 'Print-on-demand hoodies.'),
  ('10000000-0000-4000-8000-000000000002', 'es', 'Sudaderas', 'Sudaderas con capucha impresas bajo demanda.'),
  ('10000000-0000-4000-8000-000000000002', 'ar', 'سترات بغطاء الرأس', 'سترات مطبوعة عند الطلب.'),
  ('10000000-0000-4000-8000-000000000003', 'fr', 'Affiches', 'Affiches d''art imprimées à la demande.'),
  ('10000000-0000-4000-8000-000000000003', 'en', 'Posters', 'Print-on-demand art posters.'),
  ('10000000-0000-4000-8000-000000000003', 'es', 'Pósters', 'Pósters artísticos impresos bajo demanda.'),
  ('10000000-0000-4000-8000-000000000003', 'ar', 'ملصقات', 'ملصقات فنية مطبوعة عند الطلب.');

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------

insert into products (id, slug, status, base_cost_usd, is_bestseller) values
  ('20000000-0000-4000-8000-000000000001', 't-shirt-atlas', 'active', 800, true),
  ('20000000-0000-4000-8000-000000000002', 't-shirt-medina', 'active', 800, false),
  ('20000000-0000-4000-8000-000000000003', 'hoodie-casablanca', 'active', 1800, true),
  ('20000000-0000-4000-8000-000000000004', 'poster-sahara', 'active', 600, false);

insert into product_categories (product_id, category_id) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000003');

insert into product_translations (product_id, locale, name, description, seo_title, seo_desc) values
  ('20000000-0000-4000-8000-000000000001', 'fr', 'T-shirt Atlas', 'T-shirt en coton bio, motif Atlas brodé.', 'T-shirt Atlas — Boutique', 'T-shirt en coton bio brodé Atlas, expédié depuis le Maroc.'),
  ('20000000-0000-4000-8000-000000000001', 'en', 'Atlas T-Shirt', 'Organic cotton t-shirt with an embroidered Atlas motif.', 'Atlas T-Shirt — Boutique', 'Organic cotton t-shirt with an embroidered Atlas motif, shipped from Morocco.'),
  ('20000000-0000-4000-8000-000000000001', 'es', 'Camiseta Atlas', 'Camiseta de algodón orgánico con motivo Atlas bordado.', 'Camiseta Atlas — Boutique', 'Camiseta de algodón orgánico bordada, enviada desde Marruecos.'),
  ('20000000-0000-4000-8000-000000000001', 'ar', 'قميص أطلس', 'قميص من القطن العضوي بتطريز أطلس.', 'قميص أطلس — بوتيك', 'قميص من القطن العضوي مطرز، يُشحن من المغرب.'),

  ('20000000-0000-4000-8000-000000000002', 'fr', 'T-shirt Médina', 'T-shirt en coton bio, motif inspiré des médinas marocaines.', 'T-shirt Médina — Boutique', 'T-shirt coton bio, motif médina, expédié depuis le Maroc.'),
  ('20000000-0000-4000-8000-000000000002', 'en', 'Medina T-Shirt', 'Organic cotton t-shirt inspired by Moroccan medinas.', 'Medina T-Shirt — Boutique', 'Organic cotton t-shirt, medina print, shipped from Morocco.'),
  ('20000000-0000-4000-8000-000000000002', 'es', 'Camiseta Medina', 'Camiseta de algodón orgánico inspirada en las medinas marroquíes.', 'Camiseta Medina — Boutique', 'Camiseta de algodón orgánico, estampado medina, enviada desde Marruecos.'),
  ('20000000-0000-4000-8000-000000000002', 'ar', 'قميص المدينة', 'قميص من القطن العضوي مستوحى من المدن المغربية العتيقة.', 'قميص المدينة — بوتيك', 'قميص قطن عضوي، طبعة المدينة، يُشحن من المغرب.'),

  ('20000000-0000-4000-8000-000000000003', 'fr', 'Hoodie Casablanca', 'Sweat à capuche épais, broderie Casablanca.', 'Hoodie Casablanca — Boutique', 'Sweat à capuche épais brodé Casablanca, expédié depuis le Maroc.'),
  ('20000000-0000-4000-8000-000000000003', 'en', 'Casablanca Hoodie', 'Heavyweight hoodie with Casablanca embroidery.', 'Casablanca Hoodie — Boutique', 'Heavyweight hoodie with Casablanca embroidery, shipped from Morocco.'),
  ('20000000-0000-4000-8000-000000000003', 'es', 'Sudadera Casablanca', 'Sudadera gruesa con bordado de Casablanca.', 'Sudadera Casablanca — Boutique', 'Sudadera gruesa bordada, enviada desde Marruecos.'),
  ('20000000-0000-4000-8000-000000000003', 'ar', 'سترة الدار البيضاء', 'سترة سميكة بتطريز الدار البيضاء.', 'سترة الدار البيضاء — بوتيك', 'سترة سميكة مطرزة، تُشحن من المغرب.'),

  ('20000000-0000-4000-8000-000000000004', 'fr', 'Affiche Sahara', 'Affiche d''art format A3, désert du Sahara.', 'Affiche Sahara — Boutique', 'Affiche d''art Sahara, impression premium, expédiée depuis le Maroc.'),
  ('20000000-0000-4000-8000-000000000004', 'en', 'Sahara Poster', 'A3 art print of the Sahara desert.', 'Sahara Poster — Boutique', 'Sahara desert art print, premium finish, shipped from Morocco.'),
  ('20000000-0000-4000-8000-000000000004', 'es', 'Póster Sahara', 'Póster artístico A3 del desierto del Sahara.', 'Póster Sahara — Boutique', 'Póster del Sahara, acabado premium, enviado desde Marruecos.'),
  ('20000000-0000-4000-8000-000000000004', 'ar', 'ملصق الصحراء', 'ملصق فني A3 لصحراء الصحراء الكبرى.', 'ملصق الصحراء — بوتيك', 'ملصق فني للصحراء، طباعة فاخرة، يُشحن من المغرب.');

-- ---------------------------------------------------------------------------
-- variants + prices (USD reference price for every variant) + weight
-- ---------------------------------------------------------------------------

insert into product_variants (id, product_id, sku, size, color, stock_policy, weight_grams) values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'TS-ATLAS-NOIR-S', 'S', 'Noir', 'made_to_order', 180),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'TS-ATLAS-NOIR-M', 'M', 'Noir', 'made_to_order', 190),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 'TS-ATLAS-BLANC-M', 'M', 'Blanc', 'made_to_order', 190),
  ('30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000001', 'TS-ATLAS-BLANC-L', 'L', 'Blanc', 'made_to_order', 200),

  ('30000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000002', 'TS-MEDINA-NOIR-M', 'M', 'Noir', 'made_to_order', 190),
  ('30000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002', 'TS-MEDINA-BLANC-L', 'L', 'Blanc', 'made_to_order', 200),

  ('30000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000003', 'HD-CASA-NOIR-M', 'M', 'Noir', 'made_to_order', 550),
  ('30000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000003', 'HD-CASA-NOIR-L', 'L', 'Noir', 'made_to_order', 580),
  ('30000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000003', 'HD-CASA-BLANC-L', 'L', 'Blanc', 'made_to_order', 580),

  ('30000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000004', 'PO-SAHARA-A3', 'A3', null, 'made_to_order', 120),
  ('30000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000004', 'PO-SAHARA-A2', 'A2', null, 'made_to_order', 200);

-- Print areas (personnalisation) for a subset of variants, so the feature
-- is exercisable against the demo catalog — this seed only has t-shirts,
-- a hoodie and a poster (no tote bag/mug products yet), so only those two
-- shapes get one. Standard DTG chest print (12"x16" @ 300 DPI) and a
-- full-bleed A3 print (11.69"x16.54" @ 300 DPI), rounded to whole pixels.
update product_variants set print_area_width_px = 3600, print_area_height_px = 4800, print_area_dpi = 300
  where id = '30000000-0000-4000-8000-000000000001';
update product_variants set print_area_width_px = 3507, print_area_height_px = 4961, print_area_dpi = 300
  where id = '30000000-0000-4000-8000-000000000010';

insert into prices (variant_id, currency, amount_cents) values
  ('30000000-0000-4000-8000-000000000001', 'USD', 2499),
  ('30000000-0000-4000-8000-000000000002', 'USD', 2499),
  ('30000000-0000-4000-8000-000000000003', 'USD', 2499),
  ('30000000-0000-4000-8000-000000000004', 'USD', 2499),
  ('30000000-0000-4000-8000-000000000005', 'USD', 2599),
  ('30000000-0000-4000-8000-000000000006', 'USD', 2599),
  ('30000000-0000-4000-8000-000000000007', 'USD', 4999),
  ('30000000-0000-4000-8000-000000000008', 'USD', 4999),
  ('30000000-0000-4000-8000-000000000009', 'USD', 4999),
  ('30000000-0000-4000-8000-000000000010', 'USD', 1999),
  ('30000000-0000-4000-8000-000000000011', 'USD', 2999);

-- ---------------------------------------------------------------------------
-- images
-- ---------------------------------------------------------------------------

insert into product_images (product_id, url, alt, position) values
  ('20000000-0000-4000-8000-000000000001', 'https://picsum.photos/seed/atlas-1/1000/1250', 'T-shirt Atlas, vue de face', 0),
  ('20000000-0000-4000-8000-000000000001', 'https://picsum.photos/seed/atlas-2/1000/1250', 'T-shirt Atlas, vue de dos', 1),
  ('20000000-0000-4000-8000-000000000002', 'https://picsum.photos/seed/medina-1/1000/1250', 'T-shirt Médina, vue de face', 0),
  ('20000000-0000-4000-8000-000000000003', 'https://picsum.photos/seed/casablanca-1/1000/1250', 'Hoodie Casablanca, vue de face', 0),
  ('20000000-0000-4000-8000-000000000003', 'https://picsum.photos/seed/casablanca-2/1000/1250', 'Hoodie Casablanca, vue de dos', 1),
  ('20000000-0000-4000-8000-000000000004', 'https://picsum.photos/seed/sahara-1/1000/1250', 'Affiche Sahara', 0);

-- ---------------------------------------------------------------------------
-- fx_rates (so the currency conversion demo renders real numbers locally)
-- ---------------------------------------------------------------------------

insert into fx_rates (base_currency, quote_currency, rate) values
  ('USD', 'USD', 1),
  ('USD', 'MAD', 9.95),
  ('USD', 'EUR', 0.92),
  ('USD', 'GBP', 0.79);

-- ---------------------------------------------------------------------------
-- shipping
-- ---------------------------------------------------------------------------

insert into shipping_zones (id, name, country_codes) values
  ('40000000-0000-4000-8000-000000000001', 'Maroc', array['MA']),
  ('40000000-0000-4000-8000-000000000002', 'Europe', array['FR','ES','DE','BE','NL','IT','PT']),
  ('40000000-0000-4000-8000-000000000003', 'Amérique du Nord', array['US','CA']);

insert into shipping_rates (zone_id, min_weight_grams, max_weight_grams, price_cents, currency) values
  ('40000000-0000-4000-8000-000000000001', 0, 500, 1500, 'MAD'),
  ('40000000-0000-4000-8000-000000000001', 501, 2000, 2500, 'MAD'),
  ('40000000-0000-4000-8000-000000000002', 0, 500, 690, 'EUR'),
  ('40000000-0000-4000-8000-000000000002', 501, 2000, 1190, 'EUR'),
  ('40000000-0000-4000-8000-000000000003', 0, 500, 790, 'USD'),
  ('40000000-0000-4000-8000-000000000003', 501, 2000, 1390, 'USD');

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------

insert into testimonials (locale, author_name, quote, rating, position) values
  ('fr', 'Salma B.', 'Livraison rapide en Europe et qualité d''impression au rendez-vous.', 5, 1),
  ('fr', 'Youssef K.', 'Le t-shirt Atlas est superbe, matière agréable.', 5, 2),
  ('fr', 'Claire M.', 'Commande reçue en France en une semaine, très content.', 4, 3),
  ('en', 'Sarah T.', 'Fast shipping to the US and great print quality.', 5, 1),
  ('en', 'Omar R.', 'The Atlas t-shirt is beautiful, love the fabric.', 5, 2),
  ('en', 'James P.', 'Order arrived in Canada within a week, very happy.', 4, 3),
  ('es', 'Lucía G.', 'Envío rápido a España y muy buena calidad de impresión.', 5, 1),
  ('es', 'Carlos M.', 'La camiseta Atlas es preciosa, tela muy agradable.', 5, 2),
  ('ar', 'سلمى ب.', 'شحن سريع إلى أوروبا وجودة طباعة ممتازة.', 5, 1),
  ('ar', 'يوسف ك.', 'قميص أطلس رائع، قماش مريح جدًا.', 5, 2);
