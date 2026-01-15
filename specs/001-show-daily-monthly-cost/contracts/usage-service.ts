// Specification for UsageCostService extensions

export interface PeriodCosts {
  daily: number;
  monthly: number;
}

export interface IUsageCostServiceExtensions {
  /**
   * Calculates the total cost for the current calendar day (from 00:00:00 local time).
   */
  getDailyCost(): Promise<number>;

  /**
   * Calculates the total cost for the current calendar month (from 1st of month 00:00:00 local time).
   */
  getMonthlyCost(): Promise<number>;

  /**
   * Retrieves both daily and monthly costs in a single call for efficiency.
   */
  getCurrentPeriodCosts(): Promise<PeriodCosts>;
}
