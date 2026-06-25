import type { AppLanguage } from '../locales';

export const PHASE_SIMPLIFY_KEYS = [
  'simplify.approvals.hubTitle',
  'simplify.import.title',
  'simplify.import.selectEntity',
  'menu.APP00',
  'menu.MASIMP',
  'menu.TRN',
  'menu.DSH',
] as const;

export type PhaseSimplifyKey = (typeof PHASE_SIMPLIFY_KEYS)[number];

export const PHASE_SIMPLIFY_MESSAGES: Record<AppLanguage, Record<PhaseSimplifyKey, string>> = {
  en: {
    'simplify.approvals.hubTitle': 'Pending approvals',
    'simplify.import.title': 'Import data',
    'simplify.import.selectEntity': 'What do you want to import?',
    'menu.APP00': 'Pending approvals',
    'menu.MASIMP': 'Import data',
    'menu.TRN': 'My work',
    'menu.DSH': 'Home',
  },
  hi: {
    'simplify.approvals.hubTitle': 'Pending approvals',
    'simplify.import.title': 'Data import',
    'simplify.import.selectEntity': 'Kya import karna hai?',
    'menu.APP00': 'Pending approvals',
    'menu.MASIMP': 'Data import',
    'menu.TRN': 'Mera kaam',
    'menu.DSH': 'Home',
  },
  hinglish: {
    'simplify.approvals.hubTitle': 'Pending approvals',
    'simplify.import.title': 'Data import',
    'simplify.import.selectEntity': 'Kya import karna hai?',
    'menu.APP00': 'Pending approvals',
    'menu.MASIMP': 'Data import',
    'menu.TRN': 'Mera kaam',
    'menu.DSH': 'Home',
  },
};
