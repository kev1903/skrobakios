
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const metrics = [
  {
    title: "Completed",
    value: "20",
    change: "+6.2%",
    trend: "up",
    color: "text-orange-600"
  },
  {
    title: "Running",
    value: "1000",
    change: "-2.2%",
    trend: "down",
    color: "text-red-600"
  },
  {
    title: "Pending",
    value: "60",
    change: "+2.2%",
    trend: "up",
    color: "text-blue-600"
  },
  {
    title: "Total",
    value: "1250",
    change: "+8.2%",
    trend: "up",
    color: "text-purple-600"
  }
];

export const MetricsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{metric.title}</span>
              <div className={`flex items-center space-x-1 text-xs ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? 
                  <TrendingUp className="w-3 h-3" /> : 
                  <TrendingDown className="w-3 h-3" />
                }
                <span>{metric.change}</span>
              </div>
            </div>
            <div className={`text-3xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
