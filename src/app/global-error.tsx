"use client";

import { useEffect } from "react";

// Catches errors thrown by [locale]/layout.tsx itself (e.g. Supabase
// unreachable while fetching the cart) — a same-segment error.tsx cannot
// catch its own layout's errors, only those of its children. Must render
// its own <html>/<body> since it replaces the root layout when active.
export default function GlobalError({
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
    <html lang="en">
      <body>
        <div
          style={{
            maxWidth: "32rem",
            margin: "6rem auto",
            padding: "0 1.5rem",
            textAlign: "center",
            fontFamily: "sans-serif",
          }}
        >
          <h1>Something went wrong</h1>
          <p>Please try again in a moment.</p>
          <button type="button" onClick={reset}>
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
