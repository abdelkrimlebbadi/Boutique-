export function JsonLd({ data }: { data: object }) {
  // Escaping "<" prevents a "</script>" (or "<!--") inside any string field
  // (product name/description, etc.) from breaking out of the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
