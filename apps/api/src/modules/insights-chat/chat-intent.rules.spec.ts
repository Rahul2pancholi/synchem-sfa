import { matchChatIntent } from '@synchem-sfa/shared-types';

describe('matchChatIntent', () => {
  it('routes manager pending approvals', () => {
    expect(matchChatIntent('kitne pending approval hain', 'MAN')).toBe('pending_approvals');
  });

  it('routes field staff pending to my_pending', () => {
    expect(matchChatIntent('pending submit', 'FS')).toBe('my_pending');
  });

  it('detects DCR draft questions', () => {
    expect(matchChatIntent('aaj ka dcr draft dikhao', 'FS')).toBe('my_dcr_drafts');
  });

  it('detects POB questions', () => {
    expect(matchChatIntent('mera POB is mahine', 'FS')).toBe('pob_achievement');
  });

  it('detects missed calls', () => {
    expect(matchChatIntent('missed calls report', 'MAN')).toBe('missed_calls');
  });

  it('detects help', () => {
    expect(matchChatIntent('help me start', 'FS')).toBe('help');
  });

  it('detects DCR submit requests', () => {
    expect(matchChatIntent('dcr submit karo', 'FS')).toBe('submit_dcr');
  });

  it('detects POB submit requests', () => {
    expect(matchChatIntent('pob bhejo', 'FS')).toBe('submit_pob');
  });

  it('returns unknown for unrelated text', () => {
    expect(matchChatIntent('hello there', 'FS')).toBe('unknown');
  });
});
