'use client';

import { ReactNode } from 'react';
import { ReduxProvider } from './ReduxProvider';
import { ThemeProvider } from '../layout/ThemeProvider';

type ProvidersProps = {
  children: ReactNode;
};

/**
 * Combined providers component
 * Wraps the application with all required providers in the correct order
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </ReduxProvider>
  );
}
