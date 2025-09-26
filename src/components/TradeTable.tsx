import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trade } from "@/types/trading";
import { format } from "date-fns";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TradeTableProps {
  trades: Trade[];
}

export function TradeTable({ trades }: TradeTableProps) {
  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winningTrades = trades.filter(trade => trade.pnl > 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

  return (
    <Card className="bg-trading-surface border-trading-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Trading Performance</CardTitle>
            <CardDescription>Track your trading history and performance</CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total P&L:</span>
              <div className={`flex items-center gap-1 font-bold ${
                totalPnL >= 0 ? "text-profit" : "text-loss"
              }`}>
                {totalPnL >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                ${totalPnL.toFixed(2)}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Win Rate: {winRate.toFixed(1)}% ({winningTrades}/{trades.length})
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No trades recorded yet. Add your first trade to get started.
          </div>
        ) : (
          <div className="rounded-md border border-trading-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">Exit</TableHead>
                  <TableHead className="text-right">Lot Size</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => (
                  <TableRow 
                    key={trade.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {format(new Date(trade.date), "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {trade.symbol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={trade.tradeType === "Buy" ? "default" : "secondary"}
                        className={trade.tradeType === "Buy" ? "bg-profit hover:bg-profit/80" : ""}
                      >
                        {trade.tradeType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${trade.entryPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${trade.exitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{trade.lotSize}</TableCell>
                    <TableCell className="text-right">
                      <div className={`flex items-center justify-end gap-1 font-bold ${
                        trade.pnl >= 0 ? "text-profit" : "text-loss"
                      }`}>
                        {trade.pnl >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        ${trade.pnl.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      ${trade.runningBalance.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-32 truncate">
                      {trade.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}