import { METRIC_BY_ID, SEMANTIC_METRICS } from '../semantic-definitions/metrics';

describe('semantic metrics', () => {
  it('defines at least 8 metrics', () => {
    expect(SEMANTIC_METRICS.length).toBeGreaterThanOrEqual(8);
  });

  it('every template includes comp_code tenant filter', () => {
    for (const metric of SEMANTIC_METRICS) {
      expect(metric.sqlTemplate).toMatch(/:compCode|comp_code\s*=\s*:compCode/i);
      expect(METRIC_BY_ID.has(metric.id)).toBe(true);
    }
  });
});
