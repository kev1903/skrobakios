
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Upcoming Projects", value: 12, color: "#60A5FA" },
  { name: "Pending Projects", value: 24, color: "#34D399" },
  { name: "Running Projects", value: 51, color: "#F59E0B" },
  { name: "Completed Projects", value: 140, color: "#8B5CF6" }
];

const COLORS = data.map(item => item.color);

export const ProjectStatusChart = () => {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Project Status this month
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">1250</div>
                <div className="text-sm text-gray-600">Total Project</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between min-w-[120px]">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name.split(' ')[0]}</span>
                </div>
                <span className="text-lg font-semibold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
