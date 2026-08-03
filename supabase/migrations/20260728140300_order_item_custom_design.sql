-- Frozen snapshot, same posture as every other order_items column: copied
-- once from cart_items.custom_design_print_file_url at order creation,
-- never re-derived.

alter table order_items add column custom_design_url text;
