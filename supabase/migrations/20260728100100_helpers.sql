-- Generic trigger function to keep `updated_at` current on every table that has one.

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
