import { notFound } from "next/navigation";
import { getOrderDetail } from "@/lib/admin/orders-query";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/admin/ui/Table";
import { RefundForm } from "@/components/admin/orders/RefundForm";
import { PrintfulStatusPanel } from "@/components/admin/orders/PrintfulStatusPanel";
import { FlagOrderToggle } from "@/components/admin/orders/FlagOrderToggle";

const NEGATIVE_STATUSES = new Set(["cancelled", "refunded", "failed"]);
const REFUNDABLE_STATUSES = new Set(["paid", "processing", "shipped", "delivered"]);

function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}

type AddressSnapshot = {
  fullName?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string | null;
  postalCode?: string;
  countryCode?: string;
  phone?: string | null;
};

function AddressBlock({ title, address }: { title: string; address: AddressSnapshot | null }) {
  if (!address) return null;
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">{title}</p>
      <p>{address.fullName}</p>
      <p>{address.line1}</p>
      {address.line2 && <p>{address.line2}</p>}
      <p>
        {address.postalCode} {address.city}
        {address.state ? `, ${address.state}` : ""}
      </p>
      <p>{address.countryCode}</p>
      {address.phone && <p>{address.phone}</p>}
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const detail = await getOrderDetail(orderId);
  if (!detail) notFound();

  const { order, items } = detail;

  return (
    <AdminContainer>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">{order.order_number}</h1>
          <p className="text-sm text-neutral-500">
            {new Date(order.created_at).toLocaleString("fr-FR")}
          </p>
        </div>
        <StatusChip negative={NEGATIVE_STATUSES.has(order.status)}>{order.status}</StatusChip>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-2 font-display text-lg font-semibold">Articles</h2>
          <Table>
            <Thead>
              <Tr>
                <Th>Article</Th>
                <Th align="right">Qté</Th>
                <Th align="right">Total</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((item) => (
                <Tr key={item.id}>
                  <Td>
                    {item.name}
                    {item.variant_label ? ` — ${item.variant_label}` : ""}
                    {item.custom_design_url && (
                      <>
                        {" — "}
                        <a
                          href={item.custom_design_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2"
                        >
                          Visuel personnalisé
                        </a>
                      </>
                    )}
                  </Td>
                  <Td align="right">{item.quantity}</Td>
                  <Td align="right">{formatCents(item.line_total_cents, order.currency)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <div className="mt-4 flex flex-col gap-1 border border-black p-4 text-sm">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatCents(order.subtotal_cents, order.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{formatCents(order.shipping_cents, order.currency)}</span>
            </div>
            {order.discount_cents > 0 && (
              <div className="flex justify-between">
                <span>Remise</span>
                <span>-{formatCents(order.discount_cents, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCents(order.total_cents, order.currency)}</span>
            </div>
            {order.refunded_amount_cents != null && (
              <div className="flex justify-between">
                <span>Remboursé</span>
                <span>{formatCents(order.refunded_amount_cents, order.currency)}</span>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 text-sm">
            <AddressBlock title="Adresse de livraison" address={order.shipping_address as AddressSnapshot} />
            <AddressBlock
              title="Adresse de facturation"
              address={(order.billing_address as AddressSnapshot | null) ?? (order.shipping_address as AddressSnapshot)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {items.some((item) => item.custom_design_url) && (
            <div className="border border-black p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-base font-semibold">Modération</h2>
                {order.flagged_by_admin && <StatusChip negative>signalée</StatusChip>}
              </div>
              <FlagOrderToggle orderId={order.id} initialFlagged={order.flagged_by_admin} />
            </div>
          )}

          <div className="border border-black p-4 text-sm">
            <h2 className="mb-2 font-display text-base font-semibold">Paiement</h2>
            <p>Prestataire : {order.payment_provider}</p>
            <p>Référence : {order.payment_ref ?? "—"}</p>
            <p>Contact : {order.contact_email}</p>
          </div>

          {order.payment_ref && REFUNDABLE_STATUSES.has(order.status) && (
            <div className="border border-black p-4">
              <h2 className="mb-2 font-display text-base font-semibold">Remboursement</h2>
              <RefundForm
                orderId={order.id}
                totalCents={order.total_cents}
                currency={order.currency}
              />
            </div>
          )}

          <div className="border border-black p-4 text-sm">
            <h2 className="mb-2 font-display text-base font-semibold">Fulfillment Printful</h2>
            <p>ID Printful : {order.printful_order_id ?? "—"}</p>
            <p>N° de suivi : {order.tracking_number ?? "—"}</p>
            <p>Transporteur : {order.carrier ?? "—"}</p>
            {order.tracking_url && (
              <p>
                <a href={order.tracking_url} className="underline underline-offset-2">
                  Suivre le colis
                </a>
              </p>
            )}
            {order.printful_order_id && (
              <div className="mt-3">
                <PrintfulStatusPanel printfulOrderId={order.printful_order_id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminContainer>
  );
}
