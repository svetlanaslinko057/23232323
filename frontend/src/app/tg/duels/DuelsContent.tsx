'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { TgPageContainer } from '@/components/tg';
import { useTheme } from '@/lib/ThemeContext';
import { useWallet } from '@/lib/wagmi';
import { Swords, Clock, Trophy, Zap, Plus, RefreshCw, Loader2 } from 'lucide-react';

// Dynamic import for modal to avoid SSR issues with wagmi
const TgCreateDuelModal = dynamic(
  () => import('@/components/tg/TgCreateDuelModal'),
  { ssr: false }
);

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
  
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
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
  
  ${({ $active, $dangerColor, $bgColor, $textColor }) => $active ? `
    background: ${$dangerColor}20;
    color: ${$dangerColor};
    border: 1px solid ${$dangerColor}50;
  ` : `
    background: ${$bgColor};
    color: ${$textColor};
    border: 1px solid transparent;
  `}
  
  &:active { transform: scale(0.96); }
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
  
  ${({ $featured }) => $featured && `
    border: 1px solid rgba(255, 215, 0, 0.4);
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  `}
  
  &:active { transform: scale(0.98); }
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
      default:
        return `background: rgba(128, 128, 128, 0.1); color: #888;`;
    }
  }}
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
  }
`;

const EmptyState = styled.div<{ $textColor: string; $mutedColor: string }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$mutedColor};
  
  h4 { font-size: 16px; color: ${props => props.$textColor}; margin-bottom: 8px; }
  p { font-size: 14px; margin: 0; }
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
  challenger: { wallet: string; name?: string; side: string };
  opponent?: { wallet: string; name?: string; side: string };
  stakeAmount: number;
  status: string;
  expiresAt?: string;
  createdAt: string;
  featured?: boolean;
}

function formatTimeLeft(dateString?: string): string {
  if (!dateString) return '∞';
  const diff = new Date(dateString).getTime() - Date.now();
  if (diff < 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${Math.floor(diff / (1000 * 60))}m`;
}

export default function DuelsContent() {
  const [duels, setDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { theme } = useTheme();
  const { walletAddress, isConnected } = useWallet();

  const fetchDuels = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilter !== 'all') {
        params.append('status', activeFilter === 'open' ? 'pending' : activeFilter);
      }
      
      const response = await fetch(`${API_URL}/api/duels?${params}`);
      const result = await response.json();
      
      if (result.data) {
        setDuels(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch duels:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchDuels();
  }, [fetchDuels]);

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
      </HeaderRow>

      <CreateButton 
        $accentColor={theme.accent} 
        data-testid="create-duel"
        onClick={() => {
          if (!isConnected) {
            alert('Please connect your wallet first to create a duel');
            return;
          }
          setIsCreateModalOpen(true);
        }}
      >
        <Plus size={18} /> Create Duel
      </CreateButton>

      <TgCreateDuelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchDuels}
      />

      <FilterTabs>
        {['all', 'open', 'live', 'my'].map(filter => (
          <FilterTab
            key={filter}
            $active={activeFilter === filter}
            $dangerColor={theme.danger}
            $bgColor={theme.bgCard}
            $textColor={theme.textSecondary}
            onClick={() => setActiveFilter(filter)}
            data-testid={`filter-${filter}`}
          >
            {filter === 'my' ? 'My Duels' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </FilterTab>
        ))}
      </FilterTabs>

      {loading ? (
        <LoadingState $mutedColor={theme.textMuted}>
          <Loader2 size={32} />
          <span>Loading duels...</span>
        </LoadingState>
      ) : filteredDuels.length === 0 ? (
        <EmptyState $textColor={theme.textPrimary} $mutedColor={theme.textMuted}>
          <Swords size={48} />
          <h4>No duels yet</h4>
          <p>Create the first duel and challenge others!</p>
        </EmptyState>
      ) : (
        <DuelsList>
          {filteredDuels.map(duel => (
            <DuelCard key={duel._id || duel.id} $featured={duel.stakeAmount >= 100} $bgColor={theme.bgCard} data-testid="duel-card">
              <DuelHeader>
                <DuelTitle $textColor={theme.textPrimary}>{duel.predictionTitle || 'Prediction Duel'}</DuelTitle>
                <StatusBadge $status={duel.status} $successColor={theme.success} $dangerColor={theme.danger}>
                  {duel.status.toUpperCase()}
                </StatusBadge>
              </DuelHeader>
              <DuelStats $borderColor={theme.border} $mutedColor={theme.textMuted}>
                <div className="stat"><Trophy size={14} /> ${duel.stakeAmount * 2} pot</div>
                <div className="stat"><Clock size={14} /> {formatTimeLeft(duel.expiresAt)}</div>
              </DuelStats>
            </DuelCard>
          ))}
        </DuelsList>
      )}
    </TgPageContainer>
  );
}
