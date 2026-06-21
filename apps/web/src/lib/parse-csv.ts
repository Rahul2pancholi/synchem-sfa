import Papa from 'papaparse';

export function parseCsv(text: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });

  return result.data.filter((row) => Object.values(row).some((v) => v));
}
