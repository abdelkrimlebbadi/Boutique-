import "server-only";
import { getResendClient } from "./client";
import { OrderConfirmationEmail, type OrderConfirmationEmailProps } from "./templates/OrderConfirmationEmail";
import { emailCopy } from "./templates/copy";

// Best-effort: a failed send is logged, never thrown — callers (webhook
// handlers) must not fail the whole request over an email provider hiccup.
export async function sendOrderConfirmationEmail(
  contactEmail: string,
  props: OrderConfirmationEmailProps
): Promise<void> {
  try {
    const { error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: contactEmail,
      subject: emailCopy[props.locale].orderConfirmationSubject(props.orderNumber),
      react: OrderConfirmationEmail(props),
    });
    if (error) console.error("sendOrderConfirmationEmail failed:", error);
  } catch (error) {
    console.error("sendOrderConfirmationEmail failed:", error);
  }
}
