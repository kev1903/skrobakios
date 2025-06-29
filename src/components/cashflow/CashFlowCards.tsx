
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

export const CashFlowCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-700">Balance</CardTitle>
          <CardDescription className="text-sm text-gray-500">From 6 Bank Accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-2">A$22,543</div>
          <div className="flex items-center text-sm text-green-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+A$4,351</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-700">Forecast</CardTitle>
          <CardDescription className="text-sm text-gray-500">Falls below A$0 in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-2">+3 Years</div>
          <Progress value={75} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
};
