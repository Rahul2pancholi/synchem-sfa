import type { AppLanguage } from '../locales';

export const PHASE_WEEK3_KEYS = [
  'chat.answer.dcrDraftList',
  'chat.answer.dcrDraftListToday',
  'chat.answer.pobDraftList',
  'chat.answer.pobDraftListToday',
  'chat.answer.noDcrDrafts',
  'chat.answer.noDcrDraftsToday',
  'chat.answer.noPobDrafts',
  'chat.answer.noPobDraftsToday',
  'chat.item.dcrDraft',
  'chat.item.pobDraft',
] as const;

export type PhaseWeek3Key = (typeof PHASE_WEEK3_KEYS)[number];

type Catalog = Record<PhaseWeek3Key, string>;

const en: Catalog = {
  'chat.answer.dcrDraftList': 'You have {count} DCR draft(s) waiting to submit:',
  'chat.answer.dcrDraftListToday': 'Today’s DCR draft(s) — {count} waiting to submit:',
  'chat.answer.pobDraftList': 'You have {count} order draft(s) waiting to submit:',
  'chat.answer.pobDraftListToday': 'Today’s order draft(s) — {count} waiting to submit:',
  'chat.answer.noDcrDrafts': 'No DCR drafts — you’re clear. Open DCR to log a new visit.',
  'chat.answer.noDcrDraftsToday': 'No DCR draft for today yet. Open DCR to file today’s visit.',
  'chat.answer.noPobDrafts': 'No order drafts — open Doctor Orders when you get an order.',
  'chat.answer.noPobDraftsToday': 'No order draft for today. Open Doctor Orders to book one.',
  'chat.item.dcrDraft': 'DCR {date} · {count} doctors · {status}',
  'chat.item.pobDraft': 'Order {date} · ₹{amount} · {status}',
};

const hinglish: Catalog = {
  'chat.answer.dcrDraftList': 'Aapke {count} DCR draft submit pending hain:',
  'chat.answer.dcrDraftListToday': 'Aaj ke DCR draft — {count} submit pending:',
  'chat.answer.pobDraftList': 'Aapke {count} order draft submit pending hain:',
  'chat.answer.pobDraftListToday': 'Aaj ke order draft — {count} submit pending:',
  'chat.answer.noDcrDrafts': 'Koi DCR draft nahi — sab clear. Naya visit log karne ke liye DCR kholo.',
  'chat.answer.noDcrDraftsToday': 'Aaj ka DCR draft nahi hai. Aaj ka visit file karne ke liye DCR kholo.',
  'chat.answer.noPobDrafts': 'Koi order draft nahi — order mile to Doctor Orders kholo.',
  'chat.answer.noPobDraftsToday': 'Aaj ka order draft nahi. Doctor Orders se book karo.',
  'chat.item.dcrDraft': 'DCR {date} · {count} doctors · {status}',
  'chat.item.pobDraft': 'Order {date} · ₹{amount} · {status}',
};

const hi: Catalog = { ...hinglish };

export const PHASE_WEEK3_MESSAGES: Record<AppLanguage, Catalog> = {
  en,
  hi,
  hinglish,
};
