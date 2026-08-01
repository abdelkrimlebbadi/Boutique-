import { getDashboardMetrics } from "@/lib/admin/dashboard-metrics";
import { PeriodSelector } from "@/components/admin/dashboard/PeriodSelector";
import { CurrencyTabs } from "@/components/admin/dashboard/CurrencyTabs";
import { RankedBarList } from "@/components/admin/charts/RankedBarList";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";

function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}

function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const defaults = defaultRange();
  const from = params.from ?? defaults.from;
  const to = params.to ?? defaults.to;

  const metrics = await getDashboardMetrics({ from, to });

  const totalOrders = Object.values(metrics.perCurrency)
    .flat()
    .reduce((sum, point) => sum + point.orderCount, 0);

  return (
    <AdminContainer>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <PeriodSelector from={from} to={to} />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border border-black p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Commandes</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{totalOrders}</p>
        </div>
        <div className="border border-black p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Panier moyen</p>
          {Object.keys(metrics.aov).length === 0 ? (
            <p className="mt-1 font-display text-2xl font-semibold">—</p>
          ) : (
            <ul className="mt-1">
              {Object.entries(metrics.aov).map(([currency, cents]) => (
                <li key={currency} className="font-display text-lg font-semibold tabular-nums">
                  {formatCents(cents, currency)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border border-black p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Taux de conversion (panier → commande)
          </p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
            {(metrics.conversionRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="border border-black p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Devises actives</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
            {Object.keys(metrics.perCurrency).length}
          </p>
        </div>
      </div>

      <div className="mb-8 border border-black p-4">
        <h2 className="mb-3 font-display text-lg font-semibold">CA par jour</h2>
        <CurrencyTabs perCurrency={metrics.perCurrency} />
      </div>

      <div className="border border-black p-4">
        <h2 className="mb-3 font-display text-lg font-semibold">Top produits</h2>
        <RankedBarList
          items={metrics.topProducts.map((product) => ({
            label: product.name,
            value: product.revenueCents / 100,
            secondaryLabel: `×${product.quantity}`,
          }))}
          valueFormatter={(value) => Math.round(value).toLocaleString("fr-FR")}
        />
      </div>
    </AdminContainer>
  );
}
