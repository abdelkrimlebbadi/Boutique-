import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { CountBadge } from "@/components/ui/CountBadge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Design system — Boutique",
  robots: { index: false, follow: false },
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-neutral-200 py-12 first:border-t-0 first:pt-0 lg:py-16">
      <div className="mb-8 max-w-2xl">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        {description && <p className="mt-2 text-neutral-600">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Swatch({
  name,
  varName,
  hex,
  note,
}: {
  name: string;
  varName: string;
  hex: string;
  note?: string;
}) {
  return (
    <div>
      <div
        className="h-20 border border-neutral-200"
        style={{ background: `var(${varName})` }}
      />
      <p className="mt-2 text-sm font-medium">{name}</p>
      <p className="font-mono text-xs text-neutral-500">{hex}</p>
      {note && <p className="mt-1 text-xs text-warning-700">{note}</p>}
    </div>
  );
}

const TYPE_SCALE: { token: string; className: string; sample: string }[] = [
  { token: "text-4xl", className: "text-4xl font-display font-semibold", sample: "Boutique" },
  { token: "text-3xl", className: "text-3xl font-display font-semibold", sample: "Boutique" },
  { token: "text-2xl", className: "text-2xl font-display font-semibold", sample: "Boutique" },
  { token: "text-xl", className: "text-xl font-display font-semibold", sample: "Boutique" },
  { token: "text-lg", className: "text-lg font-body", sample: "Impression à la demande" },
  { token: "text-md", className: "text-md font-body", sample: "Impression à la demande" },
  { token: "text-base", className: "text-base font-body", sample: "Impression à la demande" },
  { token: "text-sm", className: "text-sm font-body", sample: "Impression à la demande" },
  { token: "text-xs", className: "text-xs font-body", sample: "Impression à la demande" },
];

const SPACING_SCALE = [
  { token: "1", rem: "0.25rem" },
  { token: "2", rem: "0.5rem" },
  { token: "3", rem: "0.75rem" },
  { token: "4", rem: "1rem" },
  { token: "6", rem: "1.5rem" },
  { token: "8", rem: "2rem" },
  { token: "12", rem: "3rem" },
  { token: "16", rem: "4rem" },
  { token: "24", rem: "6rem" },
];

export default async function DesignSystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const breadcrumbT = await getTranslations("breadcrumb");

  return (
    <Container className="py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { name: breadcrumbT("home"), path: "" },
          { name: "Design system", path: "/design-system" },
        ]}
      />

      <header className="max-w-2xl border-b border-neutral-200 pb-10">
        <h1 className="font-display text-3xl font-semibold lg:text-4xl">
          Système de design
        </h1>
        <p className="mt-3 text-md text-neutral-600">
          Identité visuelle éditoriale : une seule palette restreinte, deux
          familles typographiques, des micro-interactions sobres (150–200 ms)
          et un contraste AA vérifié sur chaque paire texte/fond.
        </p>
      </header>

      <Section
        title="Couleurs"
        description="1 neutre (pierre chaude) + 1 accent (terracotta) + couleurs sémantiques. Chaque paire texte/fond est vérifiée AA — les tons marqués ci-dessous sont réservés au grand texte, aux icônes ou aux fonds décoratifs, jamais au texte courant."
      >
        <h3 className="mb-4 text-sm font-semibold tracking-wide text-neutral-500 uppercase">
          Neutre
        </h3>
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Swatch name="neutral-0" varName="--color-neutral-0" hex="#FBFAF7" />
          <Swatch name="neutral-100" varName="--color-neutral-100" hex="#F1EEE7" />
          <Swatch name="neutral-200" varName="--color-neutral-200" hex="#E4DFD3" />
          <Swatch name="neutral-300" varName="--color-neutral-300" hex="#CFC7B4" />
          <Swatch
            name="neutral-400"
            varName="--color-neutral-400"
            hex="#A79C82"
            note="2.6:1 — décoratif seulement"
          />
          <Swatch
            name="neutral-500"
            varName="--color-neutral-500"
            hex="#7D735C"
            note="4.5:1 — grand texte / UI seulement"
          />
          <Swatch name="neutral-600" varName="--color-neutral-600" hex="#5C5442" />
          <Swatch name="neutral-700" varName="--color-neutral-700" hex="#453F31" />
          <Swatch name="neutral-800" varName="--color-neutral-800" hex="#2E2A21" />
          <Swatch name="neutral-900" varName="--color-neutral-900" hex="#1F1B14" />
        </div>

        <h3 className="mb-4 text-sm font-semibold tracking-wide text-neutral-500 uppercase">
          Accent
        </h3>
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Swatch name="accent-100" varName="--color-accent-100" hex="#F3DDD2" />
          <Swatch name="accent-500" varName="--color-accent-500" hex="#B5502E" />
          <Swatch name="accent-600" varName="--color-accent-600" hex="#943F22" />
          <Swatch name="accent-700" varName="--color-accent-700" hex="#7A3419" />
        </div>

        <h3 className="mb-4 text-sm font-semibold tracking-wide text-neutral-500 uppercase">
          Sémantiques
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Swatch name="success-700" varName="--color-success-700" hex="#3B4F2C" />
          <Swatch
            name="warning-500"
            varName="--color-warning-500"
            hex="#B98A2E"
            note="3:1 — fond décoratif seulement, utiliser warning-700 pour le texte"
          />
          <Swatch name="danger-700" varName="--color-danger-700" hex="#6E2230" />
          <Swatch name="info-500" varName="--color-info-500" hex="#3D5A73" />
        </div>
      </Section>

      <Section
        title="Typographie"
        description="Fraunces (titres, empattement éditorial à graisse variable) + Work Sans (texte courant et interface)."
      >
        <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              font-display — Fraunces
            </p>
            <p className="font-display text-3xl font-semibold">Aa Bb Cc</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              font-body — Work Sans
            </p>
            <p className="font-body text-3xl">Aa Bb Cc</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {TYPE_SCALE.map((row) => (
            <div
              key={row.token}
              className="flex flex-col gap-1 border-b border-neutral-100 pb-4 last:border-0 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="w-20 shrink-0 font-mono text-xs text-neutral-500">
                {row.token}
              </span>
              <span className={row.className}>{row.sample}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Espacements"
        description="Échelle 4px de Tailwind, utilisée telle quelle (p-1…p-24) — pas d'échelle parallèle à réapprendre."
      >
        <div className="flex flex-col gap-3">
          {SPACING_SCALE.map((row) => (
            <div key={row.token} className="flex items-center gap-4">
              <span className="w-16 shrink-0 font-mono text-xs text-neutral-500">
                p-{row.token}
              </span>
              <div className="h-3 bg-accent-500" style={{ width: row.rem }} />
              <span className="font-mono text-xs text-neutral-400">{row.rem}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Rayons & bordures"
        description="Angles délibérément presque droits — pas de coins arrondis par défaut. Le seul cercle du système sert au badge numérique du panier."
      >
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <div className="h-16 w-16 rounded-xs border border-neutral-900 bg-neutral-100" />
            <p className="mt-2 text-xs text-neutral-500">rounded-xs (1px)</p>
          </div>
          <div>
            <div className="h-16 w-16 rounded-sm border border-neutral-900 bg-neutral-100" />
            <p className="mt-2 text-xs text-neutral-500">rounded-sm (2px)</p>
          </div>
          <div>
            <div className="h-16 w-16 rounded-md border border-neutral-900 bg-neutral-100" />
            <p className="mt-2 text-xs text-neutral-500">rounded-md (3px)</p>
          </div>
          <div>
            <div className="h-16 w-16 rounded-full border border-neutral-900 bg-neutral-100" />
            <p className="mt-2 text-xs text-neutral-500">rounded-full — usage exceptionnel</p>
          </div>
        </div>
      </Section>

      <Section
        title="Boutons"
        description="Transitions 150–200 ms, jamais de scale ni de shadow-lg. Focus visible au clavier uniquement (essayez Tab)."
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Primaire</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="ghost">Discret</Button>
            <Button variant="primary" disabled>
              Désactivé
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="sm">
              Petit
            </Button>
            <Button variant="primary" size="md">
              Moyen
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Champs de formulaire">
        <div className="grid max-w-md grid-cols-1 gap-6">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-neutral-900">Champ texte</span>
            <Input placeholder="vous@exemple.com" />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-neutral-900">Sélecteur</span>
            <Select defaultValue="ma">
              <option value="ma">Maroc</option>
              <option value="fr">France</option>
              <option value="es">España</option>
            </Select>
          </label>
          <div>
            <span className="mb-2 block text-sm font-medium text-neutral-900">
              Filtre à bascule
            </span>
            <div className="flex gap-2">
              <Tag pressed>Noir</Tag>
              <Tag>Blanc</Tag>
              <Tag>M</Tag>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap items-center gap-4">
          <Badge tone="neutral">Nouveau</Badge>
          <Badge tone="accent">Best-seller</Badge>
          <Badge tone="success">En stock</Badge>
          <Badge tone="danger">Épuisé</Badge>
          <CountBadge count={3} />
        </div>
      </Section>

      <Section
        title="Grille éditoriale"
        description="Container à largeur maximale avec gouttières responsives (1.25rem mobile, 2rem tablette, 3rem desktop)."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="aspect-4/5 bg-neutral-100" />
          ))}
        </div>
      </Section>
    </Container>
  );
}
