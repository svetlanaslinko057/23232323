'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { TgTopBar } from '@/components/tg/TgTopBar';
import { ThemeProvider, useTheme } from '@/lib/ThemeContext';
import { getTelegramWebApp, initTelegramWebApp } from '@/lib/telegram';

// Lazy load Web3Provider with RainbowKit
const Web3Provider = dynamic(
  () => import('@/lib/wagmi/Web3Provider').then(mod => mod.Web3Provider),
  { ssr: false, loading: () => null }
);

const ShellContainer = styled.div<{ $bgColor: string }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$bgColor};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 80px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
`;

function TgLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      initTelegramWebApp();
      document.body.style.backgroundColor = theme.bgPrimary;
      tg.expand();
      tg.setHeaderColor?.(theme.bgPrimary);
      tg.setBackgroundColor?.(theme.bgPrimary);
    }
  }, [theme]);

  return (
    <ShellContainer $bgColor={theme.bgPrimary} data-testid="tg-shell">
      <TgTopBar />
      <MainContent data-testid="tg-main-content">
        {children}
      </MainContent>
    </ShellContainer>
  );
}

export default function TgLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <ThemeProvider>
      {ready ? (
        <Web3Provider>
          <TgLayoutInner>{children}</TgLayoutInner>
        </Web3Provider>
      ) : (
        <TgLayoutInner>{children}</TgLayoutInner>
      )}
    </ThemeProvider>
  );
}
