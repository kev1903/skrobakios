
import { BreakdownData } from "./types";

export const useCashFlowBreakdown = () => {
  // Sample breakdown data for demonstration
  const getBreakdownData = (itemName: string, month: string): BreakdownData => {
    if (itemName === "Construction Revenue" && month === "May 25") {
      return {
        title: "Construction Revenue",
        month: "May '25",
        items: [
          { date: "Paid - 01 May", description: "Ben Holst & Jacqui Junkeer", invoiceNumber: "INV-0277", amount: 3500.00, status: "Paid" },
          { date: "Paid - 12 May", description: "CourtScopes", invoiceNumber: "INV-0275", amount: 2050.06, status: "Paid" },
          { date: "Paid - 19 May", description: "Vista Plastering", invoiceNumber: "INV-0281", amount: 2090.00, status: "Paid" },
          { date: "Paid - 23 May", description: "Kings Cut Concrete Pty Ltd", invoiceNumber: "INV-0279", amount: 3025.00, status: "Paid" },
          { date: "Paid - 26 May", description: "Lyall Johaan", invoiceNumber: "INV-0283", amount: 907.50, status: "Paid" },
          { date: "Paid - 26 May", description: "Patrick & Nomsa", invoiceNumber: "INV-0285", amount: 3498.00, status: "Paid" },
          { date: "Paid - 27 May", description: "Vista Plastering", invoiceNumber: "INV-0284", amount: 2974.40, status: "Paid" },
        ],
        total: 18044.96,
        expected: 0.00,
        overExpected: 0.00
      };
    }

    // Default breakdown for other items
    return {
      title: itemName,
      month: month,
      items: [
        { date: "Paid - 15 " + month.split(' ')[0], description: "Sample Transaction 1", invoiceNumber: "INV-001", amount: 1200.00, status: "Paid" },
        { date: "Paid - 28 " + month.split(' ')[0], description: "Sample Transaction 2", invoiceNumber: "INV-002", amount: 850.00, status: "Paid" },
      ],
      total: 2050.00,
      expected: 500.00,
      overExpected: 0.00
    };
  };

  return { getBreakdownData };
};
