import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  const dispatchQuotaWarning = () => {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  };

  (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
    dispatchQuotaWarning();
  };

  const originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const joined = args.map((item) => String(item ?? '')).join(' ');
    if (/OverQuotaMapError|QuotaExceededError/i.test(joined)) {
      dispatchQuotaWarning();
    }
    originalConsoleError(...args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
