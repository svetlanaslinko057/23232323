'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useAccount, useDisconnect, useSwitchChain, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

const TARGET_CHAIN_ID = 97; // BSC Testnet

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface AuthUser {
  id: string;
  wallet: string;
  username: string;
  xp: number;
  tier: string;
  badges: string[];
}

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  chainId: number | undefined;
  isCorrectNetwork: boolean;
  shortAddress: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  token: string | null;
  user: AuthUser | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  switchToCorrectNetwork: () => Promise<void>;
  signIn: () => Promise<void>;
  logout: () => void;
  handleAuthError: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, chain, isConnecting: wagmiConnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const chainId = chain?.id;
  const isCorrectNetwork = chainId === TARGET_CHAIN_ID;
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;
  const isAuthenticated = !!(token && user);

  // Mount effect - restore auth
  useEffect(() => {
    setHasMounted(true);
    const storedToken = localStorage.getItem('arenaToken');
    const storedUser = localStorage.getItem('arenaUser');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('arenaToken');
        localStorage.removeItem('arenaUser');
      }
    }
  }, []);

  // Save wallet when connected
  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem('arenaWallet', address);
    }
  }, [isConnected, address]);

  // Wallet mismatch check
  useEffect(() => {
    if (address && user && user.wallet.toLowerCase() !== address.toLowerCase()) {
      setToken(null);
      setUser(null);
      localStorage.removeItem('arenaToken');
      localStorage.removeItem('arenaUser');
    }
  }, [address, user]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('arenaToken');
    localStorage.removeItem('arenaUser');
  }, []);

  const handleAuthError = useCallback(() => logout(), [logout]);

  // Use RainbowKit modal for wallet connection
  const connectWallet = useCallback(() => {
    if (openConnectModal) {
      openConnectModal();
    }
  }, [openConnectModal]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    logout();
    localStorage.removeItem('arenaWallet');
  }, [disconnect, logout]);

  const switchToCorrectNetwork = useCallback(async () => {
    try {
      await switchChain({ chainId: TARGET_CHAIN_ID });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  }, [switchChain]);

  const signIn = useCallback(async () => {
    if (!address) throw new Error('Wallet not connected');
    setIsAuthenticating(true);
    try {
      const nonceRes = await fetch(`${API_BASE}/api/auth/nonce?wallet=${address}`);
      const nonceData = await nonceRes.json();
      if (!nonceData.success || !nonceData.data?.message) throw new Error('Failed to get nonce');

      const signature = await signMessageAsync({ message: nonceData.data.message, account: address });

      const verifyRes = await fetch(`${API_BASE}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, signature }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success || !verifyData.data?.token) throw new Error('Verification failed');

      const newToken = verifyData.data.token;
      const newUser: AuthUser = {
        id: verifyData.data.user?.id || address,
        wallet: address,
        username: verifyData.data.user?.username || shortAddress || 'Anon',
        xp: verifyData.data.user?.xp || 0,
        tier: verifyData.data.user?.tier || 'Bronze',
        badges: verifyData.data.user?.badges || [],
      };

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('arenaToken', newToken);
      localStorage.setItem('arenaUser', JSON.stringify(newUser));
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessageAsync, shortAddress]);

  const value = useMemo(() => ({
    isConnected: hasMounted ? isConnected : false,
    isConnecting: wagmiConnecting,
    walletAddress: address || null,
    chainId,
    isCorrectNetwork,
    shortAddress,
    isAuthenticated,
    isAuthenticating,
    token,
    user,
    connectWallet,
    disconnectWallet,
    switchToCorrectNetwork,
    signIn,
    logout,
    handleAuthError,
  }), [
    hasMounted, isConnected, wagmiConnecting, address, chainId, isCorrectNetwork, 
    shortAddress, isAuthenticated, isAuthenticating, token, user,
    connectWallet, disconnectWallet, switchToCorrectNetwork, signIn, logout, handleAuthError
  ]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  // Return safe defaults if not within provider (SSR or during hydration)
  if (!context) {
    return {
      isConnected: false,
      isConnecting: false,
      walletAddress: null,
      chainId: undefined,
      isCorrectNetwork: false,
      shortAddress: null,
      isAuthenticated: false,
      isAuthenticating: false,
      token: null,
      user: null,
      connectWallet: () => {},
      disconnectWallet: () => {},
      switchToCorrectNetwork: async () => {},
      signIn: async () => {},
      logout: () => {},
      handleAuthError: () => {},
    };
  }
  return context;
}
