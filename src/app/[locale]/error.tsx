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
      <h1 className="font-display text-2xl font-semibold text-neutral-900">
        Something went wrong
      </h1>
      <p className="text-neutral-600">Please try again in a moment.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex h-11 items-center border border-neutral-900 px-6 text-sm font-medium text-neutral-900 transition-colors duration-(--duration-base) hover:border-accent-600 hover:text-accent-600"
      >
        Retry
      </button>
    </div>
  );
}
