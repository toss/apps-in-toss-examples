import { createRoot } from 'react-dom/client';
import { TDSMobileAITProvider } from '@toss-design-system/mobile-ait';
import { App } from '@/App.tsx';
import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <TDSMobileAITProvider>
    <App />
  </TDSMobileAITProvider>
);
