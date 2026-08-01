import { useTranslations } from "next-intl";

const SIZE_CHART: { size: string; chestCm: string; lengthCm: string }[] = [
  { size: "S", chestCm: "48", lengthCm: "68" },
  { size: "M", chestCm: "51", lengthCm: "70" },
  { size: "L", chestCm: "54", lengthCm: "72" },
  { size: "XL", chestCm: "57", lengthCm: "74" },
];

// Native <details>/<summary> — no JS needed for the accessible
// expand/collapse behaviour, unlike a modal.
export function SizeGuide() {
  const t = useTranslations("product");

  return (
    <details className="border border-neutral-200 p-4 text-sm">
      <summary className="cursor-pointer font-medium text-neutral-900">
        {t("sizeGuide")}
      </summary>
      <table className="mt-4 w-full text-start">
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-500">
            <th className="pb-2 text-start font-normal">{t("selectSize")}</th>
            <th className="pb-2 text-start font-normal">Chest (cm)</th>
            <th className="pb-2 text-start font-normal">Length (cm)</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_CHART.map((row) => (
            <tr key={row.size} className="border-b border-neutral-100 last:border-0">
              <td className="py-2 text-neutral-900">{row.size}</td>
              <td className="py-2 text-neutral-700">{row.chestCm}</td>
              <td className="py-2 text-neutral-700">{row.lengthCm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
