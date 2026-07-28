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
    <details className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/20">
      <summary className="cursor-pointer font-medium">{t("sizeGuide")}</summary>
      <table className="mt-3 w-full text-start">
        <thead>
          <tr className="text-black/60 dark:text-white/60">
            <th className="text-start font-normal">{t("selectSize")}</th>
            <th className="text-start font-normal">Chest (cm)</th>
            <th className="text-start font-normal">Length (cm)</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_CHART.map((row) => (
            <tr key={row.size}>
              <td className="py-1">{row.size}</td>
              <td className="py-1">{row.chestCm}</td>
              <td className="py-1">{row.lengthCm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
