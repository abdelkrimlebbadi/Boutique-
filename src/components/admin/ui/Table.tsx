import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

// Row separators only (border-b), no vertical cell borders — keeps a
// dense table readable without a full grid. Thead gets a thicker rule to
// separate header from body without any background fill.
export function Table({ className = "", ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={`w-full border-collapse text-sm ${className}`} {...props} />;
}

export function Thead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

export function Tbody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function Tr({ className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={className} {...props} />;
}

export function Th({
  className = "",
  align = "left",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" }) {
  return (
    <th
      className={
        "border-b-2 border-black px-3 py-2 font-medium " +
        (align === "right" ? "text-right tabular-nums " : "text-left ") +
        className
      }
      {...props}
    />
  );
}

export function Td({
  className = "",
  align = "left",
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" }) {
  return (
    <td
      className={
        "border-b border-black px-3 py-2 " +
        (align === "right" ? "text-right tabular-nums " : "text-left ") +
        className
      }
      {...props}
    />
  );
}
