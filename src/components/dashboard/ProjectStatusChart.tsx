
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Upcoming Projects", value: 12, color: "#60A5FA", shortName: "Upcoming" },
  { name: "Pending Projects", value: 24, color: "#34D399", shortName: "Pending" },
  { name: "Running Projects", value: 51, color: "#F59E0B", shortName: "Running" },
  { name: "Completed Projects", value: 140, color: "#8B5CF6", shortName: "Completed" }
];

const COLORS = data.map(item => item.color);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg border-0">
        <p className="text-sm font-medium">{data.name}</p>
        <p className="text-lg font-bold">{data.value}</p>
      </div>
    );
  }
  return null;
};

export const ProjectStatusChart = () => {
  const totalProjects = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-800">
          Project Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-6">
          <div className="relative flex-shrink-0">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{totalProjects}</div>
                <div className="text-sm text-slate-500 font-medium">Total Projects</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-slate-600 font-medium">{item.shortName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-800">{item.value}</span>
                  <span className="text-xs text-slate-500">
                    ({Math.round((item.value / totalProjects) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
