import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import type { TestimonialView } from "@/lib/catalog/get-testimonials";

export function Testimonials({
  testimonials,
}: {
  testimonials: TestimonialView[];
}) {
  const t = useTranslations("home");
  if (testimonials.length === 0) return null;

  return (
    <section className="border-t border-neutral-200 py-12 lg:py-20">
      <Container>
        <h2 className="mb-6 font-display text-2xl font-semibold lg:mb-8">
          {t("testimonialsTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.id} className="border-t-2 border-neutral-900 pt-4">
              <span className="sr-only">
                {t("ratingLabel", { rating: testimonial.rating })}
              </span>
              <div aria-hidden className="mb-2 text-sm text-warning-700">
                {"★".repeat(testimonial.rating)}
                <span className="text-neutral-300">
                  {"★".repeat(5 - testimonial.rating)}
                </span>
              </div>
              <blockquote className="font-display text-md text-neutral-900 italic">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-3 text-sm text-neutral-600">
                {testimonial.authorName}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
