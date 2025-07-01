
import { Card, CardContent } from "@/components/ui/card";

interface BIMStatsCardsProps {
  stats: {
    totalModels: number;
    currentModels: number;
    totalSize: string;
    lastUpdated: string;
  };
}

export const BIMStatsCards = ({ stats }: BIMStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="backdrop-blur-sm bg-white/60 border-white/20">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-slate-900">{stats.totalModels}</div>
          <p className="text-sm text-slate-600">Total Models</p>
        </CardContent>
      </Card>
      
      <Card className="backdrop-blur-sm bg-white/60 border-white/20">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.currentModels}</div>
          <p className="text-sm text-slate-600">Current Models</p>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/60 border-white/20">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-slate-900">{stats.totalSize}</div>
          <p className="text-sm text-slate-600">Total Size</p>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/60 border-white/20">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-slate-900">{stats.lastUpdated}</div>
          <p className="text-sm text-slate-600">Last Updated</p>
        </CardContent>
      </Card>
    </div>
  );
};
