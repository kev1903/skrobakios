export interface CostItem {
  id: string;
  costCode: string;
  tradeScope: string;
  budget: number;
  committed: number;
  paid: number;
  remaining: number;
  notes: string;
}

export interface CostTotals {
  budget: number;
  committed: number;
  paid: number;
  remaining: number;
}