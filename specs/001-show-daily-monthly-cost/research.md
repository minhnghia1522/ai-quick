# Research: Show Daily and Monthly Usage Cost

## Technical Investigation

### 1. Data Source (`UsageRecord`)
- **Status**: Exists.
- **Location**: `src/types/usage.ts` (implied by imports in `UsageCostService`).
- **Storage**: IndexedDB via `src/lib/database/usageCostDB.ts`.
- **Access**: `src/service/usageCostService.ts` handles logic.

### 2. Usage Aggregation
- **Current Capability**: `UsageCostService` has `getAnalyticsByTimeRange('today')` and `('30days')`.
- **Gap**:
    - "Today" logic in `getFilteredUsageRecords` (in DB) calculates from midnight (correct).
    - "Monthly" logic currently uses '30days' (rolling window), but requirement is "current month" (since 1st of month).
    - Need to add specific "Current Month" aggregation logic.

### 3. UI Component
- **Existing Component**: `src/components/UsageCostBadge.tsx` found.
- **Integration**: Already used in `src/components/AppHeader.tsx`.
- **Action**: Modify existing component instead of creating new.

## Decisions

### Decision 1: Extend `UsageCostService`
- **Context**: Need specific "Current Month" calculation.
- **Choice**: Add `getDailyCost()` and `getMonthlyCost()` methods to `UsageCostService`.
- **Rationale**: Encapsulate the logic in the service layer. Reuse existing `usageCostStore.getFilteredUsageRecords` or `getAllUsageRecords` and filter in memory if volume is low, or add specific DB queries if high. Given client-side context, in-memory filtering of `getAllUsageRecords` (or optimizing `getFilteredUsageRecords` to accept custom date ranges) is acceptable.
- **Implementation Detail**:
    - `getDailyCost()`: Wrapper around `getAnalytics({ timeRange: 'today' })` (already exists logic).
    - `getMonthlyCost()`: New logic. Calculate start of current month and filter records >= that date.

### Decision 2: Component Architecture
- **Context**: Display cost in UI.
- **Choice**: Update `UsageCostBadge` component.
- **Rationale**: Reuse existing component which is already placed in the header.
- **State Management**: Use `useAppStore` (Zustand).

### Decision 3: Event Handling
- **Context**: Update badge when task completes.
- **Choice**: Existing `useAppStore` action `updateUsageData`.
- **Plan**: Update `UsageCostSlice` actions to refresh daily/monthly costs alongside total cost.
- **Refinement**: No new hook needed, just update the slice.
- **Selected**: Update `UsageCostSlice`.

## Alternatives Considered

- **Using `UsageAnalyticsDialog` logic**: It's too heavy for a simple badge.
- **Redux/Global Store**: Project uses Zustand. Could add `totalDailyCost` to a Zustand store, but might be overkill if only this badge needs it. A hook is cleaner.
