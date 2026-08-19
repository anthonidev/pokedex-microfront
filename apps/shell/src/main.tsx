import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { applyTheme, getStoredTheme } from '@acity/shared';
import { Toaster } from '@/components/ui/sonner';
import './index.css';
import App from './App.tsx';

// Applied before first paint (not in a useEffect) to avoid a light-mode flash on load.
applyTheme(getStoredTheme());

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Toaster lives outside <App /> (the router) — it's a pure UI portal with no router
          dependency, and `RouterProvider` (see App.tsx) leaves no slot for siblings inside it. */}
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
