import type { Locale } from "@/i18n/routing";

// Emails render outside the Next.js request context (from a webhook
// handler), so they can't use next-intl's request-scoped hooks. A small
// self-contained dictionary is simpler and more honest than threading a
// full message catalog through server-only rendering just for a handful
// of strings.
export const emailCopy: Record<
  Locale,
  {
    orderConfirmationSubject: (orderNumber: string) => string;
    orderConfirmationTitle: string;
    orderConfirmationIntro: (orderNumber: string) => string;
    itemsHeading: string;
    qty: string;
    subtotal: string;
    shipping: string;
    discount: string;
    total: string;
    shippingAddressHeading: string;
    shippingSubject: (orderNumber: string) => string;
    shippingTitle: string;
    shippingIntro: (orderNumber: string) => string;
    trackingCta: string;
    carrierLabel: string;
    failedSubject: (orderNumber: string) => string;
    failedTitle: string;
    failedIntro: (orderNumber: string) => string;
    retryCta: string;
    footer: string;
  }
> = {
  fr: {
    orderConfirmationSubject: (n) => `Confirmation de votre commande ${n}`,
    orderConfirmationTitle: "Merci pour votre commande !",
    orderConfirmationIntro: (n) => `Votre commande ${n} est confirmée.`,
    itemsHeading: "Articles",
    qty: "Qté",
    subtotal: "Sous-total",
    shipping: "Livraison",
    discount: "Remise",
    total: "Total",
    shippingAddressHeading: "Adresse de livraison",
    shippingSubject: (n) => `Votre commande ${n} est expédiée`,
    shippingTitle: "Votre colis est en route",
    shippingIntro: (n) => `Votre commande ${n} a été expédiée.`,
    trackingCta: "Suivre le colis",
    carrierLabel: "Transporteur",
    failedSubject: (n) => `Échec du paiement — commande ${n}`,
    failedTitle: "Le paiement n'a pas abouti",
    failedIntro: (n) => `Le paiement de votre commande ${n} a échoué.`,
    retryCta: "Réessayer le paiement",
    footer: "Boutique — impression à la demande, expédiée depuis le Maroc.",
  },
  en: {
    orderConfirmationSubject: (n) => `Order confirmation ${n}`,
    orderConfirmationTitle: "Thank you for your order!",
    orderConfirmationIntro: (n) => `Your order ${n} is confirmed.`,
    itemsHeading: "Items",
    qty: "Qty",
    subtotal: "Subtotal",
    shipping: "Shipping",
    discount: "Discount",
    total: "Total",
    shippingAddressHeading: "Shipping address",
    shippingSubject: (n) => `Your order ${n} has shipped`,
    shippingTitle: "Your package is on its way",
    shippingIntro: (n) => `Your order ${n} has shipped.`,
    trackingCta: "Track package",
    carrierLabel: "Carrier",
    failedSubject: (n) => `Payment failed — order ${n}`,
    failedTitle: "Your payment didn't go through",
    failedIntro: (n) => `Payment for your order ${n} failed.`,
    retryCta: "Retry payment",
    footer: "Boutique — print-on-demand, shipped from Morocco.",
  },
  es: {
    orderConfirmationSubject: (n) => `Confirmación de tu pedido ${n}`,
    orderConfirmationTitle: "¡Gracias por tu pedido!",
    orderConfirmationIntro: (n) => `Tu pedido ${n} está confirmado.`,
    itemsHeading: "Artículos",
    qty: "Cant.",
    subtotal: "Subtotal",
    shipping: "Envío",
    discount: "Descuento",
    total: "Total",
    shippingAddressHeading: "Dirección de envío",
    shippingSubject: (n) => `Tu pedido ${n} ha sido enviado`,
    shippingTitle: "Tu paquete está en camino",
    shippingIntro: (n) => `Tu pedido ${n} ha sido enviado.`,
    trackingCta: "Seguir el paquete",
    carrierLabel: "Transportista",
    failedSubject: (n) => `Pago fallido — pedido ${n}`,
    failedTitle: "Tu pago no se ha completado",
    failedIntro: (n) => `El pago de tu pedido ${n} ha fallado.`,
    retryCta: "Reintentar el pago",
    footer: "Boutique — impresión bajo demanda, enviada desde Marruecos.",
  },
  ar: {
    orderConfirmationSubject: (n) => `تأكيد طلبك ${n}`,
    orderConfirmationTitle: "شكرًا لطلبك!",
    orderConfirmationIntro: (n) => `تم تأكيد طلبك ${n}.`,
    itemsHeading: "المنتجات",
    qty: "الكمية",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    discount: "الخصم",
    total: "المجموع",
    shippingAddressHeading: "عنوان الشحن",
    shippingSubject: (n) => `تم شحن طلبك ${n}`,
    shippingTitle: "طردك في الطريق",
    shippingIntro: (n) => `تم شحن طلبك ${n}.`,
    trackingCta: "تتبع الطرد",
    carrierLabel: "شركة الشحن",
    failedSubject: (n) => `فشل الدفع — الطلب ${n}`,
    failedTitle: "لم تكتمل عملية الدفع",
    failedIntro: (n) => `فشلت عملية الدفع لطلبك ${n}.`,
    retryCta: "إعادة محاولة الدفع",
    footer: "بوتيك — طباعة عند الطلب، تُشحن من المغرب.",
  },
};
