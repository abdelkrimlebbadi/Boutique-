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

export type PaymentFailedEmailProps = {
  locale: Locale;
  orderNumber: string;
  retryUrl: string;
};

export function PaymentFailedEmail(props: PaymentFailedEmailProps) {
  const t = emailCopy[props.locale];

  return (
    <Html>
      <Head />
      <Preview>{t.failedIntro(props.orderNumber)}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#fbfaf7" }}>
        <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 16px" }}>
          <Heading style={{ fontSize: "22px" }}>{t.failedTitle}</Heading>
          <Text>{t.failedIntro(props.orderNumber)}</Text>
          <Button
            href={props.retryUrl}
            style={{
              backgroundColor: "#1f1b14",
              color: "#fbfaf7",
              padding: "12px 24px",
              fontSize: "14px",
            }}
          >
            {t.retryCta}
          </Button>
          <Hr />
          <Text style={{ fontSize: "12px", color: "#7d735c" }}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PaymentFailedEmail;
