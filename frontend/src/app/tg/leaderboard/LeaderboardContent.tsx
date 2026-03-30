'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { TgPageContainer } from '@/components/tg';
import { useTheme } from '@/lib/ThemeContext';
import { Trophy, Medal, TrendingUp, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const Title = styled.h2<{ $textColor: string }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$textColor};
  margin: 0 0 16px 0;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ $active: boolean; $accentColor: string; $bgColor: string; $textColor: string }>`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  
  ${({ $active, $accentColor, $bgColor, $textColor }) => $active ? `
    background: ${$accentColor}20;
    color: ${$accentColor};
    border: 1px solid ${$accentColor}50;
  ` : `
    background: ${$bgColor};
    color: ${$textColor};
    border: 1px solid transparent;
  `}
  
  &:active { transform: scale(0.96); }
`;

const LeaderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LeaderCard = styled.div<{ $rank: number; $bgColor: string; $accentColor: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: ${props => props.$bgColor};
  border-radius: 14px;
  
  ${({ $rank, $accentColor }) => $rank <= 3 && `
    border: 1px solid ${$rank === 1 ? '#FFD700' : $rank === 2 ? '#C0C0C0' : '#CD7F32'}40;
  `}
`;

const Rank = styled.div<{ $rank: number }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  
  ${({ $rank }) => {
    if ($rank === 1) return `background: linear-gradient(135deg, #FFD700, #FFA500); color: #000;`;
    if ($rank === 2) return `background: linear-gradient(135deg, #C0C0C0, #A0A0A0); color: #000;`;
    if ($rank === 3) return `background: linear-gradient(135deg, #CD7F32, #8B4513); color: #fff;`;
    return `background: rgba(128, 128, 128, 0.2); color: #888;`;
  }}
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.div<{ $textColor: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$textColor};
`;

const UserStats = styled.div<{ $mutedColor: string }>`
  font-size: 12px;
  color: ${props => props.$mutedColor};
  margin-top: 2px;
`;

const Score = styled.div<{ $accentColor: string }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.$accentColor};
`;

const LoadingState = styled.div<{ $mutedColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: ${props => props.$mutedColor};
  gap: 12px;
  
  svg { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const EmptyState = styled.div<{ $textColor: string; $mutedColor: string }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$mutedColor};
  
  h4 { font-size: 16px; color: ${props => props.$textColor}; margin-bottom: 8px; }
  p { font-size: 14px; margin: 0; }
`;

interface Leader {
  _id?: string;
  wallet: string;
  username?: string;
  xp?: number;
  totalWins?: number;
  totalProfit?: number;
  winRate?: number;
}

export default function LeaderboardContent() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'xp' | 'wins' | 'profit'>('xp');
  const { theme } = useTheme();

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/analysts/leaderboard?sortBy=${activeTab}`);
      const result = await response.json();
      
      if (Array.isArray(result.data)) {
        setLeaders(result.data);
      } else if (result.success && Array.isArray(result.analysts)) {
        setLeaders(result.analysts);
      } else {
        setLeaders([]);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getShortAddress = (wallet: string) => `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

  const getScoreDisplay = (leader: Leader) => {
    switch (activeTab) {
      case 'xp': return `${leader.xp || 0} XP`;
      case 'wins': return `${leader.totalWins || 0} wins`;
      case 'profit': return `$${(leader.totalProfit || 0).toFixed(0)}`;
    }
  };

  return (
    <TgPageContainer>
      <Title $textColor={theme.textPrimary}>Leaderboard</Title>
      
      <TabsContainer>
        <Tab $active={activeTab === 'xp'} $accentColor={theme.accent} $bgColor={theme.bgCard} $textColor={theme.textSecondary} onClick={() => setActiveTab('xp')}>
          <Trophy size={14} style={{ marginRight: 4 }} /> XP
        </Tab>
        <Tab $active={activeTab === 'wins'} $accentColor={theme.accent} $bgColor={theme.bgCard} $textColor={theme.textSecondary} onClick={() => setActiveTab('wins')}>
          <Medal size={14} style={{ marginRight: 4 }} /> Wins
        </Tab>
        <Tab $active={activeTab === 'profit'} $accentColor={theme.accent} $bgColor={theme.bgCard} $textColor={theme.textSecondary} onClick={() => setActiveTab('profit')}>
          <TrendingUp size={14} style={{ marginRight: 4 }} /> Profit
        </Tab>
      </TabsContainer>

      {loading ? (
        <LoadingState $mutedColor={theme.textMuted}>
          <Loader2 size={32} />
          <span>Loading leaderboard...</span>
        </LoadingState>
      ) : !Array.isArray(leaders) || leaders.length === 0 ? (
        <EmptyState $textColor={theme.textPrimary} $mutedColor={theme.textMuted}>
          <Trophy size={48} />
          <h4>No leaders yet</h4>
          <p>Be the first to climb the ranks!</p>
        </EmptyState>
      ) : (
        <LeaderList>
          {leaders.map((leader, index) => (
            <LeaderCard key={leader._id || leader.wallet} $rank={index + 1} $bgColor={theme.bgCard} $accentColor={theme.accent}>
              <Rank $rank={index + 1}>{index + 1}</Rank>
              <Avatar>{(leader.username || leader.wallet).slice(0, 2).toUpperCase()}</Avatar>
              <UserInfo>
                <Username $textColor={theme.textPrimary}>{leader.username || getShortAddress(leader.wallet)}</Username>
                <UserStats $mutedColor={theme.textMuted}>
                  {leader.winRate ? `${(leader.winRate * 100).toFixed(0)}% win rate` : 'New player'}
                </UserStats>
              </UserInfo>
              <Score $accentColor={theme.accent}>{getScoreDisplay(leader)}</Score>
            </LeaderCard>
          ))}
        </LeaderList>
      )}
    </TgPageContainer>
  );
}
