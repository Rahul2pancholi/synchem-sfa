import type { AppLanguage } from '../locales';

export const PHASE9_SALES_INSIGHTS_KEYS = [
  'salesInsights.title',
  'salesInsights.empty',
  'salesInsights.viewReport',
  'salesInsights.teamLowCoverage',
  'salesInsights.lowCoverageOverall',
  'salesInsights.missedCalls',
  'salesInsights.lowPobAchievement',
  'salesInsights.teamLowAchievement',
  'salesInsights.highVisitsLowAchievement',
] as const;

export type Phase9SalesInsightsKey = (typeof PHASE9_SALES_INSIGHTS_KEYS)[number];

type Catalog = Record<Phase9SalesInsightsKey, string>;

const en: Catalog = {
  'salesInsights.title': 'Sales suggestions',
  'salesInsights.empty': 'No action items this month — KPIs look healthy.',
  'salesInsights.viewReport': 'View report',
  'salesInsights.teamLowCoverage':
    '{count} MR(s) have doctor coverage below {threshold}% — review visit summary.',
  'salesInsights.lowCoverageOverall':
    'Team coverage is {coveragePct}% (target {threshold}%+) — check missed calls.',
  'salesInsights.missedCalls': '{count} missed doctor call(s) this month — follow up with MRs.',
  'salesInsights.lowPobAchievement':
    'POB achievement is {achievementPct}% (target {threshold}%+) — focus on order conversion.',
  'salesInsights.teamLowAchievement':
    '{count} MR(s) are below {threshold}% POB achievement — coach on product focus.',
  'salesInsights.highVisitsLowAchievement':
    'High visits ({visits}) but low POB ({achievementPct}%) — improve conversion on calls.',
};

const hinglish: Catalog = {
  'salesInsights.title': 'Sales suggestions',
  'salesInsights.empty': 'Is mahine koi action item nahi — KPIs theek lag rahe hain.',
  'salesInsights.viewReport': 'Report dekho',
  'salesInsights.teamLowCoverage':
    '{count} MR ki doctor coverage {threshold}% se kam hai — visit summary check karo.',
  'salesInsights.lowCoverageOverall':
    'Team coverage {coveragePct}% hai (target {threshold}%+) — missed calls dekho.',
  'salesInsights.missedCalls': '{count} missed doctor call is mahine — MRs ko follow up karo.',
  'salesInsights.lowPobAchievement':
    'POB achievement {achievementPct}% hai (target {threshold}%+) — order conversion par focus.',
  'salesInsights.teamLowAchievement':
    '{count} MR {threshold}% se kam POB achievement par hain — product focus coaching.',
  'salesInsights.highVisitsLowAchievement':
    'Visits zyada ({visits}) par POB kam ({achievementPct}%) — conversion improve karo.',
};

const hi: Catalog = { ...hinglish };

export const PHASE9_SALES_INSIGHTS_MESSAGES: Record<AppLanguage, Catalog> = {
  en,
  hi,
  hinglish,
};
