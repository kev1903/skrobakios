import { Table } from "lucide-react";

export const DigitalObjectsHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Table className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Digital Objects</h1>
          <p className="text-slate-400">Project component data table</p>
        </div>
      </div>
    </div>
  );
};