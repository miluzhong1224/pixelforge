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
          background: '#ffffff',
          color: '#0d0d0d',
          border: '1px solid #e5e5e5',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      }}
    />
  );
}
