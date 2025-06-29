
import { FileCheck, MessageSquare, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/hooks/useProjects";

interface LatestUpdatesProps {
  project: Project;
  progress: number;
  wbsCount: number;
}

export const LatestUpdates = ({ project, progress, wbsCount }: LatestUpdatesProps) => {
  const latestUpdates = [
    { icon: FileCheck, label: "Incomplete Task", count: Math.max(20 - progress / 5, 0) },
    { icon: MessageSquare, label: "Unread Messages", count: project.status === "pending" ? 12 : 5 },
    { icon: FileText, label: "Unread Documents", count: wbsCount - Math.floor(progress / 10) }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Latest Update</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {latestUpdates.map((update, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <update.icon className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{update.label}</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{update.count.toString().padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
