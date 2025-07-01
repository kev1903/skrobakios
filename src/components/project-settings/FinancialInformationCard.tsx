
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface FinancialInformationCardProps {
  formData: {
    contract_price: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const FinancialInformationCard = ({ formData, onInputChange }: FinancialInformationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Financial Information
        </CardTitle>
        <CardDescription>
          Project budget and contract details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="contract-price">Contract Price</Label>
          <Input
            id="contract-price"
            value={formData.contract_price}
            onChange={(e) => onInputChange("contract_price", e.target.value)}
            placeholder="Enter contract price (e.g., $2,450,000)"
          />
        </div>
      </CardContent>
    </Card>
  );
};
