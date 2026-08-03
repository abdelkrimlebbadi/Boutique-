// Re-exported from the zod schema (src/lib/validation/custom-design.ts) so
// the client-side canvas state and the server-side validation of the same
// payload (addToCart) can never drift apart.
export type {
  DesignImageLayer,
  DesignTextLayer,
  DesignState,
} from "@/lib/validation/custom-design";

export function isDesignStateEmpty(state: {
  image: unknown;
  text: unknown;
}): boolean {
  return state.image == null && state.text == null;
}
