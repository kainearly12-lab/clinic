import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { SiteSettingsProvider } from './context/SiteSettingsContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <SiteSettingsProvider>
          <App />
        </SiteSettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);


