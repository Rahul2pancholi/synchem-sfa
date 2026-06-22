import Papa from 'papaparse';

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

export function buildCsvContent<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const fields = columns.map((col) => col.header);
  const data = rows.map((row) =>
    columns.reduce<Record<string, string>>((acc, col) => {
      const raw = col.value(row);
      acc[col.header] = raw === null || raw === undefined ? '' : String(raw);
      return acc;
    }, {}),
  );

  const csv = Papa.unparse(data, { columns: fields });
  return `\uFEFF${csv}`;
}

export function downloadReportCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]) {
  const content = buildCsvContent(columns, rows);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function reportCsvFilename(slug: string, month: number, year: number) {
  const mm = String(month).padStart(2, '0');
  return `${slug}-${year}-${mm}.csv`;
}
