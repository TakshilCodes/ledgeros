export function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) return "";

  const stringValue =
    value instanceof Date ? value.toISOString() : String(value);

  const escapedValue = stringValue.replace(/"/g, '""');

  return `"${escapedValue}"`;
}

export function convertToCsv<T extends Record<string, unknown>>(
  rows: T[],
  headers: { label: string; key: keyof T }[]
) {
  const csvHeaderRow = headers
    .map((header) => escapeCsvValue(header.label))
    .join(",");

  const csvRows = rows.map((row) =>
    headers.map((header) => escapeCsvValue(row[header.key])).join(",")
  );

  return [csvHeaderRow, ...csvRows].join("\n");
}