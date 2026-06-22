import type { ManagerSalesKpis } from '@synchem-sfa/shared-types';
import { evaluateSalesInsights } from './sales-insights.rules';

describe('evaluateSalesInsights', () => {
  const baseKpis: ManagerSalesKpis = {
    month: 6,
    year: 2026,
    pobApprovedAmount: 100_000,
    amountTarget: 200_000,
    pobAchievementPct: 49,
    doctorVisits: 20,
    plannedDoctorCalls: 30,
    coveragePct: 67,
    missedCallCount: 6,
  };

  it('flags team low coverage', () => {
    const insights = evaluateSalesInsights(baseKpis, {
      lowCoverageCount: 3,
      lowAchievementCount: 0,
    });
    expect(insights.some((i) => i.ruleId === 'TEAM_LOW_COVERAGE')).toBe(true);
    expect(insights.find((i) => i.ruleId === 'TEAM_LOW_COVERAGE')?.severity).toBe('critical');
  });

  it('flags overall low coverage and missed calls', () => {
    const insights = evaluateSalesInsights(baseKpis, {
      lowCoverageCount: 0,
      lowAchievementCount: 0,
    });
    expect(insights.some((i) => i.ruleId === 'LOW_COVERAGE_OVERALL')).toBe(true);
    expect(insights.some((i) => i.ruleId === 'MISSED_CALLS')).toBe(true);
    expect(insights.some((i) => i.ruleId === 'LOW_POB_ACHIEVEMENT')).toBe(true);
    expect(insights.some((i) => i.ruleId === 'HIGH_VISITS_LOW_ACHIEVEMENT')).toBe(true);
  });

  it('returns empty when KPIs are healthy', () => {
    const healthy: ManagerSalesKpis = {
      ...baseKpis,
      pobAchievementPct: 95,
      coveragePct: 90,
      missedCallCount: 0,
      doctorVisits: 5,
    };
    const insights = evaluateSalesInsights(healthy, {
      lowCoverageCount: 0,
      lowAchievementCount: 0,
    });
    expect(insights).toHaveLength(0);
  });
});
