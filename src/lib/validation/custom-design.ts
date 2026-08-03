import { z } from "zod";

// Kept as a literal tuple (not derived from CUSTOMIZER_FONTS) since these
// ids are a stable, deliberately small set — see src/lib/fonts/customizer-fonts.ts.
const CUSTOMIZER_FONT_IDS = ["sans", "serif", "mono", "script"] as const;

export const designImageLayerSchema = z.object({
  url: z.string().url(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotationDeg: z.number(),
});

export const designTextLayerSchema = z.object({
  content: z.string().trim().min(1).max(60),
  fontId: z.enum(CUSTOMIZER_FONT_IDS),
  fontSizePx: z.number().positive().max(2000),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  x: z.number(),
  y: z.number(),
  rotationDeg: z.number(),
});

// At least one of image/text is required — mirrors the same rule enforced
// client-side in ProductCustomizer before "Ajouter au panier" is enabled,
// but never trusted from the client alone.
export const designStateSchema = z
  .object({
    image: designImageLayerSchema.nullable(),
    text: designTextLayerSchema.nullable(),
  })
  .refine((state) => state.image !== null || state.text !== null, {
    message: "Un design doit contenir une image ou un texte.",
  });

export type DesignImageLayer = z.infer<typeof designImageLayerSchema>;
export type DesignTextLayer = z.infer<typeof designTextLayerSchema>;
export type DesignState = z.infer<typeof designStateSchema>;
