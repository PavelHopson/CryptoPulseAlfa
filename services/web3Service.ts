
import { WalletState } from '../types';

const STORAGE_KEY_WALLET = 'cryptopulse_wallet_v1';

const INITIAL_STATE: WalletState = {
  isConnected: false,
  address: null,
  balanceEth: 0,
  provider: null
};

export const getWalletState = (): WalletState => {
  const stored = localStorage.getItem(STORAGE_KEY_WALLET);
  return stored ? JSON.parse(stored) : INITIAL_STATE;
};

export const connectWallet = async (provider: string): Promise<WalletState> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 1500));

  // Generate mock address
  const chars = '0123456789ABCDEF';
  let address = '0x71';
  for (let i = 0; i < 38; i++) {
      address += chars[Math.floor(Math.random() * 16)];
  }

  // Generate mock balance (0.5 to 10 ETH)
  const balance = 0.5 + Math.random() * 9.5;

  const newState: WalletState = {
    isConnected: true,
    address,
    balanceEth: balance,
    provider
  };

  localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(newState));
  window.dispatchEvent(new Event('walletUpdated'));
  return newState;
};

export const disconnectWallet = () => {
  localStorage.removeItem(STORAGE_KEY_WALLET);
  window.dispatchEvent(new Event('walletUpdated'));
};
