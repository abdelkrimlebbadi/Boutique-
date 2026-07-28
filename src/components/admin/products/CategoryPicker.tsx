import { Checkbox } from "@/components/admin/ui/Checkbox";
import type { CategoryOption } from "@/lib/admin/products-query";

export function CategoryPicker({
  options,
  value,
  onChange,
}: {
  options: CategoryOption[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(id: string, checked: boolean) {
    onChange(checked ? [...value, id] : value.filter((existing) => existing !== id));
  }

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <label key={option.id} className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={value.includes(option.id)}
            onChange={(event) => toggle(option.id, event.target.checked)}
          />
          {option.name}
        </label>
      ))}
    </div>
  );
}
