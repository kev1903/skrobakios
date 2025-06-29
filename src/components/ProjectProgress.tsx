
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProjectProgressProps {
  progress: number;
  wbsCount: number;
}

export const ProjectProgress = ({ progress, wbsCount }: ProjectProgressProps) => {
  if (progress <= 0 || progress >= 100) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Project Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
          <p className="text-xs text-gray-500">{wbsCount} WBS components tracked</p>
        </div>
      </CardContent>
    </Card>
  );
};
