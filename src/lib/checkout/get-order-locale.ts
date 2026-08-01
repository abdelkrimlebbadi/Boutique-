import "server-only";
import { locales, type Locale } from "@/i18n/routing";
import type { createServiceRoleClient } from "@/lib/supabase/service-role";

// Emails render from webhook handlers, outside next-intl's request scope —
// the recipient's language has to be looked up explicitly instead.
export async function getOrderLocale(
  supabase: ReturnType<typeof createServiceRoleClient>,
  customerId: string
): Promise<Locale> {
  const { data } = await supabase
    .from("customers")
    .select("preferred_locale")
    .eq("id", customerId)
    .maybeSingle();
  const locale = data?.preferred_locale;
  return locale && (locales as readonly string[]).includes(locale) ? (locale as Locale) : "fr";
}
