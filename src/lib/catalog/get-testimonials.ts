import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";

export type TestimonialView = {
  id: string;
  authorName: string;
  quote: string;
  rating: number;
};

export async function getTestimonials(
  locale: Locale,
  limit = 3
): Promise<TestimonialView[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("id, author_name, quote, rating")
    .eq("locale", locale)
    .order("position")
    .limit(limit);

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    authorName: row.author_name,
    quote: row.quote,
    rating: row.rating,
  }));
}
