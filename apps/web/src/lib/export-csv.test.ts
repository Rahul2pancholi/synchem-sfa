import { describe, expect, it } from 'vitest';
import { buildCsvContent, reportCsvFilename } from './export-csv';

describe('export-csv', () => {
  it('builds UTF-8 BOM csv with headers', () => {
    const content = buildCsvContent(
      [
        { header: 'Name', value: (row) => row.name },
        { header: 'Qty', value: (row) => row.qty },
      ],
      [
        { name: 'Amit', qty: 2 },
        { name: 'Rahul', qty: null },
      ],
    );

    expect(content.startsWith('\uFEFF')).toBe(true);
    expect(content).toContain('Name,Qty');
    expect(content).toContain('Amit,2');
    expect(content).toContain('Rahul,');
  });

  it('formats report filename with month padding', () => {
    expect(reportCsvFilename('sales-summary', 6, 2026)).toBe('sales-summary-2026-06.csv');
  });
});
