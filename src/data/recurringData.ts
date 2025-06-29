
import { RecurringItem } from './recurring/types';
import { utilitiesData } from './recurring/utilities';
import { softwareData } from './recurring/software';
import { insuranceData } from './recurring/insurance';
import { financeData } from './recurring/finance';
import { payrollData } from './recurring/payroll';
import { taxData } from './recurring/tax';
import { registrationData } from './recurring/registration';
import { miscellaneousData } from './recurring/miscellaneous';

// Re-export the interface for backward compatibility
export type { RecurringItem } from './recurring/types';

// Combine all data and sort by ID to maintain original order
export const recurringItems: RecurringItem[] = [
  ...utilitiesData,
  ...softwareData,
  ...insuranceData,
  ...financeData,
  ...payrollData,
  ...taxData,
  ...registrationData,
  ...miscellaneousData
].sort((a, b) => a.id - b.id);
