'use client';

import dynamic from 'next/dynamic';
import StyledComponentsRegistry from '@/lib/registry';
import { ArenaProvider } from '@/lib/api/ArenaContext';
import { ToastProvider } from '@/components/arena/ToastProvider';
import { NotificationToastListener } from '@/components/arena/useNotificationToasts';
import '@/app/globals.css';
import '@/index.css';

// Dynamic import Web3Provider to prevent SSR issues with wagmi
const Web3Provider = dynamic(
  () => import('@/lib/wagmi').then(mod => ({ default: mod.Web3Provider })),
  { ssr: false }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <Web3Provider>
            <ArenaProvider>
              <ToastProvider>
                <NotificationToastListener />
                {children}
              </ToastProvider>
            </ArenaProvider>
          </Web3Provider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
