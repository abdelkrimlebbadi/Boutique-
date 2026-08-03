"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { generateUniqueSlug } from "@/lib/admin/slugify";
import { getCatalogProductVariants } from "@/lib/printful/catalog";
import { psychologicalRoundCents } from "@/lib/currency/psychological-round";
import { CURRENCIES } from "@/lib/currency/constants";
import { locales } from "@/i18n/routing";

const priceSchema = z.object({
  currency: z.enum(CURRENCIES),
  amountCents: z.number().int().nonnegative(),
  compareAtCents: z.number().int().nonnegative().nullable(),
});

const variantSchema = z
  .object({
    id: z.string().uuid().nullable(),
    sku: z.string().trim().min(1).max(64),
    size: z.string().trim().max(40).nullable(),
    color: z.string().trim().max(40).nullable(),
    printfulVariantId: z.string().trim().max(64).nullable(),
    stockPolicy: z.enum(["made_to_order", "in_stock", "out_of_stock"]),
    weightGrams: z.number().int().positive().nullable(),
    printAreaWidthPx: z.number().int().positive().nullable(),
    printAreaHeightPx: z.number().int().positive().nullable(),
    printAreaDpi: z.number().int().positive().nullable(),
    prices: z.array(priceSchema).min(1),
  })
  .superRefine((variant, ctx) => {
    if (!variant.prices.some((price) => price.currency === "USD")) {
      ctx.addIssue({ code: "custom", path: ["prices"], message: "Un prix USD est requis" });
    }
  });

const translationSchema = z.object({
  locale: z.enum(locales),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable(),
  seoTitle: z.string().trim().max(200).nullable(),
  seoDesc: z.string().trim().max(300).nullable(),
});

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().trim().max(200).nullable(),
  position: z.number().int().nonnegative(),
});

const saveProductSchema = z
  .object({
    id: z.string().uuid().nullable(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug invalide"),
    status: z.enum(["draft", "active", "archived"]),
    baseCostUsd: z.number().int().nonnegative(),
    printfulVariantId: z.string().trim().max(64).nullable(),
    isBestseller: z.boolean(),
    translations: z.array(translationSchema),
    variants: z.array(variantSchema).min(1),
    categoryIds: z.array(z.string().uuid()),
    images: z.array(imageSchema),
  })
  .superRefine((value, ctx) => {
    const provided = new Set(value.translations.map((t) => t.locale));
    for (const locale of locales) {
      if (!provided.has(locale)) {
        ctx.addIssue({
          code: "custom",
          path: ["translations"],
          message: `Traduction ${locale} manquante`,
        });
      }
    }
  });

export type SaveProductInput = z.input<typeof saveProductSchema>;

async function callAdminSaveProduct(input: z.infer<typeof saveProductSchema>): Promise<string> {
  const serviceRole = createServiceRoleClient();

  const { data, error } = await serviceRole.rpc("admin_save_product", {
    // Supabase's generated RPC Args types aren't nullable-aware for plain
    // function parameters (Postgres doesn't expose that metadata) even
    // though the SQL parameters genuinely accept null (insert vs. update,
    // and an optional Printful sync id).
    p_product_id: input.id as string,
    p_slug: input.slug,
    p_status: input.status,
    p_base_cost_usd: input.baseCostUsd,
    p_printful_variant_id: input.printfulVariantId as string,
    p_is_bestseller: input.isBestseller,
    p_translations: input.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
      description: t.description,
      seo_title: t.seoTitle,
      seo_desc: t.seoDesc,
    })),
    p_variants: input.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      printful_variant_id: v.printfulVariantId,
      stock_policy: v.stockPolicy,
      weight_grams: v.weightGrams,
      print_area_width_px: v.printAreaWidthPx,
      print_area_height_px: v.printAreaHeightPx,
      print_area_dpi: v.printAreaDpi,
      prices: v.prices.map((p) => ({
        currency: p.currency,
        amount_cents: p.amountCents,
        compare_at_cents: p.compareAtCents,
      })),
    })),
    p_category_ids: input.categoryIds,
    p_images: input.images,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "admin_save_product failed");
  }
  return data.id;
}

export async function saveProduct(
  rawInput: SaveProductInput
): Promise<{ error: string } | never> {
  await requireAdmin();
  const input = saveProductSchema.parse(rawInput);

  let productId: string;
  try {
    productId = await callAdminSaveProduct(input);
  } catch (error) {
    console.error("saveProduct failed:", error);
    return { error: "Impossible d'enregistrer le produit. Le slug est peut-être déjà utilisé." };
  }

  redirect(`/admin/products/${productId}/edit`);
}

const deleteProductSchema = z.object({ productId: z.string().uuid() });

export async function deleteProduct(rawInput: z.input<typeof deleteProductSchema>): Promise<void> {
  await requireAdmin();
  const { productId } = deleteProductSchema.parse(rawInput);
  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);
  redirect("/admin/products");
}

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadProductImage(
  formData: FormData
): Promise<{ error: string } | { ok: true; url: string }> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Fichier manquant." };
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return { error: "Type d'image non supporté." };

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `uploads/${crypto.randomUUID()}.${extension}`;

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole.storage.from("product-images").upload(path, file, {
    contentType: file.type,
  });
  if (error) return { error: "Échec de l'upload." };

  const { data } = serviceRole.storage.from("product-images").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

const importPrintfulProductSchema = z.object({
  catalogProductId: z.number().int().positive(),
  selectedVariantIds: z.array(z.number().int().positive()).min(1),
});

// Pre-fills local rows only — see catalog.ts's disclaimer: this does not
// create anything on Printful's side. The admin still has to create the
// real Sync product in Printful's dashboard and paste sync variant IDs
// back into ProductForm before the product is orderable.
export async function importPrintfulProduct(
  rawInput: z.input<typeof importPrintfulProductSchema>
): Promise<{ error: string } | never> {
  await requireAdmin();
  const { catalogProductId, selectedVariantIds } = importPrintfulProductSchema.parse(rawInput);

  let detail;
  try {
    detail = await getCatalogProductVariants(catalogProductId);
  } catch (error) {
    console.error("importPrintfulProduct: catalog fetch failed:", error);
    return { error: "Impossible de récupérer les variantes Printful." };
  }

  const selected = new Set(selectedVariantIds);
  const variants = detail.variants.filter((variant) => selected.has(variant.id));
  if (variants.length === 0) return { error: "Aucune variante sélectionnée." };

  const slug = await generateUniqueSlug(detail.name);
  const images = variants
    .map((variant) => variant.imageUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, 1)
    .map((url, index) => ({ url, alt: detail.name, position: index }));

  let productId: string;
  try {
    productId = await callAdminSaveProduct({
      id: null,
      slug,
      status: "draft",
      baseCostUsd: Math.max(...variants.map((v) => v.costCents), 0),
      printfulVariantId: null,
      isBestseller: false,
      translations: locales.map((locale) => ({
        locale,
        name: locale === "fr" ? detail.name : "",
        description: null,
        seoTitle: null,
        seoDesc: null,
      })),
      variants: variants.map((variant, index) => ({
        id: null,
        sku: `${slug}-${index + 1}`,
        size: variant.size,
        color: variant.color,
        printfulVariantId: null,
        stockPolicy: "made_to_order",
        weightGrams: null,
        printAreaWidthPx: null,
        printAreaHeightPx: null,
        printAreaDpi: null,
        prices: [
          {
            currency: "USD",
            amountCents: psychologicalRoundCents(variant.costCents * 2),
            compareAtCents: null,
          },
        ],
      })),
      categoryIds: [],
      images,
    });
  } catch (error) {
    console.error("importPrintfulProduct: save failed:", error);
    return { error: "Impossible de créer le produit." };
  }

  redirect(`/admin/products/${productId}/edit`);
}
