import { resolveAppLanguage } from '@synchem-sfa/shared-i18n';
import { resolveRequestLanguage } from './language.util';

describe('resolveRequestLanguage', () => {
  it('prefers x-app-language header', () => {
    expect(
      resolveRequestLanguage({
        'x-app-language': 'hinglish',
        'accept-language': 'hi-IN',
      }),
    ).toBe('hinglish');
  });

  it('falls back to accept-language', () => {
    expect(resolveRequestLanguage({ 'accept-language': 'hi-IN,en;q=0.9' })).toBe('hi');
  });
});

describe('resolveAppLanguage', () => {
  it('supports all product languages', () => {
    expect(resolveAppLanguage('en')).toBe('en');
    expect(resolveAppLanguage('hi')).toBe('hi');
    expect(resolveAppLanguage('hinglish')).toBe('hinglish');
  });
});
