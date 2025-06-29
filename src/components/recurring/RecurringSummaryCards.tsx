
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const RecurringSummaryCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Recurring Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">+3 from last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,230</div>
          <p className="text-xs text-muted-foreground">+8.2% from last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$12,450</div>
          <p className="text-xs text-muted-foreground">+2.1% from last month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Recurring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">$32,780</div>
          <p className="text-xs text-muted-foreground">+12.3% from last month</p>
        </CardContent>
      </Card>
    </div>
  );
};
