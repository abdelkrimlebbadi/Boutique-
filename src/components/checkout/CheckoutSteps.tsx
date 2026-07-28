import { getTranslations } from "next-intl/server";

const STEP_ORDER = ["cart", "address", "shipping", "payment", "confirmation"] as const;
export type CheckoutStep = (typeof STEP_ORDER)[number];

export async function CheckoutSteps({ current }: { current: CheckoutStep }) {
  const t = await getTranslations("checkout.steps");
  const currentIndex = STEP_ORDER.indexOf(current);

  return (
    <ol className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 lg:mb-12">
      {STEP_ORDER.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden>/</span>}
          <span
            aria-current={step === current ? "step" : undefined}
            className={index <= currentIndex ? "font-medium text-neutral-900" : "text-neutral-400"}
          >
            {t(step)}
          </span>
        </li>
      ))}
    </ol>
  );
}
