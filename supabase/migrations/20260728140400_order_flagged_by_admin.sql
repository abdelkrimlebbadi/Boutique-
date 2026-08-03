-- Lets an admin hold an order back from Printful fulfillment before it's
-- submitted (see handlePaymentSucceeded's flagged_by_admin check). Real
-- window of effect: between create_order_with_items creating the order
-- `pending` and the payment webhook firing — the time the customer spends
-- on the provider's own page. No moderation UI beyond a manual toggle in
-- /admin/orders in this version; content is never auto-scanned.

alter table orders add column flagged_by_admin boolean not null default false;
