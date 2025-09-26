import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BalanceSettingsProps {
  currentBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
  isInitialSetup?: boolean;
}

export function BalanceSettings({ currentBalance, onBalanceUpdate, isInitialSetup = false }: BalanceSettingsProps) {
  const [balance, setBalance] = useState(currentBalance.toString());
  const { toast } = useToast();

  const handleUpdateBalance = () => {
    const newBalance = parseFloat(balance);
    if (isNaN(newBalance) || newBalance < 0) {
      toast({
        title: "Invalid Balance",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    onBalanceUpdate(newBalance);
    toast({
      title: "Balance Updated",
      description: `Balance set to $${newBalance.toFixed(2)}`,
    });
  };

  return (
    <Card className="bg-trading-surface border-trading-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {isInitialSetup ? "Set Initial Balance" : "Update Balance"}
        </CardTitle>
        <CardDescription>
          {isInitialSetup 
            ? "Set your starting trading balance before adding trades"
            : "Adjust your current account balance"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="balance">Balance ($)</Label>
          <Input
            id="balance"
            type="number"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="Enter balance amount"
          />
        </div>
        <Button onClick={handleUpdateBalance} className="w-full">
          {isInitialSetup ? "Set Initial Balance" : "Update Balance"}
        </Button>
      </CardContent>
    </Card>
  );
}