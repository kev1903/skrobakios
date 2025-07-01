
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CheckCircle, Clock, AlertCircle, BarChart3 } from "lucide-react";

const metrics = [
  {
    title: "Completed",
    value: "20",
    change: "+6.2%",
    trend: "up",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    icon: CheckCircle,
    iconColor: "text-emerald-500"
  },
  {
    title: "Running",
    value: "1000",
    change: "-2.2%",
    trend: "down",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: Clock,
    iconColor: "text-blue-500"
  },
  {
    title: "Pending",
    value: "60",
    change: "+2.2%",
    trend: "up",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: AlertCircle,
    iconColor: "text-amber-500"
  },
  {
    title: "Total",
    value: "1250",
    change: "+8.2%",
    trend: "up",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: BarChart3,
    iconColor: "text-purple-500"
  }
];

export const MetricsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`w-4 h-4 ${metric.iconColor}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{metric.title}</span>
                  </div>
                  <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                    {metric.value}
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${
                    metric.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {metric.trend === 'up' ? 
                      <TrendingUp className="w-3 h-3" /> : 
                      <TrendingDown className="w-3 h-3" />
                    }
                    <span className="font-medium">{metric.change}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
