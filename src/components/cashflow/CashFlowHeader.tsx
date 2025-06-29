
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Settings } from "lucide-react";

interface CashFlowHeaderProps {
  selectedScenario: string;
  setSelectedScenario: (value: string) => void;
}

export const CashFlowHeader = ({ selectedScenario, setSelectedScenario }: CashFlowHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cash Flow Management</h1>
          <p className="text-gray-600">Monitor and forecast your cash flow with detailed projections</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Scenario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="optimistic">Optimistic</SelectItem>
              <SelectItem value="pessimistic">Pessimistic</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>3D View</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
