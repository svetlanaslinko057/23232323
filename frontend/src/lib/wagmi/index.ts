export { Web3Provider, useWeb3Ready } from './Web3Provider';
export { WalletProvider, useWallet } from './WalletContext';

// Export constants only
export const TARGET_CHAIN_ID = 97; // BSC Testnet
export const ARENA_CORE_ADDRESS = process.env.NEXT_PUBLIC_ARENA_CORE_ADDRESS || '0x7Fcaa9aF01ee4Ab2fa6C2fb670ff58c673AefC8e';
export const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS || '0x4EeF2A62E8A63b713C96CBADAc4C6622D1EAB948';
