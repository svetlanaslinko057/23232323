'use client';

import React from 'react';
import styled from 'styled-components';
import { X, Wallet } from 'lucide-react';
import { useWallet } from '@/lib/wagmi';
import { useTheme } from '@/lib/ThemeContext';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div<{ $bgColor: string }>`
  background: ${props => props.$bgColor};
  border-radius: 20px 20px 0 0;
  padding: 20px;
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2<{ $color: string }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$color};
  margin: 0;
`;

const CloseButton = styled.button<{ $color: string }>`
  background: none;
  border: none;
  color: ${props => props.$color};
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const WalletList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const WalletOption = styled.button<{ $bgColor: string; $borderColor: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${props => props.$bgColor};
  border: 1px solid ${props => props.$borderColor};
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  transition: all 0.15s ease;
  
  &:active {
    transform: scale(0.98);
    background: ${props => props.$borderColor};
  }
`;

const WalletIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #10B981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  img {
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }
`;

const WalletInfo = styled.div`
  flex: 1;
  text-align: left;
`;

const WalletName = styled.div<{ $color: string }>`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.$color};
`;

const WalletDesc = styled.div<{ $color: string }>`
  font-size: 12px;
  color: ${props => props.$color};
  margin-top: 2px;
`;

const getWalletDescription = (id: string): string => {
  switch (id) {
    case 'injected':
      return 'Browser wallet (MetaMask, etc.)';
    case 'walletConnect':
      return 'Scan QR code to connect';
    case 'metaMask':
      return 'Popular browser wallet';
    default:
      return 'Connect your wallet';
  }
};

const getWalletDisplayName = (name: string, id: string): string => {
  if (id === 'injected') return 'Browser Wallet';
  return name;
};

export function ConnectWalletModal() {
  const { isModalOpen, closeModal, connectWithConnector, availableConnectors } = useWallet();
  const { theme } = useTheme();

  if (!isModalOpen) return null;

  return (
    <Overlay onClick={closeModal} data-testid="connect-modal-overlay">
      <Modal $bgColor={theme.bgSecondary} onClick={e => e.stopPropagation()}>
        <Header>
          <Title $color={theme.textPrimary}>Connect Wallet</Title>
          <CloseButton onClick={closeModal} $color={theme.textMuted} data-testid="close-modal-btn">
            <X size={20} />
          </CloseButton>
        </Header>
        
        <WalletList>
          {availableConnectors.map(connector => (
            <WalletOption
              key={connector.id}
              onClick={() => connectWithConnector(connector.id)}
              $bgColor={theme.bgPrimary}
              $borderColor={theme.border}
              data-testid={`wallet-option-${connector.id}`}
            >
              <WalletIcon>
                {connector.icon ? (
                  <img src={connector.icon} alt={connector.name} />
                ) : (
                  <Wallet size={20} />
                )}
              </WalletIcon>
              <WalletInfo>
                <WalletName $color={theme.textPrimary}>
                  {getWalletDisplayName(connector.name, connector.id)}
                </WalletName>
                <WalletDesc $color={theme.textMuted}>
                  {getWalletDescription(connector.id)}
                </WalletDesc>
              </WalletInfo>
            </WalletOption>
          ))}
        </WalletList>
      </Modal>
    </Overlay>
  );
}

export default ConnectWalletModal;
