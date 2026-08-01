import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import { emailCopy } from "./copy";
import type { Locale } from "@/i18n/routing";

export type ShippingNotificationEmailProps = {
  locale: Locale;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string | null;
};

export function ShippingNotificationEmail(props: ShippingNotificationEmailProps) {
  const t = emailCopy[props.locale];

  return (
    <Html>
      <Head />
      <Preview>{t.shippingIntro(props.orderNumber)}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#fbfaf7" }}>
        <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 16px" }}>
          <Heading style={{ fontSize: "22px" }}>{t.shippingTitle}</Heading>
          <Text>{t.shippingIntro(props.orderNumber)}</Text>
          {props.carrier && (
            <Text>
              {t.carrierLabel}: {props.carrier}
            </Text>
          )}
          <Text>{props.trackingNumber}</Text>
          <Button
            href={props.trackingUrl}
            style={{
              backgroundColor: "#1f1b14",
              color: "#fbfaf7",
              padding: "12px 24px",
              fontSize: "14px",
            }}
          >
            {t.trackingCta}
          </Button>
          <Hr />
          <Text style={{ fontSize: "12px", color: "#7d735c" }}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ShippingNotificationEmail;
