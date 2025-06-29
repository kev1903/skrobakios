
import { useState } from 'react';
import { CashFlowItem } from "./types";

export const useCashFlowData = () => {
  const [cashInData, setCashInData] = useState<CashFlowItem[]>([
    { name: "Construction Revenue", may: 12645, jun: 5049, jul: 33927, aug: 0, sep: 0, oct: 0 },
    { name: "Consulting Revenue", may: 426587, jun: 426587, jul: 33970, aug: 291, sep: 0, oct: 0 },
    { name: "Other Revenue", may: 426587, jun: 426587, jul: 0, aug: 0, sep: 0, oct: 0 },
    { name: "Returns & Revenue", may: 426587, jun: 426587, jul: 0, aug: 0, sep: 0, oct: 0 },
  ]);

  const [cashOutData, setCashOutData] = useState<CashFlowItem[]>([
    { name: "ATO - ICA", may: 500, jun: 1703, jul: 868, aug: 2501, sep: 2501, oct: 2501 },
    { name: "ATO - BAS Payment", may: 0, jun: 0, jul: 250, aug: 250, sep: 250, oct: 250 },
    { name: "ATO Initial Payment Plan", may: 0, jun: 1700, jul: 400, aug: 600, sep: 600, oct: 600 },
    { name: "Tax - Wage - Kevin", may: 0, jun: 0, jul: 1650, aug: 1650, sep: 1650, oct: 1650 },
    { name: "Other Expenses", may: 363, jun: 0, jul: 632, aug: 0, sep: 0, oct: 363 },
  ]);

  const addCashInAccount = (account: CashFlowItem) => {
    setCashInData(prev => [...prev, account]);
  };

  const addCashOutAccount = (account: CashFlowItem) => {
    setCashOutData(prev => [...prev, account]);
  };

  // Calculate totals for each month with proper type conversion
  const calculateTotals = (data: CashFlowItem[]) => {
    return data.reduce((totals, item) => {
      const getValue = (val: number | string): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const parsed = parseFloat(val);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };
      
      return {
        may: totals.may + getValue(item.may),
        jun: totals.jun + getValue(item.jun),
        jul: totals.jul + getValue(item.jul),
        aug: totals.aug + getValue(item.aug),
        sep: totals.sep + getValue(item.sep),
        oct: totals.oct + getValue(item.oct),
      };
    }, { may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0 });
  };

  const cashInTotals = calculateTotals(cashInData);
  const cashOutTotals = calculateTotals(cashOutData);

  // Calculate net movement (Cash In - Cash Out)
  const netMovement = {
    may: cashInTotals.may - cashOutTotals.may,
    jun: cashInTotals.jun - cashOutTotals.jun,
    jul: cashInTotals.jul - cashOutTotals.jul,
    aug: cashInTotals.aug - cashOutTotals.aug,
    sep: cashInTotals.sep - cashOutTotals.sep,
    oct: cashInTotals.oct - cashOutTotals.oct,
  };

  // Starting opening balance (this would typically come from your data source)
  const initialOpeningBalance = 22543;

  // Calculate ending balance sequentially and opening balance for each month
  const mayEndingBalance = initialOpeningBalance + netMovement.may;
  const junEndingBalance = mayEndingBalance + netMovement.jun;
  const julEndingBalance = junEndingBalance + netMovement.jul;
  const augEndingBalance = julEndingBalance + netMovement.aug;
  const sepEndingBalance = augEndingBalance + netMovement.sep;
  const octEndingBalance = sepEndingBalance + netMovement.oct;

  // Opening balance object - each month's opening balance is the previous month's ending balance
  const openingBalance: CashFlowItem = {
    name: "Opening Balance",
    may: initialOpeningBalance,
    jun: mayEndingBalance,
    jul: junEndingBalance,
    aug: julEndingBalance,
    sep: augEndingBalance,
    oct: sepEndingBalance
  };

  // Create the ending balance object
  const endingBalance = {
    may: mayEndingBalance,
    jun: junEndingBalance,
    jul: julEndingBalance,
    aug: augEndingBalance,
    sep: sepEndingBalance,
    oct: octEndingBalance,
  };

  return {
    openingBalance,
    cashInData,
    cashOutData,
    cashInTotals,
    cashOutTotals,
    netMovement,
    endingBalance,
    addCashInAccount,
    addCashOutAccount
  };
};
