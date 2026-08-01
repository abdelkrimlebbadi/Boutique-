import type { ElementType, ReactNode } from "react";

// The editorial grid's outer bound: a max-width column with responsive
// gutters (--container-pad, defined in globals.css: 1.25rem mobile,
// 2rem tablet, 3rem desktop).
export function Container({
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
      className={`mx-auto w-full max-w-(--container-max) px-(--container-pad) ${className}`}
    >
      {children}
    </Component>
  );
}
