-- Print area for the product customization tool (upload + text on a
-- mockup). Nullable and independent — the customizer only ever appears on
-- the PDP for a variant where all three are set and positive; never a
-- fabricated default. Filled in by hand in the admin product form, same
-- posture as printful_variant_id: real values only, no live Printful API
-- call on the customer-facing purchase path.

alter table product_variants
  add column print_area_width_px integer check (print_area_width_px is null or print_area_width_px > 0),
  add column print_area_height_px integer check (print_area_height_px is null or print_area_height_px > 0),
  add column print_area_dpi integer check (print_area_dpi is null or print_area_dpi > 0);
