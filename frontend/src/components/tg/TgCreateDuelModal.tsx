'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, ChevronUp, ChevronDown, Loader2, Check, AlertCircle } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { useWallet } from '@/lib/wagmi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Styled components
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 0;
`;

const ModalContent = styled.div<{ $bgColor: string }>`
  background: ${props => props.$bgColor};
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`;

const ModalHeader = styled.div<{ $borderColor: string; $textColor: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid ${props => props.$borderColor};
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 1;
  
  h2 {
    font-size: 18px;
    font-weight: 700;
    color: ${props => props.$textColor};
    margin: 0;
  }
`;

const CloseButton = styled.button<{ $mutedColor: string }>`
  background: none;
  border: none;
  color: ${props => props.$mutedColor};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active { opacity: 0.7; }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const SectionLabel = styled.label<{ $textColor: string }>`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$textColor};
  margin-bottom: 10px;
`;

const Input = styled.input<{ $bgColor: string; $textColor: string; $borderColor: string }>`
  width: 100%;
  padding: 14px 16px;
  background: ${props => props.$bgColor};
  border: 1px solid ${props => props.$borderColor};
  border-radius: 12px;
  color: ${props => props.$textColor};
  font-size: 15px;
  
  &:focus {
    outline: none;
    border-color: #10B981;
  }
  
  &::placeholder {
    color: ${props => props.$borderColor};
  }
`;

const TextArea = styled.textarea<{ $bgColor: string; $textColor: string; $borderColor: string }>`
  width: 100%;
  padding: 14px 16px;
  background: ${props => props.$bgColor};
  border: 1px solid ${props => props.$borderColor};
  border-radius: 12px;
  color: ${props => props.$textColor};
  font-size: 15px;
  min-height: 80px;
  resize: none;
  
  &:focus {
    outline: none;
    border-color: #10B981;
  }
  
  &::placeholder {
    color: ${props => props.$borderColor};
  }
`;

const SideButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const SideButton = styled.button<{ $active: boolean; $variant: 'yes' | 'no'; $bgColor: string }>`
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ $active, $variant, $bgColor }) => {
    if ($active) {
      return $variant === 'yes'
        ? `background: #10B981; color: white; border: 2px solid #10B981;`
        : `background: #EF4444; color: white; border: 2px solid #EF4444;`;
    }
    return `background: ${$bgColor}; color: #888; border: 2px solid transparent;`;
  }}
  
  &:active { transform: scale(0.98); }
`;

const StakeInputWrapper = styled.div<{ $bgColor: string; $borderColor: string }>`
  display: flex;
  align-items: center;
  background: ${props => props.$bgColor};
  border: 1px solid ${props => props.$borderColor};
  border-radius: 12px;
  padding: 4px;
`;

const StakeInput = styled.input<{ $textColor: string }>`
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$textColor};
  
  &:focus { outline: none; }
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const StakeUnit = styled.span<{ $mutedColor: string }>`
  padding: 0 12px;
  color: ${props => props.$mutedColor};
  font-weight: 600;
`;

const SpinnerButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 8px;
`;

const SpinnerButton = styled.button<{ $bgColor: string; $textColor: string }>`
  background: ${props => props.$bgColor};
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  color: ${props => props.$textColor};
  
  &:active { opacity: 0.7; }
`;

const QuickAmounts = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const QuickAmountButton = styled.button<{ $bgColor: string; $textColor: string }>`
  flex: 1;
  padding: 10px;
  background: ${props => props.$bgColor};
  border: none;
  border-radius: 8px;
  color: ${props => props.$textColor};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  
  &:active { opacity: 0.7; }
`;

const NoteText = styled.p<{ $mutedColor: string }>`
  font-size: 12px;
  color: ${props => props.$mutedColor};
  margin: 16px 0 0 0;
  padding: 12px;
  background: ${props => props.$mutedColor}10;
  border-radius: 8px;
  line-height: 1.5;
`;

const ModalFooter = styled.div<{ $borderColor: string }>`
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid ${props => props.$borderColor};
  position: sticky;
  bottom: 0;
  background: inherit;
`;

const CancelButton = styled.button<{ $bgColor: string; $textColor: string }>`
  flex: 1;
  padding: 16px;
  background: ${props => props.$bgColor};
  border: none;
  border-radius: 12px;
  color: ${props => props.$textColor};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  
  &:active { opacity: 0.8; }
`;

const SubmitButton = styled.button<{ $disabled: boolean }>`
  flex: 2;
  padding: 16px;
  background: ${props => props.$disabled ? '#444' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'};
  border: none;
  border-radius: 12px;
  color: ${props => props.$disabled ? '#888' : 'white'};
  font-size: 15px;
  font-weight: 700;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:active:not(:disabled) { transform: scale(0.98); }
`;

const ErrorMessage = styled.div<{ $dangerColor: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: ${props => props.$dangerColor}20;
  border: 1px solid ${props => props.$dangerColor}50;
  border-radius: 8px;
  color: ${props => props.$dangerColor};
  font-size: 13px;
  margin-bottom: 16px;
`;

const SuccessMessage = styled.div<{ $successColor: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: ${props => props.$successColor}20;
  border: 1px solid ${props => props.$successColor}50;
  border-radius: 8px;
  color: ${props => props.$successColor};
  font-size: 13px;
  margin-bottom: 16px;
`;

interface CreateDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TgCreateDuelModal({ isOpen, onClose, onSuccess }: CreateDuelModalProps) {
  const { theme } = useTheme();
  const { walletAddress, isConnected } = useWallet();
  
  const [predictionTitle, setPredictionTitle] = useState('');
  const [side, setSide] = useState<'yes' | 'no' | null>(null);
  const [stakeAmount, setStakeAmount] = useState<number>(10);
  const [opponentWallet, setOpponentWallet] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPredictionTitle('');
      setSide(null);
      setStakeAmount(10);
      setOpponentWallet('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!predictionTitle || !side || stakeAmount < 10) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isConnected || !walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/duels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': walletAddress,
        },
        body: JSON.stringify({
          marketId: `custom-${Date.now()}`, // For custom duels without market
          predictionTitle,
          side,
          stakeAmount,
          opponentWallet: opponentWallet || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1500);
      } else {
        setError(result.message || 'Failed to create duel');
      }
    } catch (err) {
      console.error('Create duel error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = predictionTitle.length >= 5 && side && stakeAmount >= 10;

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContent $bgColor={theme.bgPrimary}>
        <ModalHeader $borderColor={theme.border} $textColor={theme.textPrimary}>
          <h2>Create New Duel</h2>
          <CloseButton $mutedColor={theme.textMuted} onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {error && (
            <ErrorMessage $dangerColor={theme.danger}>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}

          {success && (
            <SuccessMessage $successColor={theme.success}>
              <Check size={16} />
              Duel created successfully!
            </SuccessMessage>
          )}

          <FormSection>
            <SectionLabel $textColor={theme.textPrimary}>Prediction Title *</SectionLabel>
            <TextArea
              $bgColor={theme.bgCard}
              $textColor={theme.textPrimary}
              $borderColor={theme.border}
              placeholder="e.g., Bitcoin will reach $100k by end of Q1 2026"
              value={predictionTitle}
              onChange={(e) => setPredictionTitle(e.target.value)}
              data-testid="prediction-title-input"
            />
          </FormSection>

          <FormSection>
            <SectionLabel $textColor={theme.textPrimary}>Choose Your Side *</SectionLabel>
            <SideButtons>
              <SideButton
                $active={side === 'yes'}
                $variant="yes"
                $bgColor={theme.bgCard}
                onClick={() => setSide('yes')}
                data-testid="side-yes"
              >
                YES
              </SideButton>
              <SideButton
                $active={side === 'no'}
                $variant="no"
                $bgColor={theme.bgCard}
                onClick={() => setSide('no')}
                data-testid="side-no"
              >
                NO
              </SideButton>
            </SideButtons>
          </FormSection>

          <FormSection>
            <SectionLabel $textColor={theme.textPrimary}>Stake Amount (USDT) *</SectionLabel>
            <StakeInputWrapper $bgColor={theme.bgCard} $borderColor={theme.border}>
              <StakeInput
                type="number"
                $textColor={theme.textPrimary}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Math.max(0, Number(e.target.value)))}
                min="10"
                data-testid="stake-amount-input"
              />
              <StakeUnit $mutedColor={theme.textMuted}>USDT</StakeUnit>
              <SpinnerButtons>
                <SpinnerButton
                  $bgColor={theme.bgSecondary}
                  $textColor={theme.textPrimary}
                  onClick={() => setStakeAmount(prev => prev + 10)}
                >
                  <ChevronUp size={14} />
                </SpinnerButton>
                <SpinnerButton
                  $bgColor={theme.bgSecondary}
                  $textColor={theme.textPrimary}
                  onClick={() => setStakeAmount(prev => Math.max(10, prev - 10))}
                >
                  <ChevronDown size={14} />
                </SpinnerButton>
              </SpinnerButtons>
            </StakeInputWrapper>
            <QuickAmounts>
              {[10, 25, 50, 100].map(amount => (
                <QuickAmountButton
                  key={amount}
                  $bgColor={theme.bgSecondary}
                  $textColor={theme.textSecondary}
                  onClick={() => setStakeAmount(amount)}
                >
                  ${amount}
                </QuickAmountButton>
              ))}
            </QuickAmounts>
          </FormSection>

          <FormSection>
            <SectionLabel $textColor={theme.textPrimary}>Opponent Wallet (Optional)</SectionLabel>
            <Input
              $bgColor={theme.bgCard}
              $textColor={theme.textPrimary}
              $borderColor={theme.border}
              placeholder="0x... or leave empty for open challenge"
              value={opponentWallet}
              onChange={(e) => setOpponentWallet(e.target.value)}
              data-testid="opponent-wallet-input"
            />
          </FormSection>

          <NoteText $mutedColor={theme.textMuted}>
            <strong>Note:</strong> Minimum stake is 10 USDT. If no opponent is specified, 
            the duel will be open for anyone to join. Winner takes the entire pot minus 2% platform fee.
          </NoteText>
        </ModalBody>

        <ModalFooter $borderColor={theme.border}>
          <CancelButton
            $bgColor={theme.bgCard}
            $textColor={theme.textSecondary}
            onClick={onClose}
          >
            Cancel
          </CancelButton>
          <SubmitButton
            $disabled={!isValid || isSubmitting || !isConnected}
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting || !isConnected}
            data-testid="submit-duel"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating...
              </>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : (
              `Create Duel ($${stakeAmount})`
            )}
          </SubmitButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}
