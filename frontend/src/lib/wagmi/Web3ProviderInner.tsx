'use client';

import React, { useMemo } from 'react';
import { WagmiProvider, createConfig, http, createStorage } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { WalletProvider } from './WalletContext';
import { 
  trustWallet, 
  okxWallet,
  metaMaskWallet,
  coinbaseWallet
} from '@rainbow-me/rainbowkit/wallets';
import { bscTestnet } from 'wagmi/chains';

import '@rainbow-me/rainbowkit/styles.css';

// WalletConnect Project ID
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '68f6a896cceb3826ac6defe3e14e83ec';

// Create QueryClient instance - singleton
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface Web3ProviderInnerProps {
  children: React.ReactNode;
}

export function Web3ProviderInner({ children }: Web3ProviderInnerProps) {
  // Create config on client side only using useMemo
  const wagmiConfig = useMemo(() => {
    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended',
          wallets: [
            metaMaskWallet,
            trustWallet,
            okxWallet,
          ],
        },
        {
          groupName: 'Other',
          wallets: [
            coinbaseWallet,
          ],
        },
      ],
      {
        appName: 'FOMO Arena',
        projectId: WALLETCONNECT_PROJECT_ID,
      }
    );

    // Check if we're on client side
    const isClient = typeof window !== 'undefined';

    return createConfig({
      connectors,
      chains: [bscTestnet],
      transports: {
        [bscTestnet.id]: http('https://bsc-testnet.publicnode.com'),
      },
      ssr: true, // Enable SSR mode
      storage: isClient ? createStorage({ storage: window.localStorage }) : undefined,
    });
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#10B981',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            overlayBlur: 'small',
          })}
          modalSize="compact"
          locale="en"
        >
          <WalletProvider>
            {children}
          </WalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
