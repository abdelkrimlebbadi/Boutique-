"use client";

import { useRef, useState, useTransition } from "react";
import { uploadProductImage } from "@/actions/admin/products";
import { Input } from "@/components/admin/ui/Input";
import { Button } from "@/components/admin/ui/Button";
import type { ProductEditData } from "@/lib/admin/products-query";

type ImageValue = ProductEditData["images"][number];

export function ImagesEditor({
  value,
  onChange,
}: {
  value: ImageValue[];
  onChange: (next: ImageValue[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProductImage(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      onChange([...value, { url: result.url, alt: null, position: value.length }]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((image, i) => ({ ...image, position: i })));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index).map((image, i) => ({ ...image, position: i })));
  }

  function setAlt(index: number, alt: string) {
    onChange(value.map((image, i) => (i === index ? { ...image, alt: alt || null } : image)));
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {value.map((image, index) => (
          <li key={image.url} className="flex items-center gap-3 border border-black p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin
                tool only, arbitrary external/Storage URLs, next/image's
                remotePatterns allowlist isn't worth maintaining here. */}
            <img src={image.url} alt={image.alt ?? ""} className="h-16 w-16 object-cover" />
            <Input
              value={image.alt ?? ""}
              onChange={(event) => setAlt(index, event.target.value)}
              placeholder="Texte alternatif"
              className="flex-1"
            />
            <div className="flex gap-1">
              <Button type="button" size="sm" onClick={() => move(index, -1)} disabled={index === 0}>
                ↑
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => move(index, 1)}
                disabled={index === value.length - 1}
              >
                ↓
              </Button>
              <Button type="button" size="sm" onClick={() => remove(index)}>
                Retirer
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileSelected}
        disabled={isPending}
      />
      {isPending && <p className="text-xs text-neutral-500">Envoi en cours...</p>}
      {error && <p className="text-sm">{error}</p>}
    </div>
  );
}
