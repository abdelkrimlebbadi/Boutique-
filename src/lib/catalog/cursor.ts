export type Cursor = { v: string | number; id: string };

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeCursor(value: string): Cursor | null {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    );
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "v" in parsed &&
      "id" in parsed
    ) {
      return parsed as Cursor;
    }
    return null;
  } catch {
    return null;
  }
}
