
const monthHeaders = ["May 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Oct 25"];

export const CashFlowTableHeader = () => {
  return (
    <thead>
      <tr className="border-b">
        <th className="text-left py-2 font-medium text-gray-700 px-2"></th>
        {monthHeaders.map((month, index) => (
          <th key={index} className="text-right py-2 font-medium text-gray-700 px-2 min-w-[100px]">{month}</th>
        ))}
      </tr>
    </thead>
  );
};
