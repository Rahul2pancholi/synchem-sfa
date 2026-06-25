import { buildFallbackReplyText, withReplyText } from './chat-reply-humanizer';

describe('chat-reply-humanizer', () => {
  it('interpolates i18n template into replyText', () => {
    const text = buildFallbackReplyText(
      {
        messageKey: 'chat.answer.coverage',
        params: { pct: 72 },
        actions: [],
      },
      'en',
    );
    expect(text).toContain('72%');
  });

  it('prefers provided replyText over template', () => {
    const reply = withReplyText(
      {
        messageKey: 'chat.answer.help',
        params: {},
        actions: [],
      },
      'en',
      'Sure, I can walk you through that.',
    );
    expect(reply.replyText).toBe('Sure, I can walk you through that.');
  });
});
