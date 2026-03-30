'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { TgPageContainer } from '@/components/tg';
import { useTheme } from '@/lib/ThemeContext';
import { useWallet } from '@/lib/wagmi';
import { Swords, Clock, Trophy, Zap, Plus, RefreshCw, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const Header = styled.div`
  margin-bottom: 16px;
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

const CreateButton = styled.button<{ $accentColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, ${props => props.$accentColor} 0%, ${props => props.$accentColor}cc 100%);
  border: none;
  border-radius: 12px;
  color: #000;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const FilterTab = styled.button<{ $active?: boolean; $dangerColor: string; $bgColor: string; $textColor: string }>`
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  
  ${({ $active, $dangerColor, $bgColor, $textColor }) => $active ? `
    background: ${$dangerColor}20;
    color: ${$dangerColor};
    border: 1px solid ${$dangerColor}50;
  ` : `
    background: ${$bgColor};
    color: ${$textColor};
    border: 1px solid transparent;
  `}
  
  &:active {
    transform: scale(0.96);
  }
`;

const DuelsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DuelCard = styled.div<{ $featured?: boolean; $bgColor: string }>`
  background: ${props => props.$bgColor};
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ $featured }) => $featured && `
    border: 1px solid rgba(255, 215, 0, 0.4);
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
  `}
  
  &:active {
    transform: scale(0.98);
  }
`;

const FeaturedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 215, 0, 0.2);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 8px;
`;

const DuelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const DuelTitle = styled.h4<{ $textColor: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$textColor};
  margin: 0;
  flex: 1;
`;

const StatusBadge = styled.span<{ $status: string; $successColor: string; $dangerColor: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  
  ${({ $status, $successColor, $dangerColor }) => {
    switch ($status) {
      case 'pending':
      case 'open':
        return `background: ${$successColor}20; color: ${$successColor};`;
      case 'active':
      case 'live':
        return `background: ${$dangerColor}20; color: ${$dangerColor};`;
      case 'resolved':
        return `background: rgba(156, 163, 175, 0.2); color: #9ca3af;`;
      default:
        return `background: rgba(128, 128, 128, 0.1); color: #888;`;
    }
  }}
`;

const Versus = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Player = styled.div<{ $side: 'left' | 'right'; $successColor: string; $dangerColor: string; $textColor: string; $mutedColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $side }) => $side === 'left' ? 'flex-start' : 'flex-end'};
  flex: 1;
  
  .avatar {
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
    margin-bottom: 6px;
  }
  
  .name {
    font-size: 13px;
    font-weight: 600;
    color: ${props => props.$textColor};
  }
  
  .side {
    font-size: 11px;
    font-weight: 600;
    color: ${({ $side, $successColor, $dangerColor }) => $side === 'left' ? $successColor : $dangerColor};
  }
`;

const VsIcon = styled.div<{ $dangerColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$dangerColor}30;
  color: ${props => props.$dangerColor};
`;

const DuelStats = styled.div<{ $borderColor: string; $mutedColor: string }>`
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid ${props => props.$borderColor};
  
  .stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: ${props => props.$mutedColor};
    
    svg {
      opacity: 0.6;
    }
  }
`;

const JoinButton = styled.button<{ $dangerColor: string; $loading?: boolean }>`
  width: 100%;
  padding: 12px;
  background: ${props => props.$dangerColor}20;
  border: 1px solid ${props => props.$dangerColor}50;
  border-radius: 10px;
  color: ${props => props.$dangerColor};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:active {
    background: ${props => props.$dangerColor}30;
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div<{ $textColor: string; $mutedColor: string }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$mutedColor};
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  h4 {
    font-size: 16px;
    color: ${props => props.$textColor};
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    margin: 0;
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

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

interface Duel {
  _id: string;
  id: string;
  predictionTitle: string;
  challenger: {
    wallet: string;
    name?: string;
    side: string;
  };
  opponent?: {
    wallet: string;
    name?: string;
    side: string;
  };
  stakeAmount: number;
  status: 'pending' | 'active' | 'resolved' | 'cancelled';
  expiresAt?: string;
  createdAt: string;
  featured?: boolean;
}

function formatTimeLeft(dateString?: string): string {
  if (!dateString) return '∞';
  const expiresAt = new Date(dateString);
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  
  if (diff < 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h`;
  
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes}m`;
}

function getShortName(wallet?: string, name?: string): string {
  if (name) return name.slice(0, 8);
  if (!wallet) return 'Anon';
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export default function TgDuelsPage() {
  const [duels, setDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [joiningDuel, setJoiningDuel] = useState<string | null>(null);
  const { theme } = useTheme();
  const { walletAddress, isConnected, token } = useWallet();

  const fetchDuels = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilter !== 'all') {
        params.append('status', activeFilter === 'open' ? 'pending' : activeFilter);
      }
      if (activeFilter === 'my' && walletAddress) {
        params.append('wallet', walletAddress);
      }
      
      const response = await fetch(`${API_URL}/api/duels?${params}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setDuels(result.data);
      } else if (result.data) {
        setDuels(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch duels:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, walletAddress]);

  useEffect(() => {
    fetchDuels();
  }, [fetchDuels]);

  const handleJoinDuel = async (duelId: string, stake: number) => {
    if (!isConnected || !token) {
      alert('Please connect your wallet first');
      return;
    }
    
    setJoiningDuel(duelId);
    try {
      const response = await fetch(`${API_URL}/api/duels/${duelId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ wallet: walletAddress }),
      });
      
      const result = await response.json();
      if (result.success) {
        fetchDuels();
      } else {
        alert(result.message || 'Failed to join duel');
      }
    } catch (error) {
      console.error('Failed to join duel:', error);
      alert('Failed to join duel');
    } finally {
      setJoiningDuel(null);
    }
  };

  const filteredDuels = duels.filter(duel => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'open') return duel.status === 'pending';
    if (activeFilter === 'live') return duel.status === 'active';
    if (activeFilter === 'my') {
      return duel.challenger.wallet === walletAddress || duel.opponent?.wallet === walletAddress;
    }
    return true;
  });

  return (
    <TgPageContainer>
      <HeaderRow>
        <Header>
          <Title $textColor={theme.textPrimary}>Duels</Title>
          <Subtitle $textColor={theme.textMuted}>Challenge rivals, win big</Subtitle>
        </Header>
        <RefreshButton $mutedColor={theme.textMuted} onClick={fetchDuels}>
          <RefreshCw size={14} />
          Refresh
        </RefreshButton>
      </HeaderRow>

      <CreateButton 
        data-testid="create-duel" 
        $accentColor={theme.accent}
        disabled={!isConnected}
      >
        <Plus size={18} /> Create Duel
      </CreateButton>

      <FilterTabs>
        <FilterTab 
          $active={activeFilter === 'all'} 
          $dangerColor={theme.danger}
          $bgColor={theme.bgCard}
          $textColor={theme.textSecondary}
          onClick={() => setActiveFilter('all')}
          data-testid="filter-all"
        >
          All
        </FilterTab>
        <FilterTab 
          $active={activeFilter === 'open'} 
          $dangerColor={theme.danger}
          $bgColor={theme.bgCard}
          $textColor={theme.textSecondary}
          onClick={() => setActiveFilter('open')}
          data-testid="filter-open"
        >
          Open
        </FilterTab>
        <FilterTab 
          $active={activeFilter === 'live'} 
          $dangerColor={theme.danger}
          $bgColor={theme.bgCard}
          $textColor={theme.textSecondary}
          onClick={() => setActiveFilter('live')}
          data-testid="filter-live"
        >
          Live
        </FilterTab>
        <FilterTab 
          $active={activeFilter === 'my'} 
          $dangerColor={theme.danger}
          $bgColor={theme.bgCard}
          $textColor={theme.textSecondary}
          onClick={() => setActiveFilter('my')}
          data-testid="filter-my"
        >
          My Duels
        </FilterTab>
      </FilterTabs>

      {loading ? (
        <LoadingState $mutedColor={theme.textMuted}>
          <Loader2 size={32} />
          <span>Loading duels...</span>
        </LoadingState>
      ) : (
        <DuelsList>
          {filteredDuels.length === 0 ? (
            <EmptyState $textColor={theme.textPrimary} $mutedColor={theme.textMuted}>
              <div className="icon"><Swords size={48} /></div>
              <h4>No duels yet</h4>
              <p>Create the first duel and challenge others!</p>
            </EmptyState>
          ) : (
            filteredDuels.map((duel) => (
              <DuelCard 
                key={duel._id || duel.id} 
                $featured={duel.featured || duel.stakeAmount >= 100} 
                $bgColor={theme.bgCard} 
                data-testid="duel-card"
              >
                {(duel.featured || duel.stakeAmount >= 100) && (
                  <FeaturedBadge>
                    <Zap size={10} /> {duel.stakeAmount >= 500 ? 'WHALE' : 'FEATURED'}
                  </FeaturedBadge>
                )}
                
                <DuelHeader>
                  <DuelTitle $textColor={theme.textPrimary}>
                    {duel.predictionTitle || 'Prediction Duel'}
                  </DuelTitle>
                  <StatusBadge 
                    $status={duel.status} 
                    $successColor={theme.success} 
                    $dangerColor={theme.danger}
                  >
                    {duel.status.toUpperCase()}
                  </StatusBadge>
                </DuelHeader>

                <Versus>
                  <Player 
                    $side="left" 
                    $successColor={theme.success} 
                    $dangerColor={theme.danger} 
                    $textColor={theme.textPrimary} 
                    $mutedColor={theme.textMuted}
                  >
                    <div className="avatar">
                      {getShortName(duel.challenger.wallet, duel.challenger.name).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="name">{getShortName(duel.challenger.wallet, duel.challenger.name)}</div>
                    <div className="side">{duel.challenger.side || 'YES'}</div>
                  </Player>
                  
                  <VsIcon $dangerColor={theme.danger}>
                    <Swords size={18} />
                  </VsIcon>
                  
                  <Player 
                    $side="right" 
                    $successColor={theme.success} 
                    $dangerColor={theme.danger} 
                    $textColor={theme.textPrimary} 
                    $mutedColor={theme.textMuted}
                  >
                    {duel.opponent ? (
                      <>
                        <div className="avatar">
                          {getShortName(duel.opponent.wallet, duel.opponent.name).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="name">{getShortName(duel.opponent.wallet, duel.opponent.name)}</div>
                        <div className="side">{duel.opponent.side || 'NO'}</div>
                      </>
                    ) : (
                      <>
                        <div className="avatar" style={{ background: theme.bgSecondary }}>?</div>
                        <div className="name" style={{ color: theme.textMuted }}>Waiting...</div>
                        <div className="side" style={{ color: theme.textMuted }}>NO</div>
                      </>
                    )}
                  </Player>
                </Versus>

                <DuelStats $borderColor={theme.border} $mutedColor={theme.textMuted}>
                  <div className="stat">
                    <Trophy size={14} /> ${duel.stakeAmount * 2} pot
                  </div>
                  <div className="stat">
                    <Clock size={14} /> {formatTimeLeft(duel.expiresAt)}
                  </div>
                </DuelStats>

                {duel.status === 'pending' && !duel.opponent && duel.challenger.wallet !== walletAddress && (
                  <JoinButton 
                    data-testid="join-duel" 
                    $dangerColor={theme.danger}
                    $loading={joiningDuel === duel._id}
                    disabled={joiningDuel === duel._id || !isConnected}
                    onClick={() => handleJoinDuel(duel._id || duel.id, duel.stakeAmount)}
                  >
                    {joiningDuel === duel._id ? (
                      <>
                        <Loader2 size={16} />
                        Joining...
                      </>
                    ) : (
                      `Accept Challenge ($${duel.stakeAmount})`
                    )}
                  </JoinButton>
                )}
              </DuelCard>
            ))
          )}
        </DuelsList>
      )}
    </TgPageContainer>
  );
}
