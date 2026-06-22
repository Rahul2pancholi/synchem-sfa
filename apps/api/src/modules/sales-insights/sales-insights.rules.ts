import {
  type ManagerSalesKpis,
  type SalesInsightCard,
  SALES_INSIGHT_THRESHOLDS,
} from '@synchem-sfa/shared-types';

export interface TeamInsightContext {
  lowCoverageCount: number;
  lowAchievementCount: number;
}

export function evaluateSalesInsights(
  kpis: ManagerSalesKpis,
  team: TeamInsightContext,
): SalesInsightCard[] {
  const insights: SalesInsightCard[] = [];
  const t = SALES_INSIGHT_THRESHOLDS;

  if (team.lowCoverageCount > 0) {
    insights.push({
      ruleId: 'TEAM_LOW_COVERAGE',
      severity: team.lowCoverageCount >= 3 ? 'critical' : 'warning',
      messageKey: 'salesInsights.teamLowCoverage',
      params: {
        count: team.lowCoverageCount,
        threshold: t.lowCoveragePct,
      },
      actionPath: '/app/report/visit-summary',
    });
  }

  if (kpis.plannedDoctorCalls > 0 && kpis.coveragePct < t.lowCoveragePct) {
    insights.push({
      ruleId: 'LOW_COVERAGE_OVERALL',
      severity: kpis.coveragePct < 50 ? 'critical' : 'warning',
      messageKey: 'salesInsights.lowCoverageOverall',
      params: {
        coveragePct: kpis.coveragePct,
        threshold: t.lowCoveragePct,
      },
      actionPath: '/app/report/missedCallReport',
    });
  }

  if (kpis.missedCallCount >= t.missedCallsWarning) {
    insights.push({
      ruleId: 'MISSED_CALLS',
      severity: 'warning',
      messageKey: 'salesInsights.missedCalls',
      params: { count: kpis.missedCallCount },
      actionPath: '/app/report/missedCallReport',
    });
  } else if (kpis.missedCallCount > 0) {
    insights.push({
      ruleId: 'MISSED_CALLS',
      severity: 'info',
      messageKey: 'salesInsights.missedCalls',
      params: { count: kpis.missedCallCount },
      actionPath: '/app/report/missedCallReport',
    });
  }

  if (kpis.amountTarget > 0 && kpis.pobAchievementPct < t.lowPobAchievementPct) {
    insights.push({
      ruleId: 'LOW_POB_ACHIEVEMENT',
      severity: kpis.pobAchievementPct < 50 ? 'critical' : 'warning',
      messageKey: 'salesInsights.lowPobAchievement',
      params: {
        achievementPct: kpis.pobAchievementPct,
        threshold: t.lowPobAchievementPct,
      },
      actionPath: '/app/report/employeeTargetAchievement',
    });
  }

  if (
    kpis.doctorVisits >= t.highVisitsMin &&
    kpis.amountTarget > 0 &&
    kpis.pobAchievementPct < t.lowAchievementWithHighVisitsPct
  ) {
    insights.push({
      ruleId: 'HIGH_VISITS_LOW_ACHIEVEMENT',
      severity: 'warning',
      messageKey: 'salesInsights.highVisitsLowAchievement',
      params: {
        visits: kpis.doctorVisits,
        achievementPct: kpis.pobAchievementPct,
      },
      actionPath: '/app/report/salesSummary',
    });
  }

  if (team.lowAchievementCount > 0) {
    insights.push({
      ruleId: 'TEAM_LOW_ACHIEVEMENT',
      severity: 'info',
      messageKey: 'salesInsights.teamLowAchievement',
      params: {
        count: team.lowAchievementCount,
        threshold: t.lowPobAchievementPct,
      },
      actionPath: '/app/report/employeeTargetAchievement',
    });
  }

  return insights;
}
