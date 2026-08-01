import { Input } from "@/components/admin/ui/Input";
import type { ProductEditData } from "@/lib/admin/products-query";

const LOCALE_LABELS: Record<string, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  ar: "العربية",
};

export type TranslationValue = ProductEditData["translations"][number];

export function TranslationBlock({
  value,
  onChange,
}: {
  value: TranslationValue;
  onChange: (next: TranslationValue) => void;
}) {
  return (
    <fieldset className="border border-black p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide">
        {LOCALE_LABELS[value.locale] ?? value.locale}
      </legend>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>Nom</span>
          <Input
            required
            value={value.name}
            onChange={(event) => onChange({ ...value, name: event.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Description</span>
          <textarea
            className="min-h-20 border border-black bg-white p-2 text-sm"
            value={value.description ?? ""}
            onChange={(event) => onChange({ ...value, description: event.target.value || null })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Titre SEO</span>
          <Input
            value={value.seoTitle ?? ""}
            onChange={(event) => onChange({ ...value, seoTitle: event.target.value || null })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Description SEO</span>
          <Input
            value={value.seoDesc ?? ""}
            onChange={(event) => onChange({ ...value, seoDesc: event.target.value || null })}
          />
        </label>
      </div>
    </fieldset>
  );
}
