import { z } from 'zod';
import { ReportFilterSchema } from './reports';

export const SalesInsightSeveritySchema = z.enum(['info', 'warning', 'critical']);
export type SalesInsightSeverity = z.infer<typeof SalesInsightSeveritySchema>;

export const SalesInsightRuleIdSchema = z.enum([
  'TEAM_LOW_COVERAGE',
  'LOW_COVERAGE_OVERALL',
  'MISSED_CALLS',
  'LOW_POB_ACHIEVEMENT',
  'TEAM_LOW_ACHIEVEMENT',
  'HIGH_VISITS_LOW_ACHIEVEMENT',
]);
export type SalesInsightRuleId = z.infer<typeof SalesInsightRuleIdSchema>;

export interface SalesInsightCard {
  ruleId: SalesInsightRuleId;
  severity: SalesInsightSeverity;
  messageKey: string;
  params: Record<string, string | number>;
  actionPath?: string;
}

export interface ManagerSalesInsights {
  month: number;
  year: number;
  insights: SalesInsightCard[];
}

export const SalesInsightsFilterSchema = ReportFilterSchema;
export type SalesInsightsFilter = z.infer<typeof SalesInsightsFilterSchema>;

export const SALES_INSIGHT_THRESHOLDS = {
  lowCoveragePct: 70,
  lowPobAchievementPct: 80,
  highVisitsMin: 15,
  lowAchievementWithHighVisitsPct: 50,
  missedCallsWarning: 5,
} as const;
