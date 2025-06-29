
import { AlertTriangle } from "lucide-react";

export const InvoicesWarningBanner = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">You have 4 invoices with expected dates in the past.</span>{" "}
          Float forecasts these as payable by the end of today.{" "}
          <span className="font-medium">Update their expected dates or exclude them.</span>
        </p>
      </div>
    </div>
  );
};
