
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const ComplianceSection = () => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-red-600" />
          <span>Compliance & Obligations</span>
        </CardTitle>
        <CardDescription>Tax, payroll, and regulatory requirements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 border-l-4 border-l-orange-500 bg-orange-50">
            <div>
              <div className="font-semibold">GST/BAS Due</div>
              <div className="text-sm text-gray-600">Due: Jan 28, 2024</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-orange-600">$45,200</div>
              <div className="text-xs text-orange-600">7 days</div>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 border-l-4 border-l-green-500 bg-green-50">
            <div>
              <div className="font-semibold">Payroll</div>
              <div className="text-sm text-gray-600">Monthly total</div>
            </div>
            <div className="font-bold text-green-600">$185,000</div>
          </div>
          <div className="flex justify-between items-center p-3 border-l-4 border-l-blue-500 bg-blue-50">
            <div>
              <div className="font-semibold">Superannuation</div>
              <div className="text-sm text-gray-600">Quarterly liability</div>
            </div>
            <div className="font-bold text-blue-600">$18,500</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
