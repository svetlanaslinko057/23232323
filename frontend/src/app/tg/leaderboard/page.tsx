'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { TgPageContainer } from '@/components/tg';
import { useTheme } from '@/lib/ThemeContext';
import { useWallet } from '@/lib/wagmi';
import { Trophy, TrendingUp, Target, Medal, Crown, RefreshCw, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const Header = styled.div`
  margin-bottom: 20px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2<{ $textColor: string }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$textColor};
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p<{ $textColor: string }>`
  font-size: 14px;
  color: ${props => props.$textColor};
  margin: 0;
`;

const RefreshButton = styled.button<{ $mutedColor: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid ${props => props.$mutedColor}30;
  border-radius: 8px;
  color: ${props => props.$mutedColor};
  font-size: 12px;
  cursor: pointer;
  
  &:active {
    transform: scale(0.95);
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const FilterTab = styled.button<{ $active?: boolean; $warningColor: string; $bgColor: string; $textColor: string }>`
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  ${({ $active, $warningColor, $bgColor, $textColor }) => $active ? `
    background: ${$warningColor}25;
    color: ${$warningColor};
    border: 1px solid ${$warningColor}50;
  ` : `
    background: ${$bgColor};
    color: ${$textColor};
    border: 1px solid transparent;
  `}
  
  &:active {
    transform: scale(0.96);
  }
`;

const Podium = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 24px;
  padding: 0 16px;
`;

const PodiumPlace = styled.div<{ $place: number; $bgColor: string; $accentColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 100px;
  
  .avatar {
    width: ${({ $place }) => $place === 1 ? '64px' : '52px'};
    height: ${({ $place }) => $place === 1 ? '64px' : '52px'};
    border-radius: 50%;
    background: linear-gradient(135deg, 
      ${({ $place }) => {
        if ($place === 1) return '#ffd700, #ffb347';
        if ($place === 2) return '#c0c0c0, #a8a8a8';
        return '#cd7f32, #b87333';
      }}
    );
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${({ $place }) => $place === 1 ? '20px' : '16px'};
    font-weight: 700;
    color: #fff;
    margin-bottom: 8px;
    position: relative;
    border: 3px solid ${({ $place }) => {
      if ($place === 1) return '#ffd700';
      if ($place === 2) return '#c0c0c0';
      return '#cd7f32';
    }};
    box-shadow: 0 4px 20px ${({ $place }) => {
      if ($place === 1) return 'rgba(255, 215, 0, 0.4)';
      if ($place === 2) return 'rgba(192, 192, 192, 0.3)';
      return 'rgba(205, 127, 50, 0.3)';
    }};
  }
  
  .crown {
    position: absolute;
    top: -18px;
    color: #ffd700;
    filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.5));
  }
  
  .stand {
    width: 100%;
    height: ${({ $place }) => {
      if ($place === 1) return '80px';
      if ($place === 2) return '60px';
      return '45px';
    }};
    background: ${props => props.$bgColor};
    border-radius: 8px 8px 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
    
    .place {
      font-size: 20px;
      font-weight: 800;
      color: ${({ $place }) => {
        if ($place === 1) return '#ffd700';
        if ($place === 2) return '#c0c0c0';
        return '#cd7f32';
      }};
      margin-bottom: 4px;
    }
    
    .name {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-primary);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    
    .xp {
      font-size: 10px;
      color: ${props => props.$accentColor};
    }
  }
`;

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LeaderboardItem = styled.div<{ $bgColor: string; $textColor: string; $mutedColor: string; $isYou?: boolean; $accentColor?: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => props.$isYou ? `${props.$accentColor}15` : props.$bgColor};
  border-radius: 12px;
  border: ${props => props.$isYou ? `1px solid ${props.$accentColor}40` : 'none'};
  
  .rank {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: ${props => props.$isYou ? `${props.$accentColor}30` : `${props.$mutedColor}20`};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: ${props => props.$isYou ? props.$accentColor : props.$mutedColor};
  }
  
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
  }
  
  .info {
    flex: 1;
    
    .name {
      font-size: 14px;
      font-weight: 600;
      color: ${props => props.$textColor};
    }
    
    .stats {
      font-size: 12px;
      color: ${props => props.$mutedColor};
    }
  }
  
  .score {
    text-align: right;
    
    .xp {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
    }
    
    .label {
      font-size: 10px;
      color: ${props => props.$mutedColor};
      text-transform: uppercase;
    }
  }
`;

const YourRank = styled.div<{ $bgColor: string; $accentColor: string; $textColor: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: ${props => props.$accentColor}15;
  border: 1px solid ${props => props.$accentColor}40;
  border-radius: 12px;
  margin-bottom: 16px;
  
  .rank {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => props.$accentColor}30;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: ${props => props.$accentColor};
  }
  
  .info {
    flex: 1;
    
    .label {
      font-size: 11px;
      color: ${props => props.$accentColor};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .text {
      font-size: 14px;
      font-weight: 600;
      color: ${props => props.$textColor};
    }
  }
  
  .arrow {
    color: ${props => props.$accentColor};
  }
`;

const LoadingState = styled.div<{ $mutedColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: ${props => props.$mutedColor};
  gap: 12px;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

interface LeaderEntry {
  _id?: string;
  wallet: string;
  name?: string;
  username?: string;
  xp: number;
  stats?: {
    wins?: number;
    totalBets?: number;
    winRate?: number;
    totalProfit?: number;
  };
  rank?: number;
}

function getShortName(entry: LeaderEntry): string {
  if (entry.username) return entry.username;
  if (entry.name) return entry.name;
  if (!entry.wallet) return 'Anon';
  return `${entry.wallet.slice(0, 4)}...${entry.wallet.slice(-4)}`;
}

function getAvatar(entry: LeaderEntry): string {
  const name = entry.username || entry.name || entry.wallet || 'AN';
  return name.slice(0, 2).toUpperCase();
}

export default function TgLeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'xp' | 'wins' | 'profit'>('xp');
  const { theme } = useTheme();
  const { walletAddress } = useWallet();

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const sortField = activeFilter === 'xp' ? 'xp' : activeFilter === 'wins' ? 'stats.wins' : 'stats.totalProfit';
      
      const response = await fetch(`${API_URL}/api/analysts/leaderboard?limit=20&sortBy=${sortField}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        // Handle nested data structure: {data: {data: [...], hasMore, total}}
        const leaderData = Array.isArray(result.data) ? result.data : (result.data.data || []);
        const entries = leaderData.map((entry: any, index: number) => ({
          ...entry,
          rank: index + 1,
        }));
        setLeaders(entries);
        
        // Find user's rank
        if (walletAddress) {
          const userEntry = entries.find((e: LeaderEntry) => 
            e.wallet?.toLowerCase() === walletAddress.toLowerCase()
          );
          if (userEntry) {
            setUserRank(userEntry);
          } else {
            // Fetch user's own rank
            try {
              const userResponse = await fetch(`${API_URL}/api/analysts/${walletAddress}`);
              const userData = await userResponse.json();
              if (userData.success && userData.data) {
                setUserRank({ ...userData.data, rank: userData.data.rank || '100+' });
              }
            } catch (e) {
              // Ignore
            }
          }
        }
      } else if (Array.isArray(result)) {
        setLeaders(result.map((entry: any, index: number) => ({ ...entry, rank: index + 1 })));
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, walletAddress]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3, 10);
  
  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = top3.length >= 3 
    ? [top3[1], top3[0], top3[2]]
    : top3;

  const getValue = (entry: LeaderEntry): string => {
    if (activeFilter === 'xp') return `${(entry.xp / 1000).toFixed(1)}K`;
    if (activeFilter === 'wins') return `${entry.stats?.wins || 0}`;
    return `$${(entry.stats?.totalProfit || 0).toFixed(0)}`;
  };

  const getLabel = (): string => {
    if (activeFilter === 'xp') return 'XP';
    if (activeFilter === 'wins') return 'WINS';
    return 'PROFIT';
  };

  return (
    <TgPageContainer>
      <HeaderRow>
        <Header>
          <Title $textColor={theme.textPrimary}>Leaderboard</Title>
          <Subtitle $textColor={theme.textMuted}>Top predictors this week</Subtitle>
        </Header>
        <RefreshButton $mutedColor={theme.textMuted} onClick={fetchLeaderboard}>
          <RefreshCw size={14} />
        </RefreshButton>
      </HeaderRow>

      <FilterTabs>
        <FilterTab 
          $active={activeFilter === 'xp'} 
          $warningColor={theme.warning}
          $bgColor={theme.bgCard}
          $textColor={theme.textSecondary}
          onClick={() => setActiveFilter('xp')}
          data-testid="filter-xp"
        >
          <Trophy size={14} /> XP
        </FilterTab>
        <FilterTab 
          $active={activeFilter === 'wins'} 
          $warningColor={theme.warning}
          $bgColor={theme.bgCard}
          $textColor={theme.textSecondary}
          onClick={() => setActiveFilter('wins')}
          data-testid="filter-wins"
        >
          <Target size={14} /> Wins
        </FilterTab>
        <FilterTab 
          $active={activeFilter === 'profit'} 
          $warningColor={theme.warning}
          $bgColor={theme.bgCard}
          $textColor={theme.textSecondary}
          onClick={() => setActiveFilter('profit')}
          data-testid="filter-profit"
        >
          <TrendingUp size={14} /> Profit
        </FilterTab>
      </FilterTabs>

      {loading ? (
        <LoadingState $mutedColor={theme.textMuted}>
          <Loader2 size={32} />
          <span>Loading leaderboard...</span>
        </LoadingState>
      ) : (
        <>
          {podiumOrder.length >= 3 && (
            <Podium>
              {podiumOrder.map((leader, i) => {
                const place = i === 0 ? 2 : i === 1 ? 1 : 3;
                return (
                  <PodiumPlace 
                    key={leader._id || leader.wallet || i} 
                    $place={place} 
                    $bgColor={theme.bgCard} 
                    $accentColor={theme.accent}
                  >
                    <div className="avatar">
                      {place === 1 && <Crown size={20} className="crown" />}
                      {getAvatar(leader)}
                    </div>
                    <div className="stand">
                      <div className="place">{place}</div>
                      <div className="name">{getShortName(leader)}</div>
                      <div className="xp">{getValue(leader)} {getLabel()}</div>
                    </div>
                  </PodiumPlace>
                );
              })}
            </Podium>
          )}

          {userRank && userRank.rank && userRank.rank > 3 && (
            <YourRank $bgColor={theme.bgCard} $accentColor={theme.accent} $textColor={theme.textPrimary}>
              <div className="rank">#{userRank.rank}</div>
              <div className="info">
                <div className="label">Your Rank</div>
                <div className="text">
                  {getValue(userRank)} {getLabel()} • {userRank.stats?.wins || 0} wins
                </div>
              </div>
              <Medal size={20} className="arrow" />
            </YourRank>
          )}

          <LeaderboardList>
            {rest.map((leader, index) => {
              const isYou = walletAddress && leader.wallet?.toLowerCase() === walletAddress.toLowerCase();
              return (
                <LeaderboardItem 
                  key={leader._id || leader.wallet || index} 
                  $bgColor={theme.bgCard} 
                  $textColor={theme.textPrimary} 
                  $mutedColor={theme.textMuted}
                  $isYou={isYou}
                  $accentColor={theme.accent}
                >
                  <div className="rank">{leader.rank || index + 4}</div>
                  <div className="avatar">{getAvatar(leader)}</div>
                  <div className="info">
                    <div className="name">{getShortName(leader)} {isYou && '(You)'}</div>
                    <div className="stats">{leader.stats?.wins || 0} wins • {leader.stats?.winRate || 0}% win rate</div>
                  </div>
                  <div className="score">
                    <div className="xp">{getValue(leader)}</div>
                    <div className="label">{getLabel()}</div>
                  </div>
                </LeaderboardItem>
              );
            })}
          </LeaderboardList>
        </>
      )}
    </TgPageContainer>
  );
}
