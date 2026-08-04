'use client';

import { useEffect } from 'react';
import { initMixpanel } from './mixpanel';

/**
 * Responsibility: Client-side React Provider for Analytics.
 * Ensures Mixpanel SDK initialization occurs strictly on the client side after component mounting
 * within Next.js App Router applications.
 */

interface MixpanelProviderProps {
  children: React.ReactNode;
}

export function MixpanelProvider({ children }: MixpanelProviderProps) {
  useEffect(() => {
    // Safely initialize Mixpanel SDK on client mount
    initMixpanel();
  }, []);

  return <>{children}</>;
}
