import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, TrendingUp, TrendingDown, DollarSign, Target, LogIn, ChartBar as BarChart3, Plus, Settings } from "lucide-react";
import { TradeTable } from "./TradeTable";
import { AddTradeForm } from "./AddTradeForm";
import { MarketPrice } from "./MarketPrice";
import { ThemeToggle } from "./ThemeToggle";
import { BalanceSettings } from "./BalanceSettings";
import { ProfitChart } from "./ProfitChart";
import { Trade, User } from "@/types/trading";
import { useToast } from "@/hooks/use-toast";

interface TradingDashboardProps {
  user: User;
  onLogout: () => void;
  isPublicMode: boolean;
  onLoginRequest?: () => void;
}

export function TradingDashboard({ user, onLogout, isPublicMode, onLoginRequest }: TradingDashboardProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(10000);
  const [needsInitialBalance, setNeedsInitialBalance] = useState<boolean>(false);
  const { toast } = useToast();

  // Load trades and balance from localStorage on mount
  useEffect(() => {
    const savedTrades = localStorage.getItem("tradingTrades");
    const savedBalance = localStorage.getItem("tradingBalance");
    const hasSetInitialBalance = localStorage.getItem("hasSetInitialBalance");
    
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    }
    
    if (savedBalance) {
      setCurrentBalance(parseFloat(savedBalance));
    }
    
    // Check if user needs to set initial balance (first time login)
    if (user.isAuthenticated && !hasSetInitialBalance) {
      setNeedsInitialBalance(true);
    }
  }, [user.isAuthenticated]);

  // Save trades to localStorage whenever trades change
  useEffect(() => {
    localStorage.setItem("tradingTrades", JSON.stringify(trades));
  }, [trades]);

  // Save balance to localStorage whenever balance changes
  useEffect(() => {
    localStorage.setItem("tradingBalance", currentBalance.toString());
  }, [currentBalance]);

  const addTrade = (newTradeData: Omit<Trade, 'id' | 'date' | 'pnl' | 'runningBalance'>) => {
    // Calculate P&L based on trade type and prices
    // If prices are 0, it means custom P&L was used (will be overridden)
    let pnl = 0;
    if (newTradeData.entryPrice > 0 && newTradeData.exitPrice > 0 && newTradeData.lotSize > 0) {
      pnl = newTradeData.tradeType === "Buy" 
        ? (newTradeData.exitPrice - newTradeData.entryPrice) * newTradeData.lotSize
        : (newTradeData.entryPrice - newTradeData.exitPrice) * newTradeData.lotSize;
    }
    
    const lastBalance = trades.length > 0 ? trades[trades.length - 1].runningBalance : currentBalance;
    const runningBalance = lastBalance + pnl;

    const newTrade: Trade = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      pnl,
      runningBalance,
      ...newTradeData,
    };

    setTrades(prev => [...prev, newTrade]);
  };

  const handleBalanceUpdate = (newBalance: number) => {
    setCurrentBalance(newBalance);
    localStorage.setItem("hasSetInitialBalance", "true");
    setNeedsInitialBalance(false);
    
    // If there are trades, update the running balance calculation
    if (trades.length > 0) {
      const updatedTrades = [...trades];
      let runningBalance = newBalance;
      
      updatedTrades.forEach((trade, index) => {
        if (index === 0) {
          runningBalance = newBalance + trade.pnl;
        } else {
          runningBalance = updatedTrades[index - 1].runningBalance + trade.pnl;
        }
        updatedTrades[index].runningBalance = runningBalance;
      });
      
      setTrades(updatedTrades);
    }
  };

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winningTrades = trades.filter(trade => trade.pnl > 0).length;
  const losingTrades = trades.filter(trade => trade.pnl < 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  const accountBalance = trades.length > 0 ? trades[trades.length - 1].runningBalance : currentBalance;

  return (
    <div className="min-h-screen bg-trading-bg">
      {/* Header */}
      <header className="border-b border-trading-border bg-trading-surface">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Trading Dashboard</h1>
            {isPublicMode && (
              <span className="px-2 py-1 bg-muted rounded-md text-sm text-muted-foreground">
                Public View
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user.isAuthenticated ? (
              <Button variant="outline" onClick={onLogout} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button onClick={onLoginRequest} size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Market Price Widget */}
        <MarketPrice />

        {/* Initial Balance Setup - Show if user needs to set balance */}
        {needsInitialBalance && user.isAuthenticated && !isPublicMode && (
          <BalanceSettings
            currentBalance={currentBalance}
            onBalanceUpdate={handleBalanceUpdate}
            isInitialSetup={true}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-trading-surface border-trading-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${accountBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {trades.length} total trades
              </p>
            </CardContent>
          </Card>

          <Card className="bg-trading-surface border-trading-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              {totalPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-profit" />
              ) : (
                <TrendingDown className="h-4 w-4 text-loss" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-profit" : "text-loss"}`}>
                ${totalPnL.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                All time performance
              </p>
            </CardContent>
          </Card>

          <Card className="bg-trading-surface border-trading-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {winningTrades}W / {losingTrades}L
              </p>
            </CardContent>
          </Card>

          <Card className="bg-trading-surface border-trading-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trades Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trades.filter(trade => 
                  new Date(trade.date).toDateString() === new Date().toDateString()
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active trading day
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        {trades.length > 0 && (
          <ProfitChart trades={trades} />
        )}

        {/* Navigation Tabs - Only show if authenticated and balance is set */}
        {user.isAuthenticated && !isPublicMode && !needsInitialBalance && (
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="add-trade" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Trade
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-4">
              <TradeTable trades={trades} />
            </TabsContent>
            
            <TabsContent value="add-trade" className="space-y-4">
              <AddTradeForm 
                onAddTrade={addTrade}
                lastBalance={accountBalance}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <BalanceSettings
                currentBalance={currentBalance}
                onBalanceUpdate={handleBalanceUpdate}
                isInitialSetup={false}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Public View - Show only dashboard */}
        {(isPublicMode || !user.isAuthenticated) && (
          <TradeTable trades={trades} />
        )}
      </div>
    </div>
  );
}