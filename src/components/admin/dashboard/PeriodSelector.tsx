"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/admin/ui/Select";
import { Input } from "@/components/admin/ui/Input";

const PRESETS = [
  { label: "7 derniers jours", days: 7 },
  { label: "30 derniers jours", days: 30 },
  { label: "90 derniers jours", days: 90 },
];

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function PeriodSelector({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setRange(newFrom: string, newTo: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", newFrom);
    params.set("to", newTo);
    router.push(`${pathname}?${params.toString()}`);
  }

  function onPresetChange(days: string) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - Number(days) + 1);
    setRange(isoDate(start), isoDate(end));
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs">
        <span>Préréglages</span>
        <Select defaultValue="" onChange={(event) => onPresetChange(event.target.value)}>
          <option value="" disabled>
            Choisir...
          </option>
          {PRESETS.map((preset) => (
            <option key={preset.days} value={preset.days}>
              {preset.label}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span>Du</span>
        <Input type="date" value={from} onChange={(event) => setRange(event.target.value, to)} />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span>Au</span>
        <Input type="date" value={to} onChange={(event) => setRange(from, event.target.value)} />
      </label>
    </div>
  );
}
