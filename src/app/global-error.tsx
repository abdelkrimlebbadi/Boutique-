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
      <body style={{ background: "#fbfaf7", color: "#1f1b14", margin: 0 }}>
        <div
          style={{
            maxWidth: "32rem",
            margin: "6rem auto",
            padding: "0 1.5rem",
            textAlign: "center",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#5c5442" }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "0.5rem",
              height: "2.75rem",
              padding: "0 1.5rem",
              border: "1px solid #1f1b14",
              background: "transparent",
              color: "#1f1b14",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
