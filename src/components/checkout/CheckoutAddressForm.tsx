"use client";

import { useState, useTransition, type FormEvent } from "react";
import { unstable_rethrow } from "next/navigation";
import { useTranslations } from "next-intl";
import { saveCheckoutAddress } from "@/actions/checkout";
import { SUPPORTED_COUNTRIES } from "@/lib/checkout/supported-countries";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { AddressInput } from "@/lib/validation/address";
import type { Locale } from "@/i18n/routing";

type FormAddress = {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  phone: string;
};

const EMPTY_ADDRESS: FormAddress = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  countryCode: SUPPORTED_COUNTRIES[0].code,
  phone: "",
};

function toFormAddress(input: AddressInput | null): FormAddress {
  if (!input) return EMPTY_ADDRESS;
  return {
    fullName: input.fullName,
    line1: input.line1,
    line2: input.line2 ?? "",
    city: input.city,
    state: input.state ?? "",
    postalCode: input.postalCode,
    countryCode: input.countryCode,
    phone: input.phone ?? "",
  };
}

function toAddressInput(form: FormAddress): AddressInput {
  return {
    fullName: form.fullName,
    line1: form.line1,
    line2: form.line2 || null,
    city: form.city,
    state: form.state || null,
    postalCode: form.postalCode,
    countryCode: form.countryCode,
    phone: form.phone || null,
  };
}

export function CheckoutAddressForm({
  locale,
  initialContactEmail,
  initialShipping,
  initialBilling,
}: {
  locale: Locale;
  initialContactEmail: string | null;
  initialShipping: AddressInput | null;
  initialBilling: AddressInput | null;
}) {
  const t = useTranslations("checkout.address");
  const [contactEmail, setContactEmail] = useState(initialContactEmail ?? "");
  const [shipping, setShipping] = useState<FormAddress>(toFormAddress(initialShipping));
  const [billingSame, setBillingSame] = useState(initialBilling === null);
  const [billing, setBilling] = useState<FormAddress>(toFormAddress(initialBilling));
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateShipping<K extends keyof FormAddress>(key: K, value: FormAddress[K]) {
    setShipping((prev) => ({ ...prev, [key]: value }));
  }
  function updateBilling<K extends keyof FormAddress>(key: K, value: FormAddress[K]) {
    setBilling((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(false);
    startTransition(async () => {
      try {
        await saveCheckoutAddress({
          contactEmail,
          locale,
          shipping: toAddressInput(shipping),
          billingSameAsShipping: billingSame,
          billing: billingSame ? undefined : toAddressInput(billing),
        });
      } catch (submitError) {
        unstable_rethrow(submitError);
        setError(true);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-neutral-700">{t("contactEmail")}</span>
        <Input
          type="email"
          required
          value={contactEmail}
          onChange={(event) => setContactEmail(event.target.value)}
        />
      </label>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-display text-lg font-semibold">{t("title")}</legend>
        <AddressFields translationKey="checkout.address" value={shipping} onChange={updateShipping} />
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={billingSame}
          onChange={(event) => setBillingSame(event.target.checked)}
          className="h-4 w-4 border-neutral-300"
        />
        {t("billingSameAsShipping")}
      </label>

      {!billingSame && (
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 font-display text-lg font-semibold">{t("billingTitle")}</legend>
          <AddressFields translationKey="checkout.address" value={billing} onChange={updateBilling} />
        </fieldset>
      )}

      {error && <p className="text-sm text-red-600">{t("error")}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? t("saving") : t("continueCta")}
      </Button>
    </form>
  );
}

function AddressFields({
  translationKey,
  value,
  onChange,
}: {
  translationKey: "checkout.address";
  value: FormAddress;
  onChange: <K extends keyof FormAddress>(key: K, value: FormAddress[K]) => void;
}) {
  const t = useTranslations(translationKey);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="text-neutral-700">{t("fullName")}</span>
        <Input required value={value.fullName} onChange={(e) => onChange("fullName", e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="text-neutral-700">{t("line1")}</span>
        <Input required value={value.line1} onChange={(e) => onChange("line1", e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="text-neutral-700">{t("line2")}</span>
        <Input value={value.line2} onChange={(e) => onChange("line2", e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-neutral-700">{t("city")}</span>
        <Input required value={value.city} onChange={(e) => onChange("city", e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-neutral-700">{t("state")}</span>
        <Input value={value.state} onChange={(e) => onChange("state", e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-neutral-700">{t("postalCode")}</span>
        <Input
          required
          value={value.postalCode}
          onChange={(e) => onChange("postalCode", e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-neutral-700">{t("country")}</span>
        <Select required value={value.countryCode} onChange={(e) => onChange("countryCode", e.target.value)}>
          {SUPPORTED_COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.label}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="text-neutral-700">{t("phone")}</span>
        <Input type="tel" value={value.phone} onChange={(e) => onChange("phone", e.target.value)} />
      </label>
    </div>
  );
}
