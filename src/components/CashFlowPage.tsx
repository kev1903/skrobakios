
interface CashFlowPageProps {
  onNavigate?: (page: string) => void;
}

export const CashFlowPage = ({ onNavigate }: CashFlowPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cash Flow Management</h1>
            <p className="text-gray-600">Monitor and manage your cash flow transactions</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Cash Flow Page</h2>
          <p className="text-gray-500">This is a blank page ready for cash flow management features.</p>
        </div>
      </div>
    </div>
  );
};
