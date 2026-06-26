'use client';

import { Toaster as Sonner, toast } from 'sonner';

export { toast };

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: '#242830',
          color: '#e0e0e4',
          border: '1px solid #2a2d35',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        },
      }}
    />
  );
}
