import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";
import type { CategoryView } from "./types";

export async function getCategories(locale: Locale): Promise<CategoryView[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, position, category_translations!inner(name)")
    .eq("category_translations.locale", locale)
    .order("position");

  if (!data) return [];

  return data.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.category_translations[0]?.name ?? category.slug,
  }));
}
