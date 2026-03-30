'use client';

import React from 'react';
import styled from 'styled-components';
import { TgPageContainer } from '@/components/tg';
import { useTheme } from '@/lib/ThemeContext';
import { useWallet } from '@/lib/wagmi';
import { Wallet, Trophy, TrendingUp, Target, Award } from 'lucide-react';

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
`;

const Avatar = styled.div<{ $accentColor: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.$accentColor}, ${props => props.$accentColor}80);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #000;
  margin-bottom: 12px;
  border: 3px solid ${props => props.$accentColor};
`;

const Username = styled.h2<{ $textColor: string }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$textColor};
  margin: 0 0 4px 0;
`;

const WalletAddress = styled.div<{ $mutedColor: string }>`
  font-size: 13px;
  color: ${props => props.$mutedColor};
  font-family: monospace;
`;

const LevelBadge = styled.div<{ $accentColor: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: ${props => props.$accentColor}20;
  border: 1px solid ${props => props.$accentColor}50;
  border-radius: 20px;
  color: ${props => props.$accentColor};
  font-size: 13px;
  font-weight: 600;
  margin-top: 12px;
`;

const XpBar = styled.div<{ $bgColor: string }>`
  width: 100%;
  max-width: 200px;
  height: 6px;
  background: ${props => props.$bgColor};
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
`;

const XpProgress = styled.div<{ $accentColor: string; $progress: number }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: ${props => props.$accentColor};
  border-radius: 3px;
`;

const XpText = styled.div<{ $mutedColor: string }>`
  font-size: 11px;
  color: ${props => props.$mutedColor};
  margin-top: 4px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
`;

const StatCard = styled.div<{ $bgColor: string }>`
  background: ${props => props.$bgColor};
  border-radius: 14px;
  padding: 16px;
  text-align: center;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
`;

const StatValue = styled.div<{ $textColor: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$textColor};
`;

const StatLabel = styled.div<{ $mutedColor: string }>`
  font-size: 12px;
  color: ${props => props.$mutedColor};
  margin-top: 4px;
`;

const ConnectPrompt = styled.div<{ $textColor: string; $mutedColor: string }>`
  text-align: center;
  padding: 60px 20px;
  
  h3 { font-size: 18px; color: ${props => props.$textColor}; margin-bottom: 8px; }
  p { font-size: 14px; color: ${props => props.$mutedColor}; margin-bottom: 20px; }
`;

const ConnectButton = styled.button<{ $accentColor: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: ${props => props.$accentColor};
  border: none;
  border-radius: 12px;
  color: #000;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  
  &:active { transform: scale(0.98); }
`;

const MenuItem = styled.button<{ $bgColor: string; $textColor: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: ${props => props.$bgColor};
  border: none;
  border-radius: 12px;
  color: ${props => props.$textColor};
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 12px;
  
  &:active { background: ${props => props.$bgColor}dd; }
`;

export default function ProfileContent() {
  const { theme } = useTheme();
  const { isConnected, shortAddress, walletAddress, connectWallet, user } = useWallet();

  if (!isConnected) {
    return (
      <TgPageContainer>
        <ConnectPrompt $textColor={theme.textPrimary} $mutedColor={theme.textMuted}>
          <Wallet size={48} style={{ color: theme.accent, marginBottom: 16 }} />
          <h3>Connect Wallet</h3>
          <p>Connect your wallet to view your profile and stats</p>
          <ConnectButton $accentColor={theme.accent} onClick={connectWallet} data-testid="wallet-menu-item">
            <Wallet size={18} /> Connect Wallet
          </ConnectButton>
        </ConnectPrompt>
      </TgPageContainer>
    );
  }

  const xp = user?.xp || 0;
  const level = Math.floor(xp / 1000) + 1;
  const xpProgress = (xp % 1000) / 10;

  return (
    <TgPageContainer>
      <ProfileHeader>
        <Avatar $accentColor={theme.accent}>
          {(user?.username || shortAddress || 'AN').slice(0, 2).toUpperCase()}
        </Avatar>
        <Username $textColor={theme.textPrimary}>{user?.username || 'Anonymous'}</Username>
        <WalletAddress $mutedColor={theme.textMuted}>{shortAddress}</WalletAddress>
        <LevelBadge $accentColor={theme.accent}>
          <Award size={14} /> Level {level}
        </LevelBadge>
        <XpBar $bgColor={theme.bgCard}>
          <XpProgress $accentColor={theme.accent} $progress={xpProgress} />
        </XpBar>
        <XpText $mutedColor={theme.textMuted}>{xp % 1000} / 1000 XP to Level {level + 1}</XpText>
      </ProfileHeader>

      <StatsGrid>
        <StatCard $bgColor={theme.bgCard}>
          <StatIcon $color={theme.accent}><Target size={20} /></StatIcon>
          <StatValue $textColor={theme.textPrimary}>0</StatValue>
          <StatLabel $mutedColor={theme.textMuted}>Total Bets</StatLabel>
        </StatCard>
        <StatCard $bgColor={theme.bgCard}>
          <StatIcon $color={theme.success}><Trophy size={20} /></StatIcon>
          <StatValue $textColor={theme.textPrimary}>0</StatValue>
          <StatLabel $mutedColor={theme.textMuted}>Wins</StatLabel>
        </StatCard>
        <StatCard $bgColor={theme.bgCard}>
          <StatIcon $color={theme.warning}><TrendingUp size={20} /></StatIcon>
          <StatValue $textColor={theme.textPrimary}>0%</StatValue>
          <StatLabel $mutedColor={theme.textMuted}>Win Rate</StatLabel>
        </StatCard>
        <StatCard $bgColor={theme.bgCard}>
          <StatIcon $color={theme.danger}><Award size={20} /></StatIcon>
          <StatValue $textColor={theme.textPrimary}>0</StatValue>
          <StatLabel $mutedColor={theme.textMuted}>Duels Won</StatLabel>
        </StatCard>
      </StatsGrid>

      <MenuItem $bgColor={theme.bgCard} $textColor={theme.textPrimary}>
        <Wallet size={20} /> My Positions
      </MenuItem>
    </TgPageContainer>
  );
}
