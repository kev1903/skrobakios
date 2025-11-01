
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";

export const ReceivablesSection = () => {
  const receivablesAging = [
    { range: "0-30 days", amount: 85000, count: 12, color: "#22c55e" },
    { range: "31-60 days", amount: 45000, count: 8, color: "#f59e0b" },
    { range: "61-90 days", amount: 25000, count: 4, color: "#ef4444" },
    { range: "90+ days", amount: 15000, count: 3, color: "#dc2626" },
  ];

  return (
    <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <CardHeader className="p-6">
        <CardTitle className="flex items-center space-x-2 text-lg font-bold">
          <FileText className="w-5 h-5 text-luxury-gold" />
          <span>Accounts Receivable Aging</span>
        </CardTitle>
        <CardDescription className="text-sm">Outstanding invoices by age</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {receivablesAging.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-accent/20">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-foreground">{item.range}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">${item.amount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{item.count} invoices</div>
              </div>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between items-center">
          <span className="font-medium text-foreground">Total Outstanding</span>
          <span className="text-xl font-bold text-foreground">$170,000</span>
        </div>
        <div className="text-sm text-muted-foreground mt-1">Average DSO: 42 days</div>
      </CardContent>
    </Card>
  );
};
