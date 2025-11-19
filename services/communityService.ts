
import { TraderProfile } from '../types';

const MOCK_TRADERS: TraderProfile[] = [
  { id: 't1', rank: 1, name: 'CryptoWhale_99', avatar: '🐋', profitPercent: 452.3, winRate: 88, followers: 12500, isHot: true, topAsset: 'BTC' },
  { id: 't2', rank: 2, name: 'ElonMusk_Fan', avatar: '🚀', profitPercent: 312.1, winRate: 76, followers: 8900, isHot: false, topAsset: 'DOGE' },
  { id: 't3', rank: 3, name: 'Satoshi_N', avatar: '🕵️‍♂️', profitPercent: 289.5, winRate: 92, followers: 15000, isHot: true, topAsset: 'ETH' },
  { id: 't4', rank: 4, name: 'GoldmanSachz', avatar: '🏦', profitPercent: 145.2, winRate: 65, followers: 3200, isHot: false, topAsset: 'XAU' },
  { id: 't5', rank: 5, name: 'ForexKing', avatar: '💱', profitPercent: 98.4, winRate: 71, followers: 1200, isHot: true, topAsset: 'EUR' },
  { id: 't6', rank: 6, name: 'BearHunter', avatar: '🐻', profitPercent: 87.1, winRate: 55, followers: 800, isHot: false, topAsset: 'WTI' },
  { id: 't7', rank: 7, name: 'LunaSurvivor', avatar: '🤕', profitPercent: 45.2, winRate: 48, followers: 4500, isHot: true, topAsset: 'LUNC' },
  { id: 't8', rank: 8, name: 'WallStBets', avatar: '💎', profitPercent: -12.5, winRate: 30, followers: 99000, isHot: true, topAsset: 'GME' },
];

export const getTopTraders = async (): Promise<TraderProfile[]> => {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 600));
  return MOCK_TRADERS;
};
