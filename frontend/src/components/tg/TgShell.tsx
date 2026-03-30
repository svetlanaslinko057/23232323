'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TgBottomNav } from './TgBottomNav';
import { TgTopBar } from './TgTopBar';
import { getTelegramWebApp, initTelegramWebApp } from '@/lib/telegram';
import { useTheme } from '@/lib/ThemeContext';

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
  
  /* Safe areas for notch/home indicator */
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 70px; /* Space for bottom nav */
  
  /* Hide scrollbar but keep functionality */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

interface TgShellInnerProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function TgShellInner({ children, title, showBack, onBack }: TgShellInnerProps) {
  const { theme } = useTheme();

  useEffect(() => {
    // Initialize Telegram WebApp once
    const tg = getTelegramWebApp();
    
    if (tg) {
      initTelegramWebApp();
      document.body.style.backgroundColor = theme.bgPrimary;
      tg.expand();
      
      if (tg.setHeaderColor) {
        tg.setHeaderColor(theme.bgPrimary);
      }
      if (tg.setBackgroundColor) {
        tg.setBackgroundColor(theme.bgPrimary);
      }
    }
  }, [theme]);

  return (
    <ShellContainer data-testid="tg-shell" $bgColor={theme.bgPrimary}>
      <TgTopBar title={title} showBack={showBack} onBack={onBack} />
      <MainContent data-testid="tg-main-content">
        {children}
      </MainContent>
      <TgBottomNav />
    </ShellContainer>
  );
}

// Legacy export for compatibility - just renders children in shell
export function TgShell({ children, ...props }: TgShellInnerProps) {
  return <TgShellInner {...props}>{children}</TgShellInner>;
}

export default TgShell;
