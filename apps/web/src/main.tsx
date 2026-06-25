import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './app/AppProviders';
import { App } from './App';
import { I18nProvider } from './i18n/I18nProvider';
import { SentryErrorBoundary } from './components/ui/error-boundary';
import { initSentry } from './lib/sentry';
import 'antd/dist/reset.css';
import './index.css';

initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryErrorBoundary>
      <BrowserRouter>
        <I18nProvider>
          <AppProviders>
            <App />
          </AppProviders>
        </I18nProvider>
      </BrowserRouter>
    </SentryErrorBoundary>
  </StrictMode>,
);
