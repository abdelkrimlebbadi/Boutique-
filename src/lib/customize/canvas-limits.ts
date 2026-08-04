// iOS Safari refuses to allocate a canvas whose total area exceeds roughly
// 4096×4096 px; over the ceiling the canvas comes back blank or the
// allocation fails outright, taking any toBlob()/toDataURL() with it. Our
// print areas sit right at that boundary — a 3600×4800 t-shirt front is
// 17.28 MP, ~3% over — and Konva multiplies the backing bitmap by
// devicePixelRatio on top (69 MP at dPR 2, 155 MP at dPR 3), which is what
// made the customizer fail on a phone while passing on desktop.
export const MAX_CANVAS_AREA_PX = 4096 * 4096;

/**
 * Largest factor ≤ 1 that keeps `widthPx × heightPx` within the canvas area
 * a mobile browser will actually allocate. 1 when the print area already
 * fits, so the common case exports at exact native print resolution.
 */
export function fitCanvasScale(widthPx: number, heightPx: number): number {
  const area = widthPx * heightPx;
  if (area <= MAX_CANVAS_AREA_PX) return 1;
  return Math.sqrt(MAX_CANVAS_AREA_PX / area);
}
