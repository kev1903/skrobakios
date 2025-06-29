
export interface CashFlowPageProps {
  onNavigate?: (page: string) => void;
}

export interface BreakdownItem {
  date: string;
  description: string;
  invoiceNumber: string;
  amount: number;
  status: string;
}

export interface BreakdownData {
  title: string;
  month: string;
  items: BreakdownItem[];
  total: number;
  expected: number;
  overExpected: number;
}

export interface CashFlowItem {
  name: string;
  may: number | string;
  jun: number | string;
  jul: number | string;
  aug: number | string;
  sep: number | string;
  oct: number | string;
}

export interface CashFlowSummary {
  openingBalance: CashFlowItem;
  netMovement: CashFlowItem;
  endingBalance: CashFlowItem;
}
