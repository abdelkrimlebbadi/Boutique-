"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Konva from "konva";
import { Stage, Layer, Rect, Image as KonvaImage, Text as KonvaText, Transformer } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useCart } from "@/components/cart/CartProvider";
import { getCustomizerFont, ensureCustomizerFontsLoaded } from "@/lib/fonts/customizer-fonts";
import { isDesignStateEmpty, type DesignImageLayer, type DesignTextLayer } from "@/lib/customize/types";
import type { PrintArea } from "@/lib/catalog/get-product-by-slug";
import { DesignUploadField } from "./DesignUploadField";
import { TextLayerControls } from "./TextLayerControls";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

type SelectedLayer = "image" | "text" | null;

// Screen pixels (see the Transformer below for why no scale conversion is
// needed). Sized for a finger, not a mouse pointer.
const TRANSFORMER_ANCHOR_SCREEN_PX = 18;

function loadHtmlImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    // The bucket is public but on a different origin (Supabase Storage) —
    // without crossOrigin, the canvas gets tainted and toDataURL()/toBlob()
    // (used later by DesignCompositor) throw a SecurityError.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image-load-failed"));
    img.src = url;
  });
}

export function ProductCustomizer({
  printArea,
  variantId,
  sku,
  size,
  color,
  priceCents,
  productSlug,
  productName,
  fallbackImageUrl,
}: {
  printArea: PrintArea;
  variantId: string;
  sku: string;
  size: string | null;
  color: string | null;
  priceCents: number;
  productSlug: string;
  productName: string;
  fallbackImageUrl: string | null;
}) {
  const t = useTranslations("product.customize");
  const { addItem } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [imageLayer, setImageLayer] = useState<DesignImageLayer | null>(null);
  const [textLayer, setTextLayer] = useState<DesignTextLayer | null>(null);
  const [htmlImage, setHtmlImage] = useState<HTMLImageElement | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<SelectedLayer>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, startAdding] = useTransition();

  const [displayWidth, setDisplayWidth] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const imageNodeRef = useRef<Konva.Image>(null);
  const textNodeRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // The stage is built at its on-screen size and given a scale, rather than
  // at full print-pixel size: a 3600×4800 stage means a 3600×4800 CSS-pixel
  // canvas element (Konva sizes it from the stage), which no amount of
  // sizing on the *container* shrinks — the canvas is a child, not the
  // container. Clipped by the wrapper, that showed only the top-left corner
  // of the print area, so a design centred at ~(1800, 2400) was never on
  // screen at all. Layer coordinates below stay in print-pixel space; the
  // stage scale is purely a view transform, so custom_design_state is
  // unaffected.
  useEffect(() => {
    if (!isOpen) return;
    const element = wrapperRef.current;
    if (!element) return;
    const measure = () => setDisplayWidth(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isOpen]);

  const viewScale = displayWidth > 0 ? displayWidth / printArea.widthPx : 0;

  useEffect(() => {
    if (!isOpen) return;
    // The live editor is a best-effort preview, not the print file (that's
    // DesignCompositor, which stays strict) — Canvas 2D always falls back
    // to a system font, so a rejected font-load promise here should still
    // let the Stage mount rather than leaving the editor permanently blank
    // with no feedback (exactly what an unhandled rejection did before).
    ensureCustomizerFontsLoaded()
      .catch(() => {})
      .finally(() => setFontsReady(true));
  }, [isOpen]);

  // Callback ref rather than a useEffect: the Stage mounts asynchronously
  // (only once fontsReady and displayWidth are both set), so an effect keyed
  // on `isOpen` would fire while stageRef.current is still null and never
  // re-run. touchAction is set here so a drag on the canvas doesn't scroll
  // the page underneath it on mobile.
  function attachStage(node: Konva.Stage | null) {
    stageRef.current = node;
    if (!node) return;
    node.container().style.touchAction = "none";
  }

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const node =
      selectedLayer === "image"
        ? imageNodeRef.current
        : selectedLayer === "text"
          ? textNodeRef.current
          : null;
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedLayer, imageLayer, textLayer]);

  async function handleUploaded(url: string) {
    setError(null);
    try {
      const img = await loadHtmlImage(url);
      const scale = Math.min(
        printArea.widthPx / img.naturalWidth,
        printArea.heightPx / img.naturalHeight,
        1
      );
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      setHtmlImage(img);
      setImageLayer({
        url,
        x: (printArea.widthPx - width) / 2,
        y: (printArea.heightPx - height) / 2,
        width,
        height,
        rotationDeg: 0,
      });
      setRightsConfirmed(false);
      setSelectedLayer("image");
    } catch {
      setError(t("uploadError"));
    }
  }

  function handleStagePointerDown(event: KonvaEventObject<MouseEvent | TouchEvent>) {
    if (event.target === event.target.getStage()) setSelectedLayer(null);
  }

  function handleImageTransformEnd() {
    const node = imageNodeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    setImageLayer((prev) =>
      prev
        ? {
            ...prev,
            x: node.x(),
            y: node.y(),
            width: Math.max(10, prev.width * scaleX),
            height: Math.max(10, prev.height * scaleY),
            rotationDeg: node.rotation(),
          }
        : prev
    );
  }

  function handleTextTransformEnd() {
    const node = textNodeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    node.scaleX(1);
    node.scaleY(1);
    setTextLayer((prev) =>
      prev
        ? {
            ...prev,
            x: node.x(),
            y: node.y(),
            fontSizePx: Math.max(8, Math.round(prev.fontSizePx * scaleX)),
            rotationDeg: node.rotation(),
          }
        : prev
    );
  }

  function removeImage() {
    setImageLayer(null);
    setHtmlImage(null);
    setRightsConfirmed(false);
    if (selectedLayer === "image") setSelectedLayer(null);
  }

  function handleAddToCart() {
    setError(null);
    const design = { image: imageLayer, text: textLayer };
    if (isDesignStateEmpty(design)) {
      setError(t("emptyDesign"));
      return;
    }
    if (imageLayer && !rightsConfirmed) {
      setError(t("rightsRequired"));
      return;
    }

    startAdding(() => {
      addItem(
        {
          variantId,
          sku,
          size,
          color,
          productSlug,
          productName,
          imageUrl: imageLayer?.url ?? fallbackImageUrl,
          priceCents,
          customDesign: { imageUrl: imageLayer?.url ?? null, state: design },
        },
        1
      );
      setImageLayer(null);
      setTextLayer(null);
      setHtmlImage(null);
      setRightsConfirmed(false);
      setSelectedLayer(null);
      setIsOpen(false);
    });
  }

  if (!isOpen) {
    return (
      <Button type="button" variant="secondary" onClick={() => setIsOpen(true)}>
        {t("openButton")}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4 border border-neutral-300 p-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-semibold">{t("openButton")}</span>
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          {t("closeButton")}
        </Button>
      </div>

      <div
        ref={wrapperRef}
        className="relative mx-auto w-full max-w-sm overflow-hidden border border-neutral-300 bg-neutral-50"
        style={{ aspectRatio: `${printArea.widthPx} / ${printArea.heightPx}` }}
      >
        {fontsReady && viewScale > 0 && (
          <Stage
            ref={attachStage}
            width={displayWidth}
            height={printArea.heightPx * viewScale}
            scaleX={viewScale}
            scaleY={viewScale}
            onMouseDown={handleStagePointerDown}
            onTouchStart={handleStagePointerDown}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={printArea.widthPx}
                height={printArea.heightPx}
                fill="#ffffff"
              />
              {imageLayer && htmlImage && (
                <KonvaImage
                  ref={imageNodeRef}
                  image={htmlImage}
                  x={imageLayer.x}
                  y={imageLayer.y}
                  width={imageLayer.width}
                  height={imageLayer.height}
                  rotation={imageLayer.rotationDeg}
                  draggable
                  onClick={() => setSelectedLayer("image")}
                  onTap={() => setSelectedLayer("image")}
                  onDragEnd={(event) =>
                    setImageLayer((prev) =>
                      prev ? { ...prev, x: event.target.x(), y: event.target.y() } : prev
                    )
                  }
                  onTransformEnd={handleImageTransformEnd}
                />
              )}
              {textLayer && (
                <KonvaText
                  ref={textNodeRef}
                  text={textLayer.content}
                  x={textLayer.x}
                  y={textLayer.y}
                  fontSize={textLayer.fontSizePx}
                  fontFamily={getCustomizerFont(textLayer.fontId).fontFamily}
                  fill={textLayer.color}
                  rotation={textLayer.rotationDeg}
                  draggable
                  onClick={() => setSelectedLayer("text")}
                  onTap={() => setSelectedLayer("text")}
                  onDragEnd={(event) =>
                    setTextLayer((prev) =>
                      prev ? { ...prev, x: event.target.x(), y: event.target.y() } : prev
                    )
                  }
                  onTransformEnd={handleTextTransformEnd}
                />
              )}
              {/* anchorSize is already in screen pixels and must NOT be
                  divided by viewScale: Transformer overrides
                  getAbsoluteTransform() to return only its own transform
                  (konva/lib/shapes/Transformer.js), so it draws in absolute
                  space and is unaffected by the stage scale. Bumped above
                  Konva's 10px default purely to give a finger a real target. */}
              <Transformer
                ref={transformerRef}
                rotateEnabled
                keepRatio={selectedLayer === "image"}
                anchorSize={TRANSFORMER_ANCHOR_SCREEN_PX}
                boundBoxFunc={(oldBox, newBox) =>
                  newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
                }
              />
            </Layer>
          </Stage>
        )}
      </div>

      <DesignUploadField onUploaded={handleUploaded} disabled={isAdding} />

      {imageLayer && (
        <>
          <Checkbox
            checked={rightsConfirmed}
            onChange={(event) => setRightsConfirmed(event.target.checked)}
            label={t("rightsCheckbox")}
          />
          <Button type="button" variant="ghost" size="sm" onClick={removeImage}>
            {t("removeImage")}
          </Button>
        </>
      )}

      <TextLayerControls text={textLayer} printArea={printArea} onChange={setTextLayer} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="button" onClick={handleAddToCart} disabled={isAdding}>
        {isAdding ? t("uploading") : t("addCustomToCart")}
      </Button>
    </div>
  );
}
