// Cache of the visitor's active cart id. Purely a performance shortcut: the
// actual ownership boundary is Supabase RLS (carts.customer_id = auth.uid()),
// so a stale, missing or tampered cookie value just fails the lookup and
// falls back to resolving the cart from the session — it is never trusted
// as an authorization token on its own.
export const CART_ID_COOKIE_NAME = "CART_ID";
