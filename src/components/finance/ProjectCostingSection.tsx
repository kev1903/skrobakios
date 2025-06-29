
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator } from "lucide-react";

export const ProjectCostingSection = () => {
  const projectProfitability = [
    { project: "Gordon St, Balwyn", budget: 2450000, actual: 2380000, margin: 2.9, status: "on-track" },
    { project: "Collins St Office", budget: 1850000, actual: 1920000, margin: -3.8, status: "over-budget" },
    { project: "Richmond Warehouse", budget: 980000, actual: 945000, margin: 3.6, status: "under-budget" },
    { project: "Docklands Tower", budget: 3200000, actual: 3180000, margin: 0.6, status: "on-track" },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-green-600" />
          <span>Project Profitability</span>
        </CardTitle>
        <CardDescription>Budget vs actual performance</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Margin %</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectProfitability.map((project, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{project.project}</TableCell>
                <TableCell>
                  <span className={`font-semibold ${project.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {project.margin > 0 ? '+' : ''}{project.margin}%
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={project.status === 'on-track' ? 'default' : 
                           project.status === 'under-budget' ? 'default' : 'destructive'}
                    className={project.status === 'under-budget' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {project.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
