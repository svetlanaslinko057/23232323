'use client';

import React, { useState, useEffect } from "react";
import { X, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  CloseButton,
  ModalBody,
  FormSection,
  SectionLabel,
  SideButtons,
  SideButton,
  StakeInputWrapper,
  StakeInput,
  SpinnerButtons,
  NoteText,
  ModalFooter,
  CancelButton,
  SubmitButton,
} from "./CreateDuelModal.styles";
import CustomDropdown from "@/UI/CustomDropdown";
import { DuelToast } from "@/UI/DuelToast/DuelToast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface CreateDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Mock data for prediction markets (will be fetched from API when markets exist)
const defaultMarkets = [
  { value: "custom", label: "Custom Prediction (Enter your own)" },
];

export const CreateDuelModal: React.FC<CreateDuelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { address, isConnected } = useAccount();
  const [selectedMarket, setSelectedMarket] = useState("custom");
  const [customPrediction, setCustomPrediction] = useState("");
  const [side, setSide] = useState<"yes" | "no" | null>(null);
  const [stakeAmount, setStakeAmount] = useState<number>(10);
  const [opponentWallet, setOpponentWallet] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markets, setMarkets] = useState(defaultMarkets);

  // Fetch markets on mount
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch(`${API_URL}/api/onchain/markets?limit=50`);
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const marketOptions = result.data.map((m: any) => ({
            value: m.id || m._id,
            label: m.title || m.question || `Market #${m.id}`,
          }));
          setMarkets([...defaultMarkets, ...marketOptions]);
        }
      } catch (error) {
        console.error('Failed to fetch markets:', error);
      }
    };
    if (isOpen) {
      fetchMarkets();
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedMarket("custom");
      setCustomPrediction("");
      setSide(null);
      setStakeAmount(10);
      setOpponentWallet("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    const predictionTitle = selectedMarket === 'custom' 
      ? customPrediction 
      : markets.find(m => m.value === selectedMarket)?.label || customPrediction;

    if (!predictionTitle || predictionTitle.length < 5) {
      toast.error('Please enter a valid prediction');
      return;
    }

    if (!side) {
      toast.error('Please choose your side (Yes/No)');
      return;
    }

    if (stakeAmount < 10) {
      toast.error('Minimum stake is 10 USDT');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/duels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': address,
        },
        body: JSON.stringify({
          marketId: selectedMarket === 'custom' ? `custom-${Date.now()}` : selectedMarket,
          predictionTitle,
          side,
          stakeAmount,
          opponentWallet: opponentWallet || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success toast
        toast.success(
          <DuelToast
            title="Duel created!"
            description={opponentWallet 
              ? `Waiting for opponent to accept...`
              : "Open duel created. Waiting for someone to join."
            }
            buttonText="View Duel"
            onButtonClick={() => {
              console.log("Navigate to duel:", result.data?.id);
            }}
          />,
          {
            icon: false,
            style: {
              background: 'transparent',
              boxShadow: 'none',
              padding: 0,
            },
          }
        );
        
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || 'Failed to create duel');
      }
    } catch (error) {
      console.error('Create duel error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSideClick = (selectedSide: "yes" | "no") => {
    setSide(side === selectedSide ? null : selectedSide);
  };

  const predictionTitle = selectedMarket === 'custom' 
    ? customPrediction 
    : markets.find(m => m.value === selectedMarket)?.label || '';
  
  const isValid = predictionTitle.length >= 5 && side && stakeAmount >= 10;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <h2>Create New Duel</h2>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <FormSection>
            <SectionLabel>Select Market or Create Custom</SectionLabel>
            <CustomDropdown
              options={markets}
              value={selectedMarket}
              onChange={(value) => setSelectedMarket(value as string)}
              placeholder="Choose a prediction market"
              searchable={true}
              isShowSuccess={false}
            />
          </FormSection>

          {selectedMarket === 'custom' && (
            <FormSection>
              <SectionLabel>Your Prediction</SectionLabel>
              <textarea
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'none',
                }}
                placeholder="e.g., Bitcoin will reach $100k by Q1 2026"
                value={customPrediction}
                onChange={(e) => setCustomPrediction(e.target.value)}
              />
            </FormSection>
          )}

          <FormSection>
            <SectionLabel>Choose Your Side</SectionLabel>
            <SideButtons>
              <SideButton
                active={side === "yes"}
                variant="yes"
                onClick={() => handleSideClick("yes")}
              >
                Yes
              </SideButton>
              <SideButton
                active={side === "no"}
                variant="no"
                onClick={() => handleSideClick("no")}
              >
                No
              </SideButton>
            </SideButtons>
          </FormSection>

          <FormSection>
            <SectionLabel>Stake Amount (USDT)</SectionLabel>
            <StakeInputWrapper>
              <StakeInput>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Math.max(10, Number(e.target.value)))}
                  placeholder="Enter amount (min 10)"
                  min="10"
                />
                <span className="increment">+10</span>
                <SpinnerButtons>
                  <button onClick={() => setStakeAmount((prev) => prev + 10)}>
                    <ChevronUp size={12} />
                  </button>
                  <button onClick={() => setStakeAmount((prev) => Math.max(10, prev - 10))}>
                    <ChevronDown size={12} />
                  </button>
                </SpinnerButtons>
              </StakeInput>
            </StakeInputWrapper>
          </FormSection>

          <FormSection>
            <SectionLabel>Opponent Wallet (Optional)</SectionLabel>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
              }}
              placeholder="0x... or leave empty for open challenge"
              value={opponentWallet}
              onChange={(e) => setOpponentWallet(e.target.value)}
            />
          </FormSection>

          <NoteText>
            <strong>Note:</strong> Minimum stake is 10 USDT. Winner takes the entire pot minus 2% platform fee.
            Duels compare results between two users on the same prediction.
          </NoteText>
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SubmitButton 
            onClick={handleSubmit} 
            disabled={!isValid || isSubmitting || !isConnected}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
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
};
