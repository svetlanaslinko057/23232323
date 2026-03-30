'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';

const shine = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 0.7; }
  100% { opacity: 0.3; }
`;

const BadgeWrapper = styled.div<{ $earned: boolean; $size: number }>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  position: relative;
  filter: ${props => props.$earned ? 'none' : 'grayscale(100%) opacity(0.4)'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${props => props.$earned ? 'scale(1.1)' : 'none'};
  }
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const ShineOverlay = styled.div<{ $earned: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%);
  animation: ${shine} 3s ease-in-out infinite;
  opacity: ${props => props.$earned ? 1 : 0};
  pointer-events: none;
  border-radius: 50%;
`;

// Badge Types
export type BadgeType = 
  | 'first_bet'
  | 'streak_3'
  | 'streak_5'
  | 'streak_10'
  | 'duelist'
  | 'duel_master'
  | 'top_10'
  | 'top_3'
  | 'diamond'
  | 'whale'
  | 'sharpshooter'
  | 'prophet'
  | 'early_bird'
  | 'night_owl'
  | 'social_butterfly'
  | 'referral_king';

export interface BadgeDefinition {
  id: BadgeType;
  name: string;
  description: string;
  xpReward: number;
  requirement: string;
  color: string;
  gradient: [string, string];
}

export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  first_bet: {
    id: 'first_bet',
    name: 'First Bet',
    description: 'Place your first prediction',
    xpReward: 100,
    requirement: 'Place 1 bet',
    color: '#4ADE80',
    gradient: ['#22C55E', '#16A34A'],
  },
  streak_3: {
    id: 'streak_3',
    name: '3 Streak',
    description: 'Win 3 predictions in a row',
    xpReward: 250,
    requirement: 'Win 3 consecutive bets',
    color: '#F97316',
    gradient: ['#F97316', '#EA580C'],
  },
  streak_5: {
    id: 'streak_5',
    name: '5 Streak',
    description: 'Win 5 predictions in a row',
    xpReward: 500,
    requirement: 'Win 5 consecutive bets',
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
  },
  streak_10: {
    id: 'streak_10',
    name: 'On Fire',
    description: 'Win 10 predictions in a row',
    xpReward: 1500,
    requirement: 'Win 10 consecutive bets',
    color: '#FF6B35',
    gradient: ['#FF6B35', '#F7931E'],
  },
  duelist: {
    id: 'duelist',
    name: 'Duelist',
    description: 'Win your first duel',
    xpReward: 300,
    requirement: 'Win 1 duel',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
  },
  duel_master: {
    id: 'duel_master',
    name: 'Duel Master',
    description: 'Win 10 duels',
    xpReward: 1000,
    requirement: 'Win 10 duels',
    color: '#A855F7',
    gradient: ['#A855F7', '#9333EA'],
  },
  top_10: {
    id: 'top_10',
    name: 'Top 10',
    description: 'Reach top 10 on leaderboard',
    xpReward: 750,
    requirement: 'Reach rank #10 or higher',
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA500'],
  },
  top_3: {
    id: 'top_3',
    name: 'Podium',
    description: 'Reach top 3 on leaderboard',
    xpReward: 2000,
    requirement: 'Reach rank #3 or higher',
    color: '#FFD700',
    gradient: ['#FFD700', '#FF8C00'],
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond Hands',
    description: 'Hold position through 50% swing',
    xpReward: 500,
    requirement: 'Hold during volatility',
    color: '#00D4FF',
    gradient: ['#00D4FF', '#0099FF'],
  },
  whale: {
    id: 'whale',
    name: 'Whale',
    description: 'Place a bet over $1000',
    xpReward: 1000,
    requirement: 'Single bet > $1000',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB'],
  },
  sharpshooter: {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: '80% win rate with 20+ bets',
    xpReward: 1500,
    requirement: '80%+ win rate (20+ bets)',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
  },
  prophet: {
    id: 'prophet',
    name: 'Prophet',
    description: 'Predict 5 underdog wins',
    xpReward: 800,
    requirement: 'Win 5 bets with >3x odds',
    color: '#EC4899',
    gradient: ['#EC4899', '#DB2777'],
  },
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Place 10 bets before noon',
    xpReward: 200,
    requirement: '10 bets before 12:00',
    color: '#FBBF24',
    gradient: ['#FBBF24', '#F59E0B'],
  },
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Place 10 bets after midnight',
    xpReward: 200,
    requirement: '10 bets after 00:00',
    color: '#6366F1',
    gradient: ['#6366F1', '#4F46E5'],
  },
  social_butterfly: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Share 10 wins',
    xpReward: 400,
    requirement: 'Share 10 wins',
    color: '#EC4899',
    gradient: ['#EC4899', '#BE185D'],
  },
  referral_king: {
    id: 'referral_king',
    name: 'Referral King',
    description: 'Invite 10 friends',
    xpReward: 1000,
    requirement: 'Refer 10 users',
    color: '#14B8A6',
    gradient: ['#14B8A6', '#0D9488'],
  },
};

interface BadgeIconProps {
  type: BadgeType;
  earned?: boolean;
  size?: number;
  showTooltip?: boolean;
}

// SVG Badge Components
const FirstBetSVG = ({ color, gradient }: { color: string; gradient: [string, string] }) => (
  <svg viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="firstBetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={gradient[0]} />
        <stop offset="100%" stopColor={gradient[1]} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#firstBetGrad)" />
    <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
    <path d="M50 25 L55 40 L70 40 L58 50 L63 65 L50 55 L37 65 L42 50 L30 40 L45 40 Z" fill="white" />
  </svg>
);

const StreakSVG = ({ color, gradient, count }: { color: string; gradient: [string, string]; count: number }) => (
  <svg viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id={`streakGrad${count}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={gradient[0]} />
        <stop offset="100%" stopColor={gradient[1]} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill={`url(#streakGrad${count})`} />
    <path d="M50 20 C60 35, 75 40, 70 55 C68 65, 55 75, 50 80 C45 75, 32 65, 30 55 C25 40, 40 35, 50 20 Z" fill="white" />
    <text x="50" y="58" textAnchor="middle" fill={color} fontSize="18" fontWeight="bold">{count}</text>
  </svg>
);

const DuelistSVG = ({ color, gradient }: { color: string; gradient: [string, string] }) => (
  <svg viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="duelistGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={gradient[0]} />
        <stop offset="100%" stopColor={gradient[1]} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#duelistGrad)" />
    <path d="M30 70 L45 30 L50 35 L55 30 L70 70 L55 60 L50 65 L45 60 Z" fill="white" />
    <line x1="30" y1="70" x2="70" y2="70" stroke="white" strokeWidth="3" />
  </svg>
);

const TrophySVG = ({ color, gradient, rank }: { color: string; gradient: [string, string]; rank?: string }) => (
  <svg viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={gradient[0]} />
        <stop offset="100%" stopColor={gradient[1]} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#trophyGrad)" />
    <path d="M35 30 H65 L62 50 C60 60, 55 65, 50 70 C45 65, 40 60, 38 50 Z" fill="white" />
    <rect x="45" y="70" width="10" height="8" fill="white" />
    <rect x="40" y="78" width="20" height="5" rx="2" fill="white" />
    <path d="M30 35 C25 35, 22 40, 25 50 C28 55, 35 50, 38 45" stroke="white" strokeWidth="3" fill="none" />
    <path d="M70 35 C75 35, 78 40, 75 50 C72 55, 65 50, 62 45" stroke="white" strokeWidth="3" fill="none" />
    {rank && <text x="50" y="55" textAnchor="middle" fill={color} fontSize="14" fontWeight="bold">{rank}</text>}
  </svg>
);

const DiamondSVG = ({ color, gradient }: { color: string; gradient: [string, string] }) => (
  <svg viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={gradient[0]} />
        <stop offset="100%" stopColor={gradient[1]} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#diamondGrad)" />
    <path d="M50 20 L30 40 L50 80 L70 40 Z" fill="white" />
    <path d="M30 40 L50 40 L40 25 Z" fill="rgba(255,255,255,0.7)" />
    <path d="M50 40 L70 40 L60 25 Z" fill="rgba(255,255,255,0.7)" />
    <line x1="30" y1="40" x2="70" y2="40" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
  </svg>
);

const WhaleSVG = ({ color, gradient }: { color: string; gradient: [string, string] }) => (
  <svg viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="whaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={gradient[0]} />
        <stop offset="100%" stopColor={gradient[1]} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#whaleGrad)" />
    <ellipse cx="50" cy="55" rx="30" ry="20" fill="white" />
    <path d="M20 50 C15 40, 25 35, 30 45" fill="white" />
    <circle cx="35" cy="50" r="3" fill={color} />
    <path d="M75 50 L85 40 L85 55 Z" fill="white" />
  </svg>
);

const SharpshooterSVG = ({ color, gradient }: { color: string; gradient: [string, string] }) => (
  <svg viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="sharpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={gradient[0]} />
        <stop offset="100%" stopColor={gradient[1]} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#sharpGrad)" />
    <circle cx="50" cy="50" r="25" fill="none" stroke="white" strokeWidth="3" />
    <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="3" />
    <circle cx="50" cy="50" r="5" fill="white" />
    <line x1="50" y1="20" x2="50" y2="35" stroke="white" strokeWidth="2" />
    <line x1="50" y1="65" x2="50" y2="80" stroke="white" strokeWidth="2" />
    <line x1="20" y1="50" x2="35" y2="50" stroke="white" strokeWidth="2" />
    <line x1="65" y1="50" x2="80" y2="50" stroke="white" strokeWidth="2" />
  </svg>
);

const ProphetSVG = ({ color, gradient }: { color: string; gradient: [string, string] }) => (
  <svg viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="prophetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={gradient[0]} />
        <stop offset="100%" stopColor={gradient[1]} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#prophetGrad)" />
    <circle cx="50" cy="45" r="18" fill="white" />
    <circle cx="50" cy="45" r="10" fill={color} />
    <circle cx="50" cy="45" r="5" fill="white" />
    <path d="M35 70 L50 55 L65 70" stroke="white" strokeWidth="4" fill="none" />
  </svg>
);

const SocialSVG = ({ color, gradient }: { color: string; gradient: [string, string] }) => (
  <svg viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="socialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={gradient[0]} />
        <stop offset="100%" stopColor={gradient[1]} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#socialGrad)" />
    <circle cx="50" cy="40" r="12" fill="white" />
    <circle cx="30" cy="55" r="8" fill="rgba(255,255,255,0.7)" />
    <circle cx="70" cy="55" r="8" fill="rgba(255,255,255,0.7)" />
    <path d="M35 70 Q50 65 65 70 Q60 60 50 58 Q40 60 35 70 Z" fill="white" />
  </svg>
);

const ReferralSVG = ({ color, gradient }: { color: string; gradient: [string, string] }) => (
  <svg viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="referralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={gradient[0]} />
        <stop offset="100%" stopColor={gradient[1]} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#referralGrad)" />
    <circle cx="50" cy="35" r="10" fill="white" />
    <circle cx="30" cy="55" r="8" fill="rgba(255,255,255,0.8)" />
    <circle cx="70" cy="55" r="8" fill="rgba(255,255,255,0.8)" />
    <line x1="50" y1="45" x2="35" y2="50" stroke="white" strokeWidth="2" />
    <line x1="50" y1="45" x2="65" y2="50" stroke="white" strokeWidth="2" />
    <path d="M25 75 L75 75 L70 65 L50 55 L30 65 Z" fill="white" />
  </svg>
);

const TimeSVG = ({ color, gradient, isNight }: { color: string; gradient: [string, string]; isNight?: boolean }) => (
  <svg viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id={isNight ? "nightGrad" : "dayGrad"} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={gradient[0]} />
        <stop offset="100%" stopColor={gradient[1]} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill={`url(#${isNight ? "nightGrad" : "dayGrad"})`} />
    {isNight ? (
      <>
        <path d="M55 30 C40 30, 30 45, 35 60 C40 75, 60 75, 65 60 C70 45, 60 30, 55 30 C60 35, 55 50, 50 55 C45 50, 50 35, 55 30 Z" fill="white" />
        <circle cx="70" cy="35" r="2" fill="white" />
        <circle cx="30" cy="45" r="1.5" fill="white" />
        <circle cx="75" cy="55" r="1" fill="white" />
      </>
    ) : (
      <>
        <circle cx="50" cy="50" r="15" fill="white" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line 
            key={i}
            x1={50 + 22 * Math.cos(angle * Math.PI / 180)} 
            y1={50 + 22 * Math.sin(angle * Math.PI / 180)}
            x2={50 + 28 * Math.cos(angle * Math.PI / 180)} 
            y2={50 + 28 * Math.sin(angle * Math.PI / 180)}
            stroke="white" 
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
      </>
    )}
  </svg>
);

export function BadgeIcon({ type, earned = false, size = 48, showTooltip = true }: BadgeIconProps) {
  const definition = BADGE_DEFINITIONS[type];
  if (!definition) return null;

  const renderBadgeSVG = () => {
    switch (type) {
      case 'first_bet':
        return <FirstBetSVG color={definition.color} gradient={definition.gradient} />;
      case 'streak_3':
        return <StreakSVG color={definition.color} gradient={definition.gradient} count={3} />;
      case 'streak_5':
        return <StreakSVG color={definition.color} gradient={definition.gradient} count={5} />;
      case 'streak_10':
        return <StreakSVG color={definition.color} gradient={definition.gradient} count={10} />;
      case 'duelist':
      case 'duel_master':
        return <DuelistSVG color={definition.color} gradient={definition.gradient} />;
      case 'top_10':
        return <TrophySVG color={definition.color} gradient={definition.gradient} rank="10" />;
      case 'top_3':
        return <TrophySVG color={definition.color} gradient={definition.gradient} rank="3" />;
      case 'diamond':
        return <DiamondSVG color={definition.color} gradient={definition.gradient} />;
      case 'whale':
        return <WhaleSVG color={definition.color} gradient={definition.gradient} />;
      case 'sharpshooter':
        return <SharpshooterSVG color={definition.color} gradient={definition.gradient} />;
      case 'prophet':
        return <ProphetSVG color={definition.color} gradient={definition.gradient} />;
      case 'early_bird':
        return <TimeSVG color={definition.color} gradient={definition.gradient} isNight={false} />;
      case 'night_owl':
        return <TimeSVG color={definition.color} gradient={definition.gradient} isNight={true} />;
      case 'social_butterfly':
        return <SocialSVG color={definition.color} gradient={definition.gradient} />;
      case 'referral_king':
        return <ReferralSVG color={definition.color} gradient={definition.gradient} />;
      default:
        return <FirstBetSVG color={definition.color} gradient={definition.gradient} />;
    }
  };

  return (
    <BadgeWrapper 
      $earned={earned} 
      $size={size}
      title={showTooltip ? `${definition.name}: ${definition.description}` : undefined}
      data-testid={`badge-${type}`}
    >
      {renderBadgeSVG()}
      <ShineOverlay $earned={earned} />
    </BadgeWrapper>
  );
}

export default BadgeIcon;
