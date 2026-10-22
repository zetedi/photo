import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource-variable/inter';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
