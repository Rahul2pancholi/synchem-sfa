import type { AppLanguage } from '../locales';

export const PHASE_CHAT_HUMAN_KEYS = [
  'chat.assistantName',
  'chat.welcome',
  'chat.welcomeSubtitle',
  'chat.suggest.mr.dcr',
  'chat.suggest.mr.drafts',
  'chat.suggest.mr.pob',
  'chat.suggest.mgr.pending',
  'chat.suggest.mgr.coverage',
  'chat.suggest.mgr.missed',
  'chat.suggest.ad.help',
  'chat.clear',
] as const;

export type PhaseChatHumanKey = (typeof PHASE_CHAT_HUMAN_KEYS)[number];

type Catalog = Record<PhaseChatHumanKey, string>;

const en: Catalog = {
  'chat.assistantName': 'Priya',
  'chat.welcome': 'Hi! I’m Priya, your field sales assistant.',
  'chat.welcomeSubtitle':
    'Ask me about your DCR, POB, approvals, or coverage — in plain language.',
  'chat.suggest.mr.dcr': 'Open today’s DCR',
  'chat.suggest.mr.drafts': 'Show my draft DCRs',
  'chat.suggest.mr.pob': 'How is my POB this month?',
  'chat.suggest.mgr.pending': 'What needs my approval?',
  'chat.suggest.mgr.coverage': 'Team coverage this month',
  'chat.suggest.mgr.missed': 'Who missed calls this week?',
  'chat.suggest.ad.help': 'How do I use Synchem SFA?',
  'chat.clear': 'Clear chat',
};

const hinglish: Catalog = {
  'chat.assistantName': 'Priya',
  'chat.welcome': 'Hi! Main Priya hoon, aapki field sales assistant.',
  'chat.welcomeSubtitle':
    'DCR, POB, approvals ya coverage ke baare me seedha poochho — simple language me.',
  'chat.suggest.mr.dcr': 'Aaj ka DCR kholo',
  'chat.suggest.mr.drafts': 'Mere draft DCR dikhao',
  'chat.suggest.mr.pob': 'Is mahine mera POB kaisa hai?',
  'chat.suggest.mgr.pending': 'Mere approval me kya pending hai?',
  'chat.suggest.mgr.coverage': 'Team coverage is mahine',
  'chat.suggest.mgr.missed': 'Is hafte kisne calls miss ki?',
  'chat.suggest.ad.help': 'Synchem SFA kaise use karein?',
  'chat.clear': 'Chat clear karo',
};

export const PHASE_CHAT_HUMAN_MESSAGES: Record<AppLanguage, Catalog> = {
  en,
  hi: hinglish,
  hinglish,
};
