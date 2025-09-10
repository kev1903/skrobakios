
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/hooks/useProjects";
import { formatCurrency } from "@/utils/formatters";

interface ProjectMetricsProps {
  project: Project;
}

export const ProjectMetrics = ({ project }: ProjectMetricsProps) => {
  const getContractValue = () => {
    if (!project.contract_price) return 0;
    const cleanPrice = project.contract_price.replace(/[$,]/g, '');
    return parseInt(cleanPrice) || 0;
  };

  const contractValue = getContractValue();
  
  const summaryMetrics = [
    { label: "Contract Price", value: formatCurrency(project.contract_price), trend: "up" },
    { label: "Paid To Date", value: contractValue > 0 ? formatCurrency(contractValue * 0.65) : "$0", trend: "up" },
    { label: "Payment Received", value: contractValue > 0 ? formatCurrency(contractValue * 0.2) : "$0", trend: "up" }
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Project Summary Cost</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaryMetrics.map((metric, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{metric.label}</h3>
                <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center">
                  <div className="w-6 h-4 bg-blue-200 rounded-sm"></div>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
