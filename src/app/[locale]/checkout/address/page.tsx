import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getCheckoutAddressIds, getCheckoutContactEmail } from "@/lib/checkout/checkout-cookies";
import { Container } from "@/components/ui/Container";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { CheckoutAddressForm } from "@/components/checkout/CheckoutAddressForm";
import type { AddressInput } from "@/lib/validation/address";
import type { Database } from "@/types/database.types";
import type { Locale } from "@/i18n/routing";

type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];
type AnonClient = Awaited<ReturnType<typeof createClient>>;

function toAddressInput(row: AddressRow): AddressInput {
  return {
    fullName: row.full_name,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    countryCode: row.country_code,
    phone: row.phone,
  };
}

async function fetchAddress(supabase: AnonClient, id: string | null): Promise<AddressRow | null> {
  if (!id) return null;
  const { data } = await supabase.from("addresses").select("*").eq("id", id).maybeSingle();
  return data;
}

export default async function CheckoutAddressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const supabase = await createClient();
  const [{ shippingAddressId, billingAddressId }, contactEmail] = await Promise.all([
    getCheckoutAddressIds(),
    getCheckoutContactEmail(),
  ]);

  const [shippingRow, billingRow] = await Promise.all([
    fetchAddress(supabase, shippingAddressId),
    fetchAddress(supabase, billingAddressId),
  ]);

  return (
    <Container className="max-w-2xl py-8 lg:py-12">
      <CheckoutSteps current="address" />
      <CheckoutAddressForm
        locale={locale as Locale}
        initialContactEmail={contactEmail}
        initialShipping={shippingRow ? toAddressInput(shippingRow) : null}
        initialBilling={billingRow ? toAddressInput(billingRow) : null}
      />
    </Container>
  );
}
