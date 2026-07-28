import "server-only";
import { getResendClient } from "./client";
import { ShippingNotificationEmail, type ShippingNotificationEmailProps } from "./templates/ShippingNotificationEmail";
import { emailCopy } from "./templates/copy";

export async function sendShippingNotificationEmail(
  contactEmail: string,
  props: ShippingNotificationEmailProps
): Promise<void> {
  try {
    const { error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: contactEmail,
      subject: emailCopy[props.locale].shippingSubject(props.orderNumber),
      react: ShippingNotificationEmail(props),
    });
    if (error) console.error("sendShippingNotificationEmail failed:", error);
  } catch (error) {
    console.error("sendShippingNotificationEmail failed:", error);
  }
}
