# Quickstart: Usage Cost Badge

## Overview
The `UsageCostBadge` component displays the current day's and month's AI usage costs. It updates automatically when tasks are completed (requires integration).

## Usage

```tsx
import { UsageCostBadge } from '@/src/components/UsageCostBadge';

export default function Header() {
  return (
    <header>
      {/* ... other header items ... */}
      <UsageCostBadge />
    </header>
  );
}
```

## Integration Details
To ensure the badge updates immediately after a task:
1.  Import `usageCostService`.
2.  After recording usage, trigger a refresh event (mechanism to be implemented, likely a custom event or shared hook state).

```typescript
// In your task handler
await usageCostService.recordUsage(...);
// Badge should reactively update
```
