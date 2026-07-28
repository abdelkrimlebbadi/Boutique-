-- Needed to relay tracking info to the customer once Printful ships a
-- package (see the shipping notification email).
alter table orders
  add column tracking_number text,
  add column tracking_url text,
  add column carrier text;
