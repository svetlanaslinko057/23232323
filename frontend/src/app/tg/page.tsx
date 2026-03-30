'use client';

import React, { useState, useCallback, lazy, Suspense, useMemo } from 'react';
import styled from 'styled-components';
import { Target, Swords, Trophy, User } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

// Lazy load tab content
const ArenaFeed = lazy(() => import('@/components/tg/arena/ArenaFeed'));
const DuelsContent = lazy(() => import('./duels/DuelsContent'));
const LeaderboardContent = lazy(() => import('./leaderboard/LeaderboardContent'));
const ProfileContent = lazy(() => import('./profile/ProfileContent'));

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
`;

const LoadingFallback = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${props => props.$color};
`;

const NavContainer = styled.nav<{ $bgColor: string; $borderColor: string }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.$bgColor};
  border-top: 1px solid ${props => props.$borderColor};
  padding: 8px 16px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0));
  z-index: 1000;
`;

const NavList = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 400px;
  margin: 0 auto;
`;

const NavButton = styled.button<{ $active?: boolean; $activeColor: string; $inactiveColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: ${props => props.$active ? `${props.$activeColor}15` : 'transparent'};
  border: none;
  cursor: pointer;
  border-radius: 12px;
  min-width: 64px;
  color: ${props => props.$active ? props.$activeColor : props.$inactiveColor};
  -webkit-tap-highlight-color: transparent;
  
  svg {
    filter: ${props => props.$active ? `drop-shadow(0 0 8px ${props.$activeColor}80)` : 'none'};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const NavLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
`;

type TabType = 'arena' | 'duels' | 'leaders' | 'profile';

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'arena', label: 'Arena', icon: <Target size={22} /> },
  { id: 'duels', label: 'Duels', icon: <Swords size={22} /> },
  { id: 'leaders', label: 'Leaders', icon: <Trophy size={22} /> },
  { id: 'profile', label: 'Profile', icon: <User size={22} /> },
];

export default function TgPage() {
  const [activeTab, setActiveTab] = useState<TabType>('arena');
  const { theme } = useTheme();

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const content = useMemo(() => {
    switch (activeTab) {
      case 'arena':
        return <ArenaFeed />;
      case 'duels':
        return <DuelsContent />;
      case 'leaders':
        return <LeaderboardContent />;
      case 'profile':
        return <ProfileContent />;
      default:
        return <ArenaFeed />;
    }
  }, [activeTab]);

  return (
    <>
      <TabContent>
        <Suspense fallback={<LoadingFallback $color={theme.textMuted}>Loading...</LoadingFallback>}>
          {content}
        </Suspense>
      </TabContent>
      
      <NavContainer $bgColor={theme.bgNav} $borderColor={theme.border} data-testid="tg-bottom-nav">
        <NavList>
          {tabs.map(tab => (
            <NavButton
              key={tab.id}
              $active={activeTab === tab.id}
              $activeColor={theme.accent}
              $inactiveColor={theme.textMuted}
              onClick={() => handleTabChange(tab.id)}
              data-testid={`nav-${tab.label.toLowerCase()}`}
            >
              {tab.icon}
              <NavLabel>{tab.label}</NavLabel>
            </NavButton>
          ))}
        </NavList>
      </NavContainer>
    </>
  );
}
