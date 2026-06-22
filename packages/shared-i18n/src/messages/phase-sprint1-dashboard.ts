import type { AppLanguage } from '../locales';

export const PHASE_SPRINT1_DASHBOARD_KEYS = [
  'dashboard.fs.subtitle',
  'dashboard.fs.todayWork',
  'dashboard.fs.dcrToday',
  'dashboard.fs.dcrDraft',
  'dashboard.fs.pobDraft',
  'dashboard.fs.quickActions',
  'dashboard.fs.statHelp.dcrToday',
  'dashboard.fs.statHelp.dcrDraft',
  'dashboard.fs.statHelp.pobDraft',
  'dashboard.fs.statHelp.quickDcr',
  'dashboard.fs.statHelp.quickPob',
  'dashboard.fs.statHelp.quickRtp',
  'dashboard.fs.statHelp.quickWeekly',
  'dashboard.mgr.salesKpis',
  'dashboard.mgr.pobMtd',
  'dashboard.mgr.pobAchievement',
  'dashboard.mgr.coverage',
  'dashboard.mgr.missedCalls',
  'dashboard.mgr.doctorVisits',
  'dashboard.mgr.statHelp.pobMtd',
  'dashboard.mgr.statHelp.pobAchievement',
  'dashboard.mgr.statHelp.coverage',
  'dashboard.mgr.statHelp.missedCalls',
  'dashboard.mgr.statHelp.doctorVisits',
] as const;

export type PhaseSprint1DashboardKey = (typeof PHASE_SPRINT1_DASHBOARD_KEYS)[number];

type Sprint1DashboardCatalog = Record<PhaseSprint1DashboardKey, string>;

const en: Sprint1DashboardCatalog = {
  'dashboard.fs.subtitle': 'Plan your day, file DCR, and book orders from here.',
  'dashboard.fs.todayWork': "Today's work",
  'dashboard.fs.dcrToday': 'DCR today',
  'dashboard.fs.dcrDraft': 'DCR drafts',
  'dashboard.fs.pobDraft': 'POB drafts',
  'dashboard.fs.quickActions': 'Quick actions',
  'dashboard.fs.statHelp.dcrToday': 'Daily call reports filed for today.',
  'dashboard.fs.statHelp.dcrDraft': 'DCRs saved but not yet submitted for approval.',
  'dashboard.fs.statHelp.pobDraft': 'Personal orders saved but not yet submitted.',
  'dashboard.fs.statHelp.quickDcr': 'Open Daily Call Report to log today’s visits.',
  'dashboard.fs.statHelp.quickPob': 'Open Personal Order Booking to enter product orders.',
  'dashboard.fs.statHelp.quickRtp': 'Open monthly tour programme.',
  'dashboard.fs.statHelp.quickWeekly': 'Open weekly call plan.',
  'dashboard.mgr.salesKpis': 'Sales KPIs (this month)',
  'dashboard.mgr.pobMtd': 'Approved POB (MTD)',
  'dashboard.mgr.pobAchievement': 'POB achievement %',
  'dashboard.mgr.coverage': 'Doctor coverage %',
  'dashboard.mgr.missedCalls': 'Missed calls',
  'dashboard.mgr.doctorVisits': 'Doctor visits',
  'dashboard.mgr.statHelp.pobMtd': 'Total approved personal order value for the current month.',
  'dashboard.mgr.statHelp.pobAchievement': 'Approved POB vs monthly sales target for all MRs.',
  'dashboard.mgr.statHelp.coverage': 'Approved doctor visits vs planned calls from weekly plan.',
  'dashboard.mgr.statHelp.missedCalls': 'Planned doctor calls not completed on the planned date.',
  'dashboard.mgr.statHelp.doctorVisits': 'Doctor visits logged on approved DCRs this month.',
};

const hinglish: Sprint1DashboardCatalog = {
  'dashboard.fs.subtitle': 'Yahan se din plan karo, DCR file karo aur orders book karo.',
  'dashboard.fs.todayWork': 'Aaj ka kaam',
  'dashboard.fs.dcrToday': 'Aaj ka DCR',
  'dashboard.fs.dcrDraft': 'DCR drafts',
  'dashboard.fs.pobDraft': 'POB drafts',
  'dashboard.fs.quickActions': 'Quick actions',
  'dashboard.fs.statHelp.dcrToday': 'Aaj ke liye file ki gayi daily call reports.',
  'dashboard.fs.statHelp.dcrDraft': 'Save ki hui DCR jo abhi submit nahi hui.',
  'dashboard.fs.statHelp.pobDraft': 'Save kiye orders jo abhi submit nahi hue.',
  'dashboard.fs.statHelp.quickDcr': 'Aaj ki visits log karne ke liye DCR kholo.',
  'dashboard.fs.statHelp.quickPob': 'Product orders dalne ke liye POB kholo.',
  'dashboard.fs.statHelp.quickRtp': 'Monthly tour programme kholo.',
  'dashboard.fs.statHelp.quickWeekly': 'Weekly call plan kholo.',
  'dashboard.mgr.salesKpis': 'Sales KPIs (is mahine)',
  'dashboard.mgr.pobMtd': 'Approved POB (MTD)',
  'dashboard.mgr.pobAchievement': 'POB achievement %',
  'dashboard.mgr.coverage': 'Doctor coverage %',
  'dashboard.mgr.missedCalls': 'Missed calls',
  'dashboard.mgr.doctorVisits': 'Doctor visits',
  'dashboard.mgr.statHelp.pobMtd': 'Is mahine ka total approved POB value.',
  'dashboard.mgr.statHelp.pobAchievement': 'Approved POB vs monthly sales target (saare MR).',
  'dashboard.mgr.statHelp.coverage': 'Approved doctor visits vs weekly plan ke planned calls.',
  'dashboard.mgr.statHelp.missedCalls': 'Jo doctor planned the par us din visit nahi hui.',
  'dashboard.mgr.statHelp.doctorVisits': 'Approved DCR par is mahine ki doctor visits.',
};

const hi: Sprint1DashboardCatalog = {
  ...hinglish,
};

export const PHASE_SPRINT1_DASHBOARD_MESSAGES: Record<AppLanguage, Sprint1DashboardCatalog> = {
  en,
  hi,
  hinglish,
};
