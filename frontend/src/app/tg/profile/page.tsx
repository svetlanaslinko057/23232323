'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { TgPageContainer } from '@/components/tg';
import { useTheme } from '@/lib/ThemeContext';
import { useWallet } from '@/lib/wagmi';
import { MyPositions } from '@/components/tg/arena/MyPositions';
import { NotificationSettingsPanel } from '@/components/arena/NotificationSettingsPanel';
import { BadgeIcon, BADGE_DEFINITIONS, BadgeType } from '@/components/badges';
import { 
  Trophy, Target, Flame, Medal, 
  Share2, Settings, Wallet, ChevronRight,
  TrendingUp, Swords, Moon, Sun, X, LogOut, Copy, Check, Bell, Loader2, RefreshCw
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 20px;
`;

const Avatar = styled.div<{ $accentColor: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
  border: 3px solid ${props => props.$accentColor};
`;

const Username = styled.h2<{ $textColor: string }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$textColor};
  margin: 0 0 4px 0;
`;

const WalletAddress = styled.p<{ $textColor: string }>`
  font-size: 13px;
  color: ${props => props.$textColor};
  margin: 0;
  font-family: monospace;
`;

const LevelBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.1) 100%);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #ffd700;
`;

const XpBar = styled.div<{ $mutedColor: string; $accentColor: string }>`
  width: 100%;
  max-width: 200px;
  margin-top: 12px;
  
  .bar {
    height: 6px;
    background: ${props => props.$mutedColor}30;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 4px;
    
    .fill {
      height: 100%;
      background: linear-gradient(90deg, ${props => props.$accentColor}, ${props => props.$accentColor}cc);
      border-radius: 3px;
      transition: width 0.5s ease;
    }
  }
  
  .text {
    font-size: 11px;
    color: ${props => props.$mutedColor};
    text-align: center;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ $bgColor: string; $textColor: string; $mutedColor: string; $loading?: boolean }>`
  background: ${props => props.$bgColor};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  opacity: ${props => props.$loading ? 0.6 : 1};
  transition: opacity 0.3s;
  
  .icon {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
    color: ${props => props.$mutedColor};
  }
  
  .value {
    font-size: 22px;
    font-weight: 700;
    color: ${props => props.$textColor};
    margin-bottom: 4px;
  }
  
  .label {
    font-size: 12px;
    color: ${props => props.$mutedColor};
  }
`;

const SectionTitle = styled.h3<{ $textColor: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$textColor};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const BadgesList = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  margin-bottom: 24px;
  padding-bottom: 8px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
  }
`;

const BadgeItem = styled.div<{ $earned?: boolean; $accentColor: string; $bgColor: string; $textColor: string }>`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: ${({ $earned, $accentColor, $bgColor }) => $earned 
    ? `linear-gradient(135deg, ${$accentColor}15 0%, ${$accentColor}08 100%)`
    : $bgColor
  };
  border: 1px solid ${({ $earned, $accentColor }) => $earned 
    ? `${$accentColor}50`
    : 'transparent'
  };
  border-radius: 12px;
  min-width: 90px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.95);
  }
  
  .name {
    font-size: 11px;
    font-weight: 600;
    color: ${({ $earned, $textColor }) => $earned ? $textColor : `${$textColor}60`};
    text-align: center;
  }
  
  .xp {
    font-size: 10px;
    color: ${props => props.$accentColor};
  }
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MenuItem = styled.button<{ $bgColor: string; $textColor: string; $mutedColor: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 12px;
  background: ${props => props.$bgColor};
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
  
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => props.$mutedColor}15;
    color: ${props => props.$textColor}b0;
  }
  
  .text {
    flex: 1;
    text-align: left;
    
    .title {
      font-size: 14px;
      font-weight: 600;
      color: ${props => props.$textColor};
    }
    
    .subtitle {
      font-size: 12px;
      color: ${props => props.$mutedColor};
    }
  }
  
  .arrow {
    color: ${props => props.$mutedColor};
  }
`;

const ThemeToggle = styled.div<{ $bgColor: string; $accentColor: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  background: ${props => props.$bgColor};
  border-radius: 20px;
`;

const ThemeButton = styled.button<{ $active: boolean; $accentColor: string; $textColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? props.$accentColor : 'transparent'};
  color: ${props => props.$active ? '#000' : props.$textColor};
  
  &:active {
    transform: scale(0.9);
  }
`;

// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div<{ $bgColor: string; $textColor: string }>`
  background: ${props => props.$bgColor};
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div<{ $borderColor: string; $textColor: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.$borderColor};
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${props => props.$textColor};
  }
`;

const CloseButton = styled.button<{ $textColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--border-light);
  color: ${props => props.$textColor};
  cursor: pointer;
  
  &:active {
    transform: scale(0.95);
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const WalletInfo = styled.div<{ $bgColor: string; $textColor: string; $mutedColor: string }>`
  background: ${props => props.$bgColor};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  
  .label {
    font-size: 12px;
    color: ${props => props.$mutedColor};
    margin-bottom: 8px;
  }
  
  .address {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: monospace;
    font-size: 14px;
    color: ${props => props.$textColor};
    word-break: break-all;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 10px;
  
  background: ${props => props.$variant === 'danger' 
    ? 'rgba(239, 68, 68, 0.15)' 
    : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'};
  color: ${props => props.$variant === 'danger' ? '#EF4444' : '#fff'};
  
  &:active {
    transform: scale(0.98);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ShareButton = styled.button<{ $bgColor: string; $textColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 10px;
  
  &:active {
    transform: scale(0.98);
  }
`;

const BadgeModal = styled.div<{ $bgColor: string }>`
  padding: 20px;
  text-align: center;
  
  .badge-icon {
    margin: 0 auto 16px;
  }
  
  .badge-name {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  .badge-desc {
    font-size: 14px;
    opacity: 0.7;
    margin-bottom: 16px;
  }
  
  .badge-requirement {
    font-size: 12px;
    padding: 8px 16px;
    background: ${props => props.$bgColor};
    border-radius: 8px;
    display: inline-block;
  }
  
  .badge-xp {
    margin-top: 16px;
    font-size: 14px;
    font-weight: 600;
    color: #ffd700;
  }
`;

interface UserProfile {
  wallet: string;
  username?: string;
  xp: number;
  tier: string;
  badges: string[];
  stats: {
    totalBets: number;
    wins: number;
    losses: number;
    winRate: number;
    duelsWon: number;
    currentStreak: number;
    bestStreak: number;
  };
  level: number;
  xpToNextLevel: number;
  xpProgress: number;
}

// Badge type mapping from backend string to our BadgeType
const BADGE_MAP: Record<string, BadgeType> = {
  'first_bet': 'first_bet',
  'firstBet': 'first_bet',
  '3_streak': 'streak_3',
  'streak3': 'streak_3',
  '5_streak': 'streak_5',
  'streak5': 'streak_5',
  '10_streak': 'streak_10',
  'streak10': 'streak_10',
  'duelist': 'duelist',
  'duel_master': 'duel_master',
  'duelMaster': 'duel_master',
  'top_10': 'top_10',
  'top10': 'top_10',
  'top_3': 'top_3',
  'top3': 'top_3',
  'diamond': 'diamond',
  'diamondHands': 'diamond',
  'whale': 'whale',
  'sharpshooter': 'sharpshooter',
  'prophet': 'prophet',
  'early_bird': 'early_bird',
  'earlyBird': 'early_bird',
  'night_owl': 'night_owl',
  'nightOwl': 'night_owl',
  'social_butterfly': 'social_butterfly',
  'socialButterfly': 'social_butterfly',
  'referral_king': 'referral_king',
  'referralKing': 'referral_king',
};

// Default badges to show
const DEFAULT_BADGES: BadgeType[] = [
  'first_bet', 'streak_3', 'duelist', 'top_10', 'diamond', 'whale'
];

export default function TgProfilePage() {
  const { theme, mode, toggleTheme, setTheme } = useTheme();
  const { 
    isConnected, 
    walletAddress, 
    shortAddress, 
    connectWallet, 
    disconnectWallet,
    token
  } = useWallet();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState<BadgeType | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/analysts/${walletAddress}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const data = result.data;
        const xp = data.xp || 0;
        const level = Math.floor(xp / 1000) + 1;
        const xpInLevel = xp % 1000;
        const xpToNextLevel = 1000;
        
        setProfile({
          wallet: data.wallet || walletAddress,
          username: data.username || data.name,
          xp: xp,
          tier: data.tier || 'Bronze',
          badges: data.badges || [],
          stats: {
            totalBets: data.stats?.totalBets || 0,
            wins: data.stats?.wins || 0,
            losses: data.stats?.losses || 0,
            winRate: data.stats?.winRate || 0,
            duelsWon: data.stats?.duelsWon || 0,
            currentStreak: data.stats?.currentStreak || 0,
            bestStreak: data.stats?.bestStreak || 0,
          },
          level,
          xpToNextLevel,
          xpProgress: (xpInLevel / xpToNextLevel) * 100,
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchProfile();
    }
  }, [isConnected, walletAddress, fetchProfile]);

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareProfile = () => {
    const shareUrl = `https://t.me/FOMO_a_bot?startapp=ref_${shortAddress || 'demo'}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join me on FOMO Arena!',
        text: 'Bet on predictions and earn rewards!',
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  // Get earned badges
  const earnedBadges = new Set(
    (profile?.badges || []).map(b => BADGE_MAP[b] || b).filter(Boolean)
  );
  
  // Display badges
  const displayBadges = DEFAULT_BADGES.map(badgeType => ({
    type: badgeType,
    earned: earnedBadges.has(badgeType),
  }));

  const displayAddress = isConnected ? shortAddress : '0x1234...5678';
  const displayName = profile?.username || (isConnected ? shortAddress : 'Connect Wallet');

  return (
    <TgPageContainer>
      <ProfileHeader>
        <Avatar $accentColor={theme.accent}>
          {displayName?.slice(0, 2).toUpperCase() || 'CK'}
        </Avatar>
        <Username $textColor={theme.textPrimary}>{displayName}</Username>
        <WalletAddress $textColor={theme.textMuted}>{displayAddress}</WalletAddress>
        <LevelBadge>
          <Trophy size={14} /> Level {profile?.level || 1}
        </LevelBadge>
        <XpBar $mutedColor={theme.textMuted} $accentColor={theme.accent}>
          <div className="bar">
            <div className="fill" style={{ width: `${profile?.xpProgress || 0}%` }} />
          </div>
          <div className="text">
            {profile?.xp || 0} / {((profile?.level || 1) * 1000)} XP to Level {(profile?.level || 1) + 1}
          </div>
        </XpBar>
      </ProfileHeader>

      <StatsGrid>
        <StatCard $bgColor={theme.bgCard} $textColor={theme.textPrimary} $mutedColor={theme.textMuted} $loading={loading}>
          <div className="icon"><Target size={20} /></div>
          <div className="value">{profile?.stats.totalBets || 0}</div>
          <div className="label">Total Bets</div>
        </StatCard>
        <StatCard $bgColor={theme.bgCard} $textColor={theme.textPrimary} $mutedColor={theme.textMuted} $loading={loading}>
          <div className="icon"><Trophy size={20} /></div>
          <div className="value">{profile?.stats.wins || 0}</div>
          <div className="label">Wins</div>
        </StatCard>
        <StatCard $bgColor={theme.bgCard} $textColor={theme.textPrimary} $mutedColor={theme.textMuted} $loading={loading}>
          <div className="icon"><TrendingUp size={20} /></div>
          <div className="value">{profile?.stats.winRate || 0}%</div>
          <div className="label">Win Rate</div>
        </StatCard>
        <StatCard $bgColor={theme.bgCard} $textColor={theme.textPrimary} $mutedColor={theme.textMuted} $loading={loading}>
          <div className="icon"><Swords size={20} /></div>
          <div className="value">{profile?.stats.duelsWon || 0}</div>
          <div className="label">Duels Won</div>
        </StatCard>
      </StatsGrid>

      <SectionTitle $textColor={theme.textMuted}>My Positions</SectionTitle>
      <MyPositions />

      <SectionHeader>
        <SectionTitle $textColor={theme.textMuted}>Badges</SectionTitle>
        <RefreshCw 
          size={14} 
          style={{ color: theme.textMuted, cursor: 'pointer' }} 
          onClick={fetchProfile}
        />
      </SectionHeader>
      <BadgesList>
        {displayBadges.map((badge) => (
          <BadgeItem 
            key={badge.type}
            $earned={badge.earned}
            $accentColor={theme.accent}
            $bgColor={theme.bgCard}
            $textColor={theme.textPrimary}
            onClick={() => setShowBadgeModal(badge.type)}
            data-testid={`badge-item-${badge.type}`}
          >
            <BadgeIcon type={badge.type} earned={badge.earned} size={48} showTooltip={false} />
            <span className="name">{BADGE_DEFINITIONS[badge.type]?.name}</span>
            {badge.earned && (
              <span className="xp">+{BADGE_DEFINITIONS[badge.type]?.xpReward} XP</span>
            )}
          </BadgeItem>
        ))}
      </BadgesList>

      <SectionTitle $textColor={theme.textMuted}>Settings</SectionTitle>
      <MenuList>
        <MenuItem 
          $bgColor={theme.bgCard} 
          $textColor={theme.textPrimary} 
          $mutedColor={theme.textMuted}
          onClick={() => setShowWalletModal(true)}
          data-testid="wallet-menu-item"
        >
          <div className="icon"><Wallet size={18} /></div>
          <div className="text">
            <div className="title">Wallet</div>
            <div className="subtitle">{isConnected ? `Connected: ${displayAddress}` : 'Not connected'}</div>
          </div>
          <ChevronRight size={18} className="arrow" />
        </MenuItem>

        <MenuItem 
          $bgColor={theme.bgCard} 
          $textColor={theme.textPrimary} 
          $mutedColor={theme.textMuted}
          as="div"
        >
          <div className="icon">{mode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}</div>
          <div className="text">
            <div className="title">Theme</div>
            <div className="subtitle">{mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
          </div>
          <ThemeToggle $bgColor={theme.bgSecondary} $accentColor={theme.accent}>
            <ThemeButton 
              $active={mode === 'light'} 
              $accentColor={theme.accent}
              $textColor={theme.textPrimary}
              onClick={() => setTheme('light')}
              data-testid="theme-light-btn"
            >
              <Sun size={16} />
            </ThemeButton>
            <ThemeButton 
              $active={mode === 'dark'} 
              $accentColor={theme.accent}
              $textColor={theme.textPrimary}
              onClick={() => setTheme('dark')}
              data-testid="theme-dark-btn"
            >
              <Moon size={16} />
            </ThemeButton>
          </ThemeToggle>
        </MenuItem>

        <MenuItem 
          $bgColor={theme.bgCard} 
          $textColor={theme.textPrimary} 
          $mutedColor={theme.textMuted}
          onClick={() => setShowShareModal(true)}
          data-testid="share-menu-item"
        >
          <div className="icon"><Share2 size={18} /></div>
          <div className="text">
            <div className="title">Share Profile</div>
            <div className="subtitle">Invite friends, earn rewards</div>
          </div>
          <ChevronRight size={18} className="arrow" />
        </MenuItem>
        
        <MenuItem 
          $bgColor={theme.bgCard} 
          $textColor={theme.textPrimary} 
          $mutedColor={theme.textMuted}
          onClick={() => setShowSettingsModal(true)}
          data-testid="settings-menu-item"
        >
          <div className="icon"><Settings size={18} /></div>
          <div className="text">
            <div className="title">Settings</div>
            <div className="subtitle">Notifications, preferences</div>
          </div>
          <ChevronRight size={18} className="arrow" />
        </MenuItem>
      </MenuList>

      {/* Wallet Modal */}
      {showWalletModal && (
        <ModalOverlay onClick={() => setShowWalletModal(false)}>
          <ModalContent 
            $bgColor={theme.bgPrimary} 
            $textColor={theme.textPrimary}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader $borderColor={theme.border} $textColor={theme.textPrimary}>
              <h3>Wallet</h3>
              <CloseButton $textColor={theme.textPrimary} onClick={() => setShowWalletModal(false)}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              {isConnected ? (
                <>
                  <WalletInfo $bgColor={theme.bgCard} $textColor={theme.textPrimary} $mutedColor={theme.textMuted}>
                    <div className="label">Connected Address</div>
                    <div className="address">
                      <span>{walletAddress}</span>
                      <button onClick={copyAddress} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.accent, flexShrink: 0 }}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </WalletInfo>
                  <ActionButton $variant="danger" onClick={() => { disconnectWallet(); setShowWalletModal(false); }}>
                    <LogOut size={18} />
                    Disconnect Wallet
                  </ActionButton>
                </>
              ) : (
                <ActionButton onClick={() => { connectWallet(); setShowWalletModal(false); }}>
                  <Wallet size={18} />
                  Connect Wallet
                </ActionButton>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ModalOverlay onClick={() => setShowShareModal(false)}>
          <ModalContent 
            $bgColor={theme.bgPrimary} 
            $textColor={theme.textPrimary}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader $borderColor={theme.border} $textColor={theme.textPrimary}>
              <h3>Share Profile</h3>
              <CloseButton $textColor={theme.textPrimary} onClick={() => setShowShareModal(false)}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <p style={{ color: theme.textSecondary, marginBottom: 16, fontSize: 14 }}>
                Invite friends to FOMO Arena and earn 10% of their trading fees!
              </p>
              <ActionButton onClick={shareProfile}>
                <Share2 size={18} />
                Share Referral Link
              </ActionButton>
              <ShareButton 
                $bgColor={theme.bgCard} 
                $textColor={theme.textPrimary}
                onClick={() => {
                  const link = `https://t.me/FOMO_a_bot?startapp=ref_${shortAddress || 'demo'}`;
                  navigator.clipboard.writeText(link);
                  alert('Link copied!');
                }}
              >
                <Copy size={16} />
                Copy Link
              </ShareButton>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <ModalOverlay onClick={() => setShowSettingsModal(false)}>
          <ModalContent 
            $bgColor={theme.bgPrimary} 
            $textColor={theme.textPrimary}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader $borderColor={theme.border} $textColor={theme.textPrimary}>
              <h3>Notification Settings</h3>
              <CloseButton $textColor={theme.textPrimary} onClick={() => setShowSettingsModal(false)}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <NotificationSettingsPanel 
                wallet={walletAddress || ''} 
                onSave={() => setShowSettingsModal(false)}
              />
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Badge Detail Modal */}
      {showBadgeModal && (
        <ModalOverlay onClick={() => setShowBadgeModal(null)}>
          <ModalContent 
            $bgColor={theme.bgPrimary} 
            $textColor={theme.textPrimary}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader $borderColor={theme.border} $textColor={theme.textPrimary}>
              <h3>Badge Details</h3>
              <CloseButton $textColor={theme.textPrimary} onClick={() => setShowBadgeModal(null)}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>
            <BadgeModal $bgColor={theme.bgCard}>
              <div className="badge-icon">
                <BadgeIcon 
                  type={showBadgeModal} 
                  earned={earnedBadges.has(showBadgeModal)} 
                  size={80} 
                  showTooltip={false} 
                />
              </div>
              <div className="badge-name" style={{ color: theme.textPrimary }}>
                {BADGE_DEFINITIONS[showBadgeModal]?.name}
              </div>
              <div className="badge-desc" style={{ color: theme.textSecondary }}>
                {BADGE_DEFINITIONS[showBadgeModal]?.description}
              </div>
              <div className="badge-requirement" style={{ color: theme.textMuted }}>
                {BADGE_DEFINITIONS[showBadgeModal]?.requirement}
              </div>
              <div className="badge-xp">
                {earnedBadges.has(showBadgeModal) ? '✓ Earned' : `+${BADGE_DEFINITIONS[showBadgeModal]?.xpReward} XP`}
              </div>
            </BadgeModal>
          </ModalContent>
        </ModalOverlay>
      )}
    </TgPageContainer>
  );
}
