import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { emailCopy } from "./copy";
import { formatMoney } from "@/lib/currency/format-money";
import type { Currency } from "@/lib/currency/constants";
import type { Locale } from "@/i18n/routing";

export type OrderConfirmationEmailProps = {
  locale: Locale;
  orderNumber: string;
  currency: Currency;
  items: { name: string; variantLabel: string | null; quantity: number; lineTotalCents: number }[];
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  shippingAddress: { fullName: string; line1: string; line2: string | null; city: string; postalCode: string; countryCode: string };
};

export function OrderConfirmationEmail(props: OrderConfirmationEmailProps) {
  const t = emailCopy[props.locale];
  const money = (cents: number) => formatMoney(cents, props.currency, props.locale);

  return (
    <Html>
      <Head />
      <Preview>{t.orderConfirmationIntro(props.orderNumber)}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#fbfaf7" }}>
        <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 16px" }}>
          <Heading style={{ fontSize: "22px" }}>{t.orderConfirmationTitle}</Heading>
          <Text>{t.orderConfirmationIntro(props.orderNumber)}</Text>

          <Section style={{ marginTop: "16px" }}>
            <Text style={{ fontWeight: 600, marginBottom: "4px" }}>{t.itemsHeading}</Text>
            {props.items.map((item, index) => (
              <Row key={index} style={{ marginBottom: "4px" }}>
                <Column>
                  <Text style={{ margin: 0 }}>
                    {item.name}
                    {item.variantLabel ? ` — ${item.variantLabel}` : ""} × {item.quantity}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={{ margin: 0 }}>{money(item.lineTotalCents)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr />

          <Row>
            <Column><Text style={{ margin: 0 }}>{t.subtotal}</Text></Column>
            <Column align="right"><Text style={{ margin: 0 }}>{money(props.subtotalCents)}</Text></Column>
          </Row>
          <Row>
            <Column><Text style={{ margin: 0 }}>{t.shipping}</Text></Column>
            <Column align="right"><Text style={{ margin: 0 }}>{money(props.shippingCents)}</Text></Column>
          </Row>
          {props.discountCents > 0 && (
            <Row>
              <Column><Text style={{ margin: 0 }}>{t.discount}</Text></Column>
              <Column align="right"><Text style={{ margin: 0 }}>-{money(props.discountCents)}</Text></Column>
            </Row>
          )}
          <Row>
            <Column><Text style={{ margin: 0, fontWeight: 600 }}>{t.total}</Text></Column>
            <Column align="right"><Text style={{ margin: 0, fontWeight: 600 }}>{money(props.totalCents)}</Text></Column>
          </Row>

          <Hr />

          <Text style={{ fontWeight: 600, marginBottom: "4px" }}>{t.shippingAddressHeading}</Text>
          <Text style={{ margin: 0 }}>{props.shippingAddress.fullName}</Text>
          <Text style={{ margin: 0 }}>{props.shippingAddress.line1}</Text>
          {props.shippingAddress.line2 && <Text style={{ margin: 0 }}>{props.shippingAddress.line2}</Text>}
          <Text style={{ margin: 0 }}>
            {props.shippingAddress.postalCode} {props.shippingAddress.city}, {props.shippingAddress.countryCode}
          </Text>

          <Hr />
          <Text style={{ fontSize: "12px", color: "#7d735c" }}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OrderConfirmationEmail;
