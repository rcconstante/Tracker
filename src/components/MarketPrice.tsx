import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MarketPrice as MarketPriceType } from "@/types/trading";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALPHA_VANTAGE_API_KEY = "Q7PKAZ1H1SGGR2FZ";

const SYMBOLS = [
  { value: "XAUUSD", label: "Gold (XAU/USD)", apiSymbol: "GLD" },
  { value: "EURUSD", label: "EUR/USD", apiSymbol: "EURUSD=X" },
  { value: "GBPUSD", label: "GBP/USD", apiSymbol: "GBPUSD=X" },
  { value: "USDJPY", label: "USD/JPY", apiSymbol: "USDJPY=X" },
  { value: "BTCUSD", label: "Bitcoin", apiSymbol: "BTC-USD" },
];

export function MarketPrice() {
  const [selectedSymbol, setSelectedSymbol] = useState("XAUUSD");
  const [price, setPrice] = useState<MarketPriceType | null>(null);
  const [priceHistory, setPriceHistory] = useState<Array<{time: string, price: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchPrice = async (symbol: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const selectedSymbolData = SYMBOLS.find(s => s.value === symbol);
      if (!selectedSymbolData) return;

      // For forex pairs, use FX_DAILY, for stocks use GLOBAL_QUOTE
      const isForex = symbol.includes("USD") && symbol !== "BTCUSD";
      const isCrypto = symbol === "BTCUSD";
      
      let url = "";
      
      if (isForex && symbol !== "XAUUSD") {
        // Forex pairs
        const fromSymbol = symbol.substring(0, 3);
        const toSymbol = symbol.substring(3, 6);
        url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&interval=5min&apikey=${ALPHA_VANTAGE_API_KEY}`;
      } else if (isCrypto) {
        // Cryptocurrency
        url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_INTRADAY&symbol=BTC&market=USD&interval=5min&apikey=${ALPHA_VANTAGE_API_KEY}`;
      } else {
        // Stocks/ETFs (including Gold ETF)
        url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${selectedSymbolData.apiSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data["Error Message"] || data["Note"]) {
        throw new Error(data["Error Message"] || "API limit reached. Please try again later.");
      }

      let currentPrice = 0;
      let previousPrice = 0;
      let timeSeriesData: any = {};

      if (isForex && symbol !== "XAUUSD") {
        timeSeriesData = data["Time Series FX (5min)"];
        if (timeSeriesData) {
          const latestTime = Object.keys(timeSeriesData)[0];
          const previousTime = Object.keys(timeSeriesData)[1];
          currentPrice = parseFloat(timeSeriesData[latestTime]["4. close"]);
          previousPrice = previousTime ? parseFloat(timeSeriesData[previousTime]["4. close"]) : currentPrice;
        }
      } else if (isCrypto) {
        timeSeriesData = data["Time Series (Digital Currency Intraday)"];
        if (timeSeriesData) {
          const latestTime = Object.keys(timeSeriesData)[0];
          const previousTime = Object.keys(timeSeriesData)[1];
          currentPrice = parseFloat(timeSeriesData[latestTime]["4. close (USD)"]);
          previousPrice = previousTime ? parseFloat(timeSeriesData[previousTime]["4. close (USD)"]) : currentPrice;
        }
      } else {
        const quote = data["Global Quote"];
        if (quote) {
          currentPrice = parseFloat(quote["05. price"]);
          previousPrice = parseFloat(quote["08. previous close"]);
        }
      }

      if (currentPrice === 0) {
        throw new Error("Unable to fetch price data");
      }

      const change = currentPrice - previousPrice;
      const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;

      const newPrice: MarketPriceType = {
        symbol: selectedSymbol,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        timestamp: new Date().toISOString(),
      };

      setPrice(newPrice);
      setLastUpdate(new Date());

      // Update price history
      setPriceHistory(prev => {
        const newHistory = [...prev, {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: currentPrice
        }];
        return newHistory.slice(-20); // Keep only last 20 data points
      });

    } catch (error) {
      console.error("Error fetching price:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch price data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice(selectedSymbol);
    
    // Set up interval for updates every 30 seconds
    const interval = setInterval(() => {
      fetchPrice(selectedSymbol);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const handleRefresh = () => {
    fetchPrice(selectedSymbol);
  };

  const handleSymbolChange = (newSymbol: string) => {
    setSelectedSymbol(newSymbol);
    setPriceHistory([]); // Clear history when changing symbols
  };

  if (loading && !price) {
    return (
      <Card className="bg-trading-surface border-trading-border">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2"></div>
            <div className="h-6 bg-muted rounded w-32"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const isPositive = price ? price.change >= 0 : false;
  const selectedSymbolData = SYMBOLS.find(s => s.value === selectedSymbol);

  return (
    <Card className="bg-trading-surface border-trading-border shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedSymbol} onValueChange={handleSymbolChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SYMBOLS.map((symbol) => (
                  <SelectItem key={symbol.value} value={symbol.value}>
                    {symbol.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {lastUpdate && (
            <div className="text-xs text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        {error ? (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        ) : price ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              ${price.price.toFixed(price.symbol === "USDJPY" ? 3 : 2)}
            </span>
            <div className={`flex items-center gap-1 text-sm ${
              isPositive ? "text-profit" : "text-loss"
            }`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{isPositive ? "+" : ""}{price.change.toFixed(4)}</span>
              <span>({isPositive ? "+" : ""}{price.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        ) : null}
      </CardHeader>
      
      {priceHistory.length > 0 && (
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="time" 
                  className="text-muted-foreground"
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  className="text-muted-foreground"
                  tick={{ fontSize: 10 }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tickFormatter={(value) => `$${value.toFixed(selectedSymbol === "USDJPY" ? 3 : 2)}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--trading-surface))',
                    border: '1px solid hsl(var(--trading-border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--foreground))'
                  }}
                  formatter={(value: any) => [`$${value.toFixed(selectedSymbol === "USDJPY" ? 3 : 2)}`, 'Price']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isPositive ? "hsl(var(--profit))" : "hsl(var(--loss))"} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      )}
    </Card>
  );
}