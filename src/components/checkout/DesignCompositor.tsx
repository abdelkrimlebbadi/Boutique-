"use client";

import { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { useTranslations } from "next-intl";
import { finalizeCartItemDesign } from "@/actions/customize";
import { getCustomizerFont, ensureCustomizerFontsLoaded } from "@/lib/fonts/customizer-fonts";
import { fitCanvasScale } from "@/lib/customize/canvas-limits";
import type { DesignState } from "@/lib/customize/types";
import type { PrintArea } from "@/lib/catalog/get-product-by-slug";

export type PendingDesign = {
  cartItemId: string;
  state: DesignState;
  printArea: PrintArea;
};

function loadHtmlImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    // custom-designs is a public bucket on a different origin (Supabase
    // Storage), which serves permissive CORS on object reads — required
    // here since toBlob() below would otherwise throw on a tainted canvas.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image-load-failed"));
    img.src = url;
  });
}

// Headless Konva: a Stage only needs *a* container div, not one attached to
// the visible document — canvas rendering and export work fully detached.
// Built with the vanilla Konva API (not react-konva/JSX) since this runs
// once, imperatively, with no interactivity.
//
// Two things must be pinned down or a phone silently produces nothing:
//   - pixelRatio. Konva defaults a layer's backing bitmap to
//     devicePixelRatio, so a 3600×4800 print area becomes 69 MP at dPR 2 and
//     155 MP at dPR 3 — far past what a mobile browser will allocate. We
//     want print pixels exactly, so it's forced to 1.
//   - total area. Even at pixelRatio 1, our print areas land just over iOS
//     Safari's canvas ceiling (3600×4800 = 17.28 MP vs ~16.78 MP), so the
//     stage is capped by fitCanvasScale and the layer scaled to match.
// Layer contents stay in print-pixel coordinates either way, so
// custom_design_state needs no conversion.
async function renderDesignToBlob(design: PendingDesign): Promise<Blob> {
  const { state, printArea } = design;
  const fitScale = fitCanvasScale(printArea.widthPx, printArea.heightPx);
  const stage = new Konva.Stage({
    container: document.createElement("div"),
    width: Math.floor(printArea.widthPx * fitScale),
    height: Math.floor(printArea.heightPx * fitScale),
  });
  const layer = new Konva.Layer({ scaleX: fitScale, scaleY: fitScale });
  stage.add(layer);
  layer.getCanvas().setPixelRatio(1);

  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: printArea.widthPx,
      height: printArea.heightPx,
      fill: "#ffffff",
    })
  );

  if (state.image) {
    const image = await loadHtmlImage(state.image.url);
    layer.add(
      new Konva.Image({
        image,
        x: state.image.x,
        y: state.image.y,
        width: state.image.width,
        height: state.image.height,
        rotation: state.image.rotationDeg,
      })
    );
  }

  if (state.text) {
    layer.add(
      new Konva.Text({
        text: state.text.content,
        x: state.text.x,
        y: state.text.y,
        fontSize: state.text.fontSizePx,
        fontFamily: getCustomizerFont(state.text.fontId).fontFamily,
        fill: state.text.color,
        rotation: state.text.rotationDeg,
      })
    );
  }

  // Konva's own .d.ts types toBlob as Promise<unknown> (the JS implementation
  // returns Promise<Blob | null>) — narrow it back before returning.
  const blob = (await stage.toBlob({
    mimeType: "image/png",
    pixelRatio: 1,
  })) as Blob | null;
  stage.destroy();
  if (!blob) throw new Error("export-failed");
  return blob;
}

// Mounted on the payment page; runs once, before the customer can click
// "Payer" — see the ProductCustomizer/DesignCompositor split in the plan:
// the raw upload + layout happen on the PDP, the flattened print file is
// only produced here, right before payment, so an abandoned cart never
// pays for a render (the render itself is free — it runs in the browser).
export function DesignCompositor({
  pendingDesigns,
  onReady,
}: {
  pendingDesigns: PendingDesign[];
  onReady: (ready: boolean) => void;
}) {
  const t = useTranslations("checkout.payment");
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    let cancelled = false;

    async function run() {
      onReady(false);
      try {
        await ensureCustomizerFontsLoaded();
        for (const design of pendingDesigns) {
          const blob = await renderDesignToBlob(design);
          const formData = new FormData();
          formData.set("cartItemId", design.cartItemId);
          formData.set("file", blob, "design.png");
          const result = await finalizeCartItemDesign(formData);
          if ("error" in result) throw new Error(result.error);
        }
        if (!cancelled) onReady(true);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [pendingDesigns, onReady, retryCount]);

  function retry() {
    hasRun.current = false;
    setError(false);
    setRetryCount((count) => count + 1);
  }

  if (error) {
    return (
      <div className="border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        <p className="mb-2">{t("designPreparationError")}</p>
        <button
          type="button"
          onClick={retry}
          className="underline underline-offset-2 hover:no-underline"
        >
          {t("designPreparationRetry")}
        </button>
      </div>
    );
  }

  return <p className="text-sm text-neutral-600">{t("preparingDesigns")}</p>;
}
