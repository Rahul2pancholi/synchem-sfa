import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './app/AppProviders';
import { App } from './App';
import { I18nProvider } from './i18n/I18nProvider';
import 'antd/dist/reset.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AppProviders>
          <App />
        </AppProviders>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
);
