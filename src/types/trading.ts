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
  customPnL?: boolean; // Flag to indicate if P&L was manually entered
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