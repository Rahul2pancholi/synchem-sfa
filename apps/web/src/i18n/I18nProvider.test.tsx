import { render, screen } from '@testing-library/react';
import { I18nProvider, useI18n } from './I18nProvider';

function Probe() {
  const { t, language } = useI18n();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="label">{t('auth.login.forgotPassword')}</span>
    </div>
  );
}

describe('I18nProvider', () => {
  it('defaults to English labels', () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('label').textContent).toBe('Forgot password?');
  });

  it('restores saved Hinglish preference', () => {
    localStorage.setItem('appLanguage', 'hinglish');

    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('lang').textContent).toBe('hinglish');
    expect(screen.getByTestId('label').textContent).toContain('bhool');
  });
});
