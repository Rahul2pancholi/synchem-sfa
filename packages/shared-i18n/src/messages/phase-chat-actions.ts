import type { AppLanguage } from '../locales';

export const PHASE_CHAT_ACTIONS_KEYS = [
  'chat.action.submitDcr',
  'chat.action.submitPob',
  'chat.answer.submitDcrConfirm',
  'chat.answer.submitPobConfirm',
  'chat.answer.submitDcrPick',
  'chat.answer.submitPobPick',
  'chat.confirm.submitDcr.title',
  'chat.confirm.submitDcr.body',
  'chat.confirm.submitPob.title',
  'chat.confirm.submitPob.body',
  'chat.confirm.submitOk',
  'chat.confirm.submitCancel',
  'chat.submit.successDcr',
  'chat.submit.successPob',
  'chat.submit.error',
  'chat.suggest.mr.submitDcr',
  'chat.suggest.mr.submitPob',
] as const;

export type PhaseChatActionsKey = (typeof PHASE_CHAT_ACTIONS_KEYS)[number];

type Catalog = Record<PhaseChatActionsKey, string>;

const en: Catalog = {
  'chat.action.submitDcr': 'Submit DCR',
  'chat.action.submitPob': 'Submit order',
  'chat.answer.submitDcrConfirm': 'Ready to submit DCR for {date} ({count} doctors)?',
  'chat.answer.submitPobConfirm': 'Ready to submit order for {date} (₹{amount})?',
  'chat.answer.submitDcrPick': 'You have {count} DCR drafts — pick one to submit:',
  'chat.answer.submitPobPick': 'You have {count} order drafts — pick one to submit:',
  'chat.confirm.submitDcr.title': 'Submit DCR?',
  'chat.confirm.submitDcr.body': 'Submit DCR for {date} with {count} doctor visit(s) for manager approval?',
  'chat.confirm.submitPob.title': 'Submit order?',
  'chat.confirm.submitPob.body': 'Submit order for {date} worth ₹{amount}?',
  'chat.confirm.submitOk': 'Yes, submit',
  'chat.confirm.submitCancel': 'Cancel',
  'chat.submit.successDcr': 'DCR submitted for approval.',
  'chat.submit.successPob': 'Order submitted successfully.',
  'chat.submit.error': 'Could not submit. Open the screen and try again.',
  'chat.suggest.mr.submitDcr': 'Submit my DCR draft',
  'chat.suggest.mr.submitPob': 'Submit my order draft',
};

const hinglish: Catalog = {
  'chat.action.submitDcr': 'DCR submit karo',
  'chat.action.submitPob': 'Order submit karo',
  'chat.answer.submitDcrConfirm': 'DCR {date} ({count} doctors) submit karun?',
  'chat.answer.submitPobConfirm': 'Order {date} (₹{amount}) submit karun?',
  'chat.answer.submitDcrPick': 'Aapke {count} DCR draft hain — submit ke liye ek choose karo:',
  'chat.answer.submitPobPick': 'Aapke {count} order draft hain — submit ke liye ek choose karo:',
  'chat.confirm.submitDcr.title': 'DCR submit karein?',
  'chat.confirm.submitDcr.body': '{date} ka DCR ({count} doctors) manager approval ke liye submit karein?',
  'chat.confirm.submitPob.title': 'Order submit karein?',
  'chat.confirm.submitPob.body': '{date} ka order ₹{amount} submit karein?',
  'chat.confirm.submitOk': 'Haan, submit karo',
  'chat.confirm.submitCancel': 'Cancel',
  'chat.submit.successDcr': 'DCR approval ke liye submit ho gaya.',
  'chat.submit.successPob': 'Order submit ho gaya.',
  'chat.submit.error': 'Submit nahi ho paya. Screen kholo aur dubara try karo.',
  'chat.suggest.mr.submitDcr': 'Mera DCR draft submit karo',
  'chat.suggest.mr.submitPob': 'Mera order draft submit karo',
};

export const PHASE_CHAT_ACTIONS_MESSAGES: Record<AppLanguage, Catalog> = {
  en,
  hi: hinglish,
  hinglish,
};
