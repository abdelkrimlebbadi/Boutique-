"use client";

import { useState, useTransition, type FormEvent } from "react";
import { unstable_rethrow } from "next/navigation";
import { saveProduct } from "@/actions/admin/products";
import { Input } from "@/components/admin/ui/Input";
import { Select } from "@/components/admin/ui/Select";
import { Checkbox } from "@/components/admin/ui/Checkbox";
import { Button } from "@/components/admin/ui/Button";
import { TranslationBlock } from "./TranslationBlock";
import { VariantsEditor } from "./VariantsEditor";
import { ImagesEditor } from "./ImagesEditor";
import { CategoryPicker } from "./CategoryPicker";
import type { ProductEditData, CategoryOption } from "@/lib/admin/products-query";

export function ProductForm({
  initial,
  categoryOptions,
}: {
  initial: ProductEditData;
  categoryOptions: CategoryOption[];
}) {
  const [form, setForm] = useState<ProductEditData>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await saveProduct(form);
        if (result?.error) setError(result.error);
      } catch (submitError) {
        unstable_rethrow(submitError);
        setError("Une erreur est survenue.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <fieldset className="border border-black p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide">Général</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm">
            <span>Slug</span>
            <Input
              required
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Statut</span>
            <Select
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as ProductEditData["status"] })
              }
            >
              <option value="draft">Brouillon</option>
              <option value="active">Actif</option>
              <option value="archived">Archivé</option>
            </Select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Coût de base Printful (cents USD)</span>
            <Input
              type="number"
              min={0}
              value={form.baseCostUsd}
              onChange={(event) => setForm({ ...form, baseCostUsd: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>ID produit Printful (sync)</span>
            <Input
              value={form.printfulVariantId ?? ""}
              onChange={(event) =>
                setForm({ ...form, printfulVariantId: event.target.value || null })
              }
            />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.isBestseller}
            onChange={(event) => setForm({ ...form, isBestseller: event.target.checked })}
          />
          Best-seller
        </label>
      </fieldset>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Traductions</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {form.translations.map((translation, index) => (
            <TranslationBlock
              key={translation.locale}
              value={translation}
              onChange={(next) =>
                setForm({
                  ...form,
                  translations: form.translations.map((t, i) => (i === index ? next : t)),
                })
              }
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Variantes</h2>
        <VariantsEditor
          value={form.variants}
          onChange={(variants) => setForm({ ...form, variants })}
        />
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Images</h2>
        <ImagesEditor value={form.images} onChange={(images) => setForm({ ...form, images })} />
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Catégories</h2>
        <CategoryPicker
          options={categoryOptions}
          value={form.categoryIds}
          onChange={(categoryIds) => setForm({ ...form, categoryIds })}
        />
      </div>

      {error && <p className="text-sm">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
