# Tasks: Show Daily and Monthly Usage Cost

## Phase 1: Service Layer Extensions

- [x] **Extend UsageCostService**: Add methods for specific period cost calculation
  - File: `src/service/usageCostService.ts`
  - Implement `getDailyCost()`: Calculate cost from 00:00:00 local time
  - Implement `getMonthlyCost()`: Calculate cost from 1st of month 00:00:00 local time
  - Implement `getCurrentPeriodCosts()`: Return both values (optimized)

## Phase 2: State Management

- [x] **Update UsageCostSlice**: Support daily and monthly cost tracking
  - File: `src/store/UsageCostSlice.ts`
  - Add `dailyCost` and `monthlyCost` to `UsageCostSlice` state interface (default 0)
  - Update `refreshTotalCost` to `refreshCosts` (or extend it) to fetch period costs
  - Update `updateUsageData` to call the new refresh logic
  - Ensure `createUsageCostSlice` initializes new state properties

## Phase 3: Component Implementation

- [x] **Update UsageCostBadge**: Display dual values
  - File: `src/components/UsageCostBadge.tsx`
  - Select `dailyCost` and `monthlyCost` from `useAppStore`
  - Update render logic to show `($Daily | $Monthly)` format
  - Update tooltip to explain values
  - Ensure loading state is handled

## Phase 4: Verification

- [x] **Manual Verification**:
  - Check badge displays 0/0 on fresh start (or actual values if history exists)
  - Perform a task (e.g. translation)
  - Verify badge updates immediately
  - Verify values are correct (daily <= monthly)
