
import { ArrowLeft, Download, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProjectDetailProps {
  projectId: string | null;
  onNavigate: (page: string) => void;
}

export const ProjectDetail = ({ projectId, onNavigate }: ProjectDetailProps) => {
  const project = {
    id: "1",
    name: "Riverside Office Complex",
    location: "Portland, OR",
    dateCreated: "2024-06-15",
    totalCost: "$2,450,000",
    status: "completed"
  };

  const wbsComponents = [
    { id: "1", name: "Site Preparation", status: "completed", cost: "$180,000", progress: 100 },
    { id: "2", name: "Foundation & Slab", status: "completed", cost: "$320,000", progress: 100 },
    { id: "3", name: "Structural Framing", status: "completed", cost: "$580,000", progress: 100 },
    { id: "4", name: "Roofing System", status: "completed", cost: "$240,000", progress: 100 },
    { id: "5", name: "Exterior Walls", status: "completed", cost: "$380,000", progress: 100 },
    { id: "6", name: "HVAC System", status: "completed", cost: "$290,000", progress: 100 },
    { id: "7", name: "Electrical Systems", status: "completed", cost: "$195,000", progress: 100 },
    { id: "8", name: "Plumbing", status: "completed", cost: "$135,000", progress: 100 },
    { id: "9", name: "Interior Finishes", status: "completed", cost: "$120,000", progress: 100 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="outline"
            onClick={() => onNavigate("dashboard")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600">{project.location} • Created {new Date(project.dateCreated).toLocaleDateString()}</p>
            </div>
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{wbsComponents.length}</p>
                  <p className="text-sm text-gray-600">WBS Components</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{project.totalCost}</p>
                  <p className="text-sm text-gray-600">Total Estimated Cost</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">100%</p>
                  <p className="text-sm text-gray-600">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">WBS Components</h2>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export All</span>
            </Button>
          </div>

          <div className="space-y-4">
            {wbsComponents.map((component) => (
              <Card key={component.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-semibold text-gray-900">{component.name}</h3>
                        <Badge variant="outline" className={getStatusColor(component.status)}>
                          {component.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div>
                          <p className="text-sm text-gray-600">Estimated Cost</p>
                          <p className="font-bold text-gray-900">{component.cost}</p>
                        </div>
                        <div className="flex-1 max-w-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="text-xs text-gray-500">{component.progress}%</span>
                          </div>
                          <Progress value={component.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-6">
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View PDF</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>CSV</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
