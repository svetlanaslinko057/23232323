'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import dynamic from 'next/dynamic';

// Context to track if Web3 provider is ready
const Web3ReadyContext = createContext(false);
export const useWeb3Ready = () => useContext(Web3ReadyContext);

// Lazy load providers to avoid SSR issues
const Web3ProviderInner = dynamic(
  () => import('./Web3ProviderInner').then(mod => mod.Web3ProviderInner),
  { 
    ssr: false,
    loading: () => null
  }
);

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, render children without Web3 context
  if (!mounted) {
    return (
      <Web3ReadyContext.Provider value={false}>
        {children}
      </Web3ReadyContext.Provider>
    );
  }

  return (
    <Web3ProviderInner>
      <Web3ReadyContext.Provider value={true}>
        {children}
      </Web3ReadyContext.Provider>
    </Web3ProviderInner>
  );
}
