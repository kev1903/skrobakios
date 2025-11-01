
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const ComplianceSection = () => {
  return (
    <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <CardHeader className="p-6">
        <CardTitle className="flex items-center space-x-2 text-lg font-playfair">
          <Users className="w-5 h-5 text-luxury-gold" />
          <span>Compliance & Obligations</span>
        </CardTitle>
        <CardDescription className="text-sm">Tax, payroll, and regulatory requirements</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-3">
          <div className="flex justify-between items-center p-4 border-l-4 border-l-amber-500 bg-amber-50/50 rounded-r-xl">
            <div>
              <div className="font-semibold text-foreground">GST/BAS Due</div>
              <div className="text-sm text-muted-foreground">Due: Jan 28, 2024</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-amber-600">$45,200</div>
              <div className="text-xs text-amber-600 font-medium">7 days</div>
            </div>
          </div>
          <div className="flex justify-between items-center p-4 border-l-4 border-l-emerald-500 bg-emerald-50/50 rounded-r-xl">
            <div>
              <div className="font-semibold text-foreground">Payroll</div>
              <div className="text-sm text-muted-foreground">Monthly total</div>
            </div>
            <div className="font-bold text-emerald-600">$185,000</div>
          </div>
          <div className="flex justify-between items-center p-4 border-l-4 border-l-luxury-gold bg-luxury-gold/10 rounded-r-xl">
            <div>
              <div className="font-semibold text-foreground">Superannuation</div>
              <div className="text-sm text-muted-foreground">Quarterly liability</div>
            </div>
            <div className="font-bold text-luxury-gold">$18,500</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
