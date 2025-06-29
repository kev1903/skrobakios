
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const RecurringWarningBanner = () => {
  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <strong>Attention:</strong> 3 recurring transactions are scheduled to process in the next 7 days. 
        Review your cash flow to ensure sufficient funds are available.
      </AlertDescription>
    </Alert>
  );
};
