"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { uploadDesignImage } from "@/actions/customize";
import { sniffImage, MAX_UPLOAD_BYTES } from "@/lib/uploads/sniff-image";
import { Button } from "@/components/ui/Button";

export function DesignUploadField({
  onUploaded,
  disabled = false,
}: {
  onUploaded: (url: string) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("product.customize");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);

    if (file.size > MAX_UPLOAD_BYTES) {
      setError(t("uploadTooLarge"));
      return;
    }

    // Client-side mirror check for instant feedback only — uploadDesignImage
    // re-sniffs the bytes server-side and is the actual gate, since a
    // client-controlled response can't be trusted as validation.
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!sniffImage(bytes)) {
      setError(t("uploadError"));
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      try {
        const result = await uploadDesignImage(formData);
        if ("error" in result) {
          setError(result.error);
          return;
        }
        onUploaded(result.url);
      } catch {
        // A thrown/rejected Server Action call (network blip, a request
        // rejected by the framework before uploadDesignImage's own code
        // runs, ...) must degrade to an inline message, never propagate
        // up to the nearest error boundary and take out the whole page.
        setError(t("uploadFailed"));
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleChange}
        disabled={disabled || isUploading}
        className="hidden"
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? t("uploading") : t("uploadLabel")}
      </Button>
      <p className="text-xs text-neutral-500">{t("uploadHint")}</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
