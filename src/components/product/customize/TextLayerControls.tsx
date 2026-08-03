"use client";

import { useTranslations } from "next-intl";
import { CUSTOMIZER_FONTS, type CustomizerFontId } from "@/lib/fonts/customizer-fonts";
import type { DesignTextLayer } from "@/lib/customize/types";
import type { PrintArea } from "@/lib/catalog/get-product-by-slug";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const DEFAULT_FONT_SIZE_PX = 64;
const DEFAULT_COLOR = "#111111";
const MIN_FONT_SIZE_PX = 12;
const MAX_FONT_SIZE_PX = 400;

export function TextLayerControls({
  text,
  printArea,
  onChange,
}: {
  text: DesignTextLayer | null;
  printArea: PrintArea;
  onChange: (text: DesignTextLayer | null) => void;
}) {
  const t = useTranslations("product.customize");

  function handleContentChange(content: string) {
    if (!content) {
      onChange(null);
      return;
    }
    if (text) {
      onChange({ ...text, content });
      return;
    }
    const fontSizePx = Math.min(DEFAULT_FONT_SIZE_PX, printArea.heightPx / 4);
    onChange({
      content,
      fontId: "sans",
      fontSizePx,
      color: DEFAULT_COLOR,
      x: printArea.widthPx / 4,
      y: (printArea.heightPx - fontSizePx) / 2,
      rotationDeg: 0,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="text"
        placeholder={t("textPlaceholder")}
        value={text?.content ?? ""}
        maxLength={60}
        onChange={(event) => handleContentChange(event.target.value)}
      />

      {text && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs text-neutral-500">
              {t("fontLabel")}
              <Select
                compact={false}
                value={text.fontId}
                onChange={(event) =>
                  onChange({ ...text, fontId: event.target.value as CustomizerFontId })
                }
              >
                {CUSTOMIZER_FONTS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {t(`font_${font.id}` as `font_${CustomizerFontId}`)}
                  </option>
                ))}
              </Select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-neutral-500">
              {t("colorLabel")}
              <input
                type="color"
                value={text.color}
                onChange={(event) => onChange({ ...text, color: event.target.value })}
                className="h-10 w-full border border-neutral-300"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            {t("sizeLabel")}
            <input
              type="range"
              min={MIN_FONT_SIZE_PX}
              max={Math.min(MAX_FONT_SIZE_PX, printArea.heightPx)}
              value={text.fontSizePx}
              onChange={(event) =>
                onChange({ ...text, fontSizePx: Number(event.target.value) })
              }
            />
          </label>

          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            {t("removeText")}
          </Button>
        </>
      )}
    </div>
  );
}
