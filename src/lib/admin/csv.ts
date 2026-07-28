// Hand-rolled RFC 4180 CSV: trivial enough not to warrant a dependency.
function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(rows: Record<string, string | number>[], columns: string[]): string {
  const header = columns.map(escapeCsvField).join(",");
  const lines = rows.map((row) =>
    columns.map((column) => escapeCsvField(String(row[column] ?? ""))).join(",")
  );
  return [header, ...lines].join("\r\n") + "\r\n";
}
