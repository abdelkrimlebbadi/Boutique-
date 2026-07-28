"use client";

import { useEffect } from "react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-black/60 dark:text-white/60">
        Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md border border-black/10 px-4 py-2 text-sm dark:border-white/20"
      >
        Retry
      </button>
    </div>
  );
}
