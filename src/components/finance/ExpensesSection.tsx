
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export const ExpensesSection = () => {
  const expenseCategories = [
    { category: "Materials", current: 145000, budget: 150000, variance: -3.3 },
    { category: "Labor", current: 98000, budget: 95000, variance: 3.2 },
    { category: "Equipment", current: 25000, budget: 30000, variance: -16.7 },
    { category: "Overhead", current: 42000, budget: 40000, variance: 5.0 },
    { category: "Transport", current: 18000, budget: 20000, variance: -10.0 },
  ];

  return (
    <Card className="border border-border/30 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <CardHeader className="p-6">
        <CardTitle className="flex items-center space-x-2 text-lg font-bold">
          <CreditCard className="w-5 h-5 text-luxury-gold" />
          <span>Expenses vs Budget</span>
        </CardTitle>
        <CardDescription className="text-sm">Monthly expense tracking by category</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {expenseCategories.map((expense, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{expense.category}</span>
                <div className="text-right">
                  <div className="font-semibold text-foreground">${expense.current.toLocaleString()}</div>
                  <div className={`text-xs font-medium ${expense.variance < 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {expense.variance > 0 ? '+' : ''}{expense.variance}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${expense.variance < 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min((expense.current / expense.budget) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
