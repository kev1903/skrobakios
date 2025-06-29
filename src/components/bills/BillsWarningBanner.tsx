
import { AlertTriangle } from "lucide-react";

export const BillsWarningBanner = () => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-red-800">
          <span className="font-medium">You have 4 bills that are overdue.</span>{" "}
          These bills are past their due date and may incur late fees.{" "}
          <span className="font-medium">Review and pay these bills immediately.</span>
        </p>
      </div>
    </div>
  );
};
