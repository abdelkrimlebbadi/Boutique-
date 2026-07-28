import { useTranslations } from "next-intl";
import type { TestimonialView } from "@/lib/catalog/get-testimonials";

export function Testimonials({
  testimonials,
}: {
  testimonials: TestimonialView[];
}) {
  const t = useTranslations("home");
  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="mb-4 text-xl font-semibold">{t("testimonialsTitle")}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure
            key={testimonial.id}
            className="rounded-lg border border-black/10 p-6 dark:border-white/20"
          >
            <div aria-hidden className="mb-2 text-amber-500">
              {"★".repeat(testimonial.rating)}
              {"☆".repeat(5 - testimonial.rating)}
            </div>
            <blockquote className="text-sm">{testimonial.quote}</blockquote>
            <figcaption className="mt-3 text-sm font-medium">
              {testimonial.authorName}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
