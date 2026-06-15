'use client';

import { Toaster as Sonner, toast } from 'sonner';

// Export toast and Toaster for app-wide use
export { toast };

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: '#1a1a2e',
          color: '#f0f0f5',
          border: '1px solid #27272a',
        },
      }}
    />
  );
}
