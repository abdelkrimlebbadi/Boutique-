import type { ElementType, ReactNode } from "react";

// Not the storefront's Container — wider max-width, admin's own tokens.
// Kept as a separate component (not a shared one) to keep the two design
// systems fully decoupled.
export function AdminContainer({
  as: Component = "div",
  children,
  className = "",
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Component
      className={`mx-auto w-full max-w-(--admin-container-max) px-(--admin-container-pad) ${className}`}
    >
      {children}
    </Component>
  );
}
