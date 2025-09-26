import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MarketPrice as MarketPriceType } from "@/types/trading";

export function MarketPrice() {
  const [price, setPrice] = useState<MarketPriceType | null>(null);
  const [priceHistory, setPriceHistory] = useState<Array<{time: string, price: number}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time gold price updates
    const fetchPrice = () => {
      // Mock data - in real app, use actual API
      const mockPrice = {
        symbol: "XAUUSD",
        price: 2020.45 + (Math.random() - 0.5) * 10,
        change: (Math.random() - 0.5) * 20,
        changePercent: (Math.random() - 0.5) * 2,
        timestamp: new Date().toISOString(),
      };
      
      setPrice(mockPrice);
      
      // Add to price history (keep last 20 points)
      setPriceHistory(prev => {
        const newHistory = [...prev, {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: mockPrice.price
        }];
        return newHistory.slice(-20); // Keep only last 20 data points
      });
      
      setLoading(false);
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
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

  if (!price) return null;

  const isPositive = price.change >= 0;

  return (
    <Card className="bg-trading-surface border-trading-border shadow-card">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {price.symbol} Live Price
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            ${price.price.toFixed(2)}
          </span>
          <div className={`flex items-center gap-1 text-sm ${
            isPositive ? "text-profit" : "text-loss"
          }`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{isPositive ? "+" : ""}{price.change.toFixed(2)}</span>
            <span>({isPositive ? "+" : ""}{price.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      </CardHeader>
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
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--trading-surface))',
                  border: '1px solid hsl(var(--trading-border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
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
    </Card>
  );
}