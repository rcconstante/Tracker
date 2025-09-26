export interface Trade {
  id: string;
  date: string;
  symbol: string;
  tradeType: 'Buy' | 'Sell';
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  pnl: number;
  runningBalance: number;
  notes: string;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

export interface MarketPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}