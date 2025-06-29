export interface RecurringItem {
  id: number;
  name: string;
  type: string;
  amount: number;
  frequency: string;
  nextDate: string;
  status: string;
  category: string;
  priority: string;
}

export const recurringItems: RecurringItem[] = [
  {
    id: 1,
    name: "VicRoads - Fine",
    type: "Expense",
    amount: -296.56,
    frequency: "One-Off",
    nextDate: "2025-06-05",
    status: "Active",
    category: "Fines",
    priority: "High"
  },
  {
    id: 2,
    name: "Optus (1)",
    type: "Expense",
    amount: -296.56,
    frequency: "Monthly",
    nextDate: "2025-06-05",
    status: "Active",
    category: "Utilities",
    priority: "High"
  },
  {
    id: 3,
    name: "Adobe Suite",
    type: "Expense",
    amount: -149.00,
    frequency: "Monthly",
    nextDate: "2025-06-08",
    status: "Active",
    category: "Software",
    priority: "Medium"
  },
  {
    id: 4,
    name: "iQumulate - Annual Contract Works Insurance",
    type: "Expense",
    amount: -463.44,
    frequency: "Monthly",
    nextDate: "2025-06-08",
    status: "Active",
    category: "Insurance",
    priority: "High"
  },
  {
    id: 5,
    name: "Microsoft Store (1)",
    type: "Expense",
    amount: -9.90,
    frequency: "Monthly",
    nextDate: "2025-06-08",
    status: "Active",
    category: "Software",
    priority: "High"
  },
  {
    id: 6,
    name: "7-ELEVEN",
    type: "Expense",
    amount: -200.00,
    frequency: "Weekly",
    nextDate: "2025-06-09",
    status: "Active",
    category: "Fuel",
    priority: "High"
  },
  {
    id: 7,
    name: "Apple - ChatGPT",
    type: "Expense",
    amount: -29.99,
    frequency: "Monthly",
    nextDate: "2025-06-09",
    status: "Active",
    category: "Software",
    priority: "High"
  },
  {
    id: 8,
    name: "Name Cheap - See.com.au",
    type: "Expense",
    amount: -19.98,
    frequency: "Yearly",
    nextDate: "2025-06-09",
    status: "Active",
    category: "Domain",
    priority: "Low"
  },
  {
    id: 9,
    name: "Bunnings - Credit Account",
    type: "Expense",
    amount: -500.00,
    frequency: "Monthly",
    nextDate: "2025-06-10",
    status: "Active",
    category: "Supplies",
    priority: "High"
  },
  {
    id: 10,
    name: "Optus (3)",
    type: "Expense",
    amount: -84.00,
    frequency: "Monthly",
    nextDate: "2025-06-11",
    status: "Active",
    category: "Utilities",
    priority: "High"
  },
  {
    id: 11,
    name: "Xero",
    type: "Expense",
    amount: -85.50,
    frequency: "Monthly",
    nextDate: "2025-06-11",
    status: "Active",
    category: "Software",
    priority: "High"
  },
  {
    id: 12,
    name: "Budget Direct - Insurance (White Ford)",
    type: "Expense",
    amount: -179.44,
    frequency: "Monthly",
    nextDate: "2025-06-12",
    status: "Active",
    category: "Insurance",
    priority: "High"
  },
  {
    id: 13,
    name: "Apple - Concepts",
    type: "Expense",
    amount: -6.99,
    frequency: "Monthly",
    nextDate: "2025-06-13",
    status: "Active",
    category: "Software",
    priority: "High"
  },
  {
    id: 14,
    name: "Harvest",
    type: "Expense",
    amount: -57.54,
    frequency: "Monthly",
    nextDate: "2025-06-13",
    status: "Active",
    category: "Software",
    priority: "Medium"
  },
  {
    id: 15,
    name: "Aim Hire - Temp Power Pole",
    type: "Expense",
    amount: -154.00,
    frequency: "Monthly",
    nextDate: "2025-06-15",
    status: "Active",
    category: "Equipment",
    priority: "High"
  },
  {
    id: 16,
    name: "Wages - Kevin",
    type: "Expense",
    amount: -4100.00,
    frequency: "Monthly",
    nextDate: "2025-06-15",
    status: "Active",
    category: "Payroll",
    priority: "High"
  },
  {
    id: 17,
    name: "Wages - Zayra",
    type: "Expense",
    amount: -1000.00,
    frequency: "Monthly",
    nextDate: "2025-06-15",
    status: "Active",
    category: "Payroll",
    priority: "High"
  },
  {
    id: 18,
    name: "Credit Card - Min Payment",
    type: "Expense",
    amount: -200.00,
    frequency: "Monthly",
    nextDate: "2025-06-15",
    status: "Active",
    category: "Finance",
    priority: "High"
  },
  {
    id: 19,
    name: "ATO - Activity Balance (3)",
    type: "Expense",
    amount: -921.35,
    frequency: "Monthly",
    nextDate: "2025-06-16",
    status: "Active",
    category: "Tax",
    priority: "High"
  },
  {
    id: 20,
    name: "BizCover",
    type: "Expense",
    amount: -96.85,
    frequency: "Monthly",
    nextDate: "2025-06-17",
    status: "Active",
    category: "Insurance",
    priority: "High"
  },
  {
    id: 21,
    name: "Revo Fitness",
    type: "Expense",
    amount: -42.00,
    frequency: "Monthly",
    nextDate: "2025-06-18",
    status: "Active",
    category: "Health",
    priority: "Medium"
  },
  {
    id: 22,
    name: "ATO - Activity Balance (2)",
    type: "Expense",
    amount: -500.00,
    frequency: "Monthly",
    nextDate: "2025-06-19",
    status: "Active",
    category: "Tax",
    priority: "High"
  },
  {
    id: 23,
    name: "VBA - DBU - Renewal",
    type: "Expense",
    amount: -491.30,
    frequency: "Yearly",
    nextDate: "2025-06-21",
    status: "Active",
    category: "Registration",
    priority: "High"
  },
  {
    id: 24,
    name: "Microsoft Store (2)",
    type: "Expense",
    amount: -100.00,
    frequency: "Monthly",
    nextDate: "2025-06-22",
    status: "Active",
    category: "Software",
    priority: "High"
  },
  {
    id: 25,
    name: "Ford Loan",
    type: "Expense",
    amount: -1565.74,
    frequency: "Monthly",
    nextDate: "2025-06-25",
    status: "Active",
    category: "Finance",
    priority: "High"
  },
  {
    id: 26,
    name: "Optus (2)",
    type: "Expense",
    amount: -120.00,
    frequency: "Monthly",
    nextDate: "2025-06-25",
    status: "Active",
    category: "Utilities",
    priority: "High"
  },
  {
    id: 27,
    name: "VicRoads - Rego (Grey Ford)",
    type: "Expense",
    amount: -907.70,
    frequency: "Yearly",
    nextDate: "2025-06-28",
    status: "Active",
    category: "Registration",
    priority: "High"
  },
  {
    id: 28,
    name: "VBA - CBU - Renewal",
    type: "Expense",
    amount: -600.00,
    frequency: "Yearly",
    nextDate: "2025-06-28",
    status: "Active",
    category: "Registration",
    priority: "High"
  },
  {
    id: 29,
    name: "Apple - SiteScape",
    type: "Expense",
    amount: -79.99,
    frequency: "Monthly",
    nextDate: "2025-06-30",
    status: "Active",
    category: "Software",
    priority: "High"
  },
  {
    id: 30,
    name: "PROGRAMA",
    type: "Expense",
    amount: -53.90,
    frequency: "Monthly",
    nextDate: "2025-06-30",
    status: "Active",
    category: "Software",
    priority: "Low"
  },
  {
    id: 31,
    name: "ClickUp",
    type: "Expense",
    amount: -38.00,
    frequency: "Monthly",
    nextDate: "2025-07-02",
    status: "Active",
    category: "Software",
    priority: "Medium"
  },
  {
    id: 32,
    name: "Amazon Web",
    type: "Expense",
    amount: -8.00,
    frequency: "Monthly",
    nextDate: "2025-07-04",
    status: "Active",
    category: "Software",
    priority: "Medium"
  },
  {
    id: 33,
    name: "ATO - Activity Balance (1)",
    type: "Expense",
    amount: -480.00,
    frequency: "Monthly",
    nextDate: "2025-07-04",
    status: "Active",
    category: "Tax",
    priority: "High"
  },
  {
    id: 34,
    name: "Dailpad",
    type: "Expense",
    amount: -32.00,
    frequency: "Monthly",
    nextDate: "2025-07-04",
    status: "Active",
    category: "Software",
    priority: "Medium"
  },
  {
    id: 35,
    name: "Sector Services - Rent",
    type: "Expense",
    amount: -66.00,
    frequency: "Monthly",
    nextDate: "2025-07-04",
    status: "Active",
    category: "Rent",
    priority: "High"
  },
  {
    id: 36,
    name: "Apple - iCloud+",
    type: "Expense",
    amount: -14.99,
    frequency: "Monthly",
    nextDate: "2025-07-05",
    status: "Active",
    category: "Software",
    priority: "High"
  },
  {
    id: 37,
    name: "Anytrack",
    type: "Expense",
    amount: -16.50,
    frequency: "Monthly",
    nextDate: "2025-07-06",
    status: "Active",
    category: "Software",
    priority: "High"
  },
  {
    id: 38,
    name: "Budget Direct - Insurance (Grey Ford)",
    type: "Expense",
    amount: -247.57,
    frequency: "Monthly",
    nextDate: "2025-07-07",
    status: "Active",
    category: "Insurance",
    priority: "High"
  },
  {
    id: 39,
    name: "Ignition",
    type: "Expense",
    amount: -163.90,
    frequency: "Monthly",
    nextDate: "2025-07-08",
    status: "Active",
    category: "Software",
    priority: "Medium"
  },
  {
    id: 40,
    name: "Loom",
    type: "Expense",
    amount: -223.58,
    frequency: "Yearly",
    nextDate: "2025-07-10",
    status: "Active",
    category: "Software",
    priority: "Low"
  },
  {
    id: 41,
    name: "Name Cheap - Courtscapes.com.au",
    type: "Expense",
    amount: -4.88,
    frequency: "Yearly",
    nextDate: "2025-09-10",
    status: "Active",
    category: "Domain",
    priority: "High"
  },
  {
    id: 42,
    name: "MIDJOURNEY",
    type: "Expense",
    amount: -143.63,
    frequency: "Yearly",
    nextDate: "2025-09-10",
    status: "Active",
    category: "Software",
    priority: "Medium"
  },
  {
    id: 43,
    name: "Apple - Paper",
    type: "Expense",
    amount: -13.99,
    frequency: "Yearly",
    nextDate: "2025-09-12",
    status: "Active",
    category: "Software",
    priority: "Medium"
  },
  {
    id: 44,
    name: "VicRoads - Rego (White Ford)",
    type: "Expense",
    amount: -468.60,
    frequency: "Semi-Annually",
    nextDate: "2025-10-15",
    status: "Active",
    category: "Registration",
    priority: "High"
  },
  {
    id: 45,
    name: "Amazon Prime",
    type: "Expense",
    amount: -79.00,
    frequency: "Yearly",
    nextDate: "2026-02-26",
    status: "Active",
    category: "Software",
    priority: "Medium"
  },
  {
    id: 46,
    name: "Norton - Antivirus",
    type: "Expense",
    amount: -179.99,
    frequency: "Yearly",
    nextDate: "2026-03-06",
    status: "Active",
    category: "Software",
    priority: "High"
  },
  {
    id: 47,
    name: "Name Cheap - Ardelle.com.au",
    type: "Expense",
    amount: -18.98,
    frequency: "Yearly",
    nextDate: "2026-03-09",
    status: "Active",
    category: "Domain",
    priority: "High"
  },
  {
    id: 48,
    name: "Apple - NordPass",
    type: "Expense",
    amount: -52.99,
    frequency: "Yearly",
    nextDate: "2026-04-11",
    status: "Active",
    category: "Software",
    priority: "High"
  },
  {
    id: 49,
    name: "Apple - Story Art",
    type: "Expense",
    amount: -29.49,
    frequency: "Yearly",
    nextDate: "2026-05-13",
    status: "Active",
    category: "Software",
    priority: "Low"
  },
  {
    id: 50,
    name: "Coohom",
    type: "Expense",
    amount: -468.28,
    frequency: "Yearly",
    nextDate: "2026-05-27",
    status: "Active",
    category: "Software",
    priority: "Medium"
  }
];
