import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Trade } from "@/types/trading";

interface ProfitChartProps {
  trades: Trade[];
}

export function ProfitChart({ trades }: ProfitChartProps) {
  const chartData = trades.map((trade, index) => ({
    trade: index + 1,
    balance: trade.runningBalance,
    pnl: trade.pnl,
    date: new Date(trade.date).toLocaleDateString(),
  }));

  return (
    <Card className="bg-trading-surface border-trading-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Account Performance
        </CardTitle>
        <CardDescription>
          Running balance over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="trade" 
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--trading-surface))',
                  border: '1px solid hsl(var(--trading-border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value: any, name: string) => [
                  name === 'balance' ? `$${value.toFixed(2)}` : `$${value.toFixed(2)}`,
                  name === 'balance' ? 'Balance' : 'P&L'
                ]}
                labelFormatter={(label) => `Trade #${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}