import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Calculator } from "lucide-react";
import { Trade } from "@/types/trading";
import { useToast } from "@/hooks/use-toast";

interface AddTradeFormProps {
  onAddTrade: (trade: Omit<Trade, 'id' | 'date' | 'pnl' | 'runningBalance'>) => void;
  lastBalance: number;
}

export function AddTradeForm({ onAddTrade, lastBalance }: AddTradeFormProps) {
  const [symbol, setSymbol] = useState("");
  const [tradeType, setTradeType] = useState<"Buy" | "Sell">("Buy");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculatePnL = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const lots = parseFloat(lotSize);
    
    if (!entry || !exit || !lots) return 0;
    
    // Simple P&L calculation (exit - entry) * lot size
    // For Buy: positive when exit > entry
    // For Sell: positive when entry > exit
    if (tradeType === "Buy") {
      return (exit - entry) * lots;
    } else {
      return (entry - exit) * lots;
    }
  };

  const previewPnL = calculatePnL();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pnl = calculatePnL();
      
      const trade = {
        symbol: symbol.toUpperCase(),
        tradeType,
        entryPrice: parseFloat(entryPrice),
        exitPrice: parseFloat(exitPrice),
        lotSize: parseFloat(lotSize),
        notes,
      };

      onAddTrade(trade);
      
      // Reset form
      setSymbol("");
      setEntryPrice("");
      setExitPrice("");
      setLotSize("");
      setNotes("");
      
      toast({
        title: "Trade Added",
        description: `Successfully added ${tradeType} trade for ${symbol.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add trade. Please check your input.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-trading-surface border-trading-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-primary" />
          <CardTitle>Add New Trade</CardTitle>
        </div>
        <CardDescription>
          Enter your trade details. P&L and running balance will be calculated automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol/Pair</Label>
              <Input
                id="symbol"
                placeholder="e.g., XAUUSD, EURUSD"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="uppercase"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tradeType">Trade Type</Label>
              <Select value={tradeType} onValueChange={(value: "Buy" | "Sell") => setTradeType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitPrice">Exit Price</Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lotSize">Lot Size</Label>
              <Input
                id="lotSize"
                type="number"
                step="0.01"
                placeholder="1.00"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculated P&L
              </Label>
              <div className={`p-3 rounded-md border text-lg font-bold ${
                previewPnL >= 0 
                  ? "bg-profit-muted text-profit border-profit/20" 
                  : "bg-loss-muted text-loss border-loss/20"
              }`}>
                ${previewPnL.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this trade..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || !symbol || !entryPrice || !exitPrice || !lotSize}
          >
            {loading ? "Adding Trade..." : "Add Trade"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}