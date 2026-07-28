import "server-only";
import { getResendClient } from "./client";
import { PaymentFailedEmail, type PaymentFailedEmailProps } from "./templates/PaymentFailedEmail";
import { emailCopy } from "./templates/copy";

export async function sendPaymentFailedEmail(
  contactEmail: string,
  props: PaymentFailedEmailProps
): Promise<void> {
  try {
    const { error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: contactEmail,
      subject: emailCopy[props.locale].failedSubject(props.orderNumber),
      react: PaymentFailedEmail(props),
    });
    if (error) console.error("sendPaymentFailedEmail failed:", error);
  } catch (error) {
    console.error("sendPaymentFailedEmail failed:", error);
  }
}
