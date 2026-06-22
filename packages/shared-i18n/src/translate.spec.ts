import { APP_LANGUAGES, resolveAppLanguage } from './locales';
import { MESSAGES, MESSAGE_KEYS } from './messages/index';
import { translate } from './translate';

describe('resolveAppLanguage', () => {
  it('maps English variants', () => {
    expect(resolveAppLanguage('en')).toBe('en');
    expect(resolveAppLanguage('en-IN')).toBe('en');
  });

  it('maps Hindi variants', () => {
    expect(resolveAppLanguage('hi')).toBe('hi');
    expect(resolveAppLanguage('hi-IN')).toBe('hi');
  });

  it('maps Hinglish variants', () => {
    expect(resolveAppLanguage('hinglish')).toBe('hinglish');
    expect(resolveAppLanguage('hi-Latn')).toBe('hinglish');
    expect(resolveAppLanguage('hi-en')).toBe('hinglish');
  });

  it('defaults unknown values to English', () => {
    expect(resolveAppLanguage(undefined)).toBe('en');
    expect(resolveAppLanguage('fr')).toBe('en');
  });
});

describe('message catalogs', () => {
  it('defines every message key in all supported languages', () => {
    for (const language of APP_LANGUAGES) {
      for (const key of MESSAGE_KEYS) {
        const value = MESSAGES[language][key];
        expect(value).toBeTruthy();
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('returns mixed Hindi copy for auth errors', () => {
    expect(translate('auth.login.invalidCredentials', 'hi')).toContain('Galat');
  });

  it('returns Hinglish copy for forgot password link', () => {
    expect(translate('auth.login.forgotPassword', 'hinglish')).toContain('bhool');
  });

  it('falls back to English for unknown keys', () => {
    expect(translate('auth.login.title', 'en')).toBe('Synchem SFA');
  });
});
