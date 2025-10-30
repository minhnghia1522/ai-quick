# Analytics Component Architecture

This directory contains the refactored **UsageAnalyticsDialog** component, organized into modular, reusable pieces for better maintainability and scalability.

## Directory Structure

```
analytics/
├── README.md                          # This file
├── index.ts                           # Barrel export for easy imports
├── UsageAnalyticsDialog.tsx           # Main dialog component
├── types/
│   └── analytics.types.ts             # TypeScript type definitions
├── hooks/
│   └── useAnalyticsData.ts            # Custom hook for data management
├── utils/
│   └── analytics.utils.ts             # Utility functions
├── filters/
│   ├── FilterSidebar.tsx              # Main filter container
│   ├── TimeRangeFilter.tsx            # Time range selection
│   └── ModelFilter.tsx                # Model selection dropdown
├── charts/
│   ├── UsageChart.tsx                 # Bar chart component
│   └── ChartContainer.tsx             # Chart with tabs wrapper
├── summary/
│   ├── SummaryCards.tsx               # Grid of metric cards
│   └── MetricCard.tsx                 # Individual metric card
├── breakdown/
│   ├── ModelBreakdown.tsx             # Model usage breakdown
│   └── TaskTypeBreakdown.tsx          # Task type breakdown
├── states/
│   ├── LoadingState.tsx               # Loading skeleton UI
│   └── ErrorState.tsx                 # Error display UI
└── export/
    ├── ExportButton.tsx               # Export dropdown button
    └── exportUtils.ts                 # Export logic (JSON/CSV)
```

## Component Hierarchy

```
UsageAnalyticsDialog
├── FilterSidebar
│   ├── TimeRangeFilter
│   └── ModelFilter
├── SummaryCards
│   └── MetricCard (x4)
├── ChartContainer
│   └── UsageChart
├── ModelBreakdown
├── TaskTypeBreakdown
└── ExportButton
```

## Usage

### Basic Import

```typescript
import UsageAnalyticsDialog from '@/src/components/analytics/UsageAnalyticsDialog';
// or
import { UsageAnalyticsDialog } from '@/src/components/analytics';
```

### Using Individual Components

```typescript
import {
  SummaryCards,
  ChartContainer,
  FilterSidebar,
  useAnalyticsData
} from '@/src/components/analytics';
```

### Example: Using the main dialog

```typescript
import UsageAnalyticsDialog from '@/src/components/analytics/UsageAnalyticsDialog';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <UsageAnalyticsDialog
      open={open}
      onOpenChange={setOpen}
    />
  );
}
```

### Example: Using custom hook in a custom layout

```typescript
import { useAnalyticsData } from '@/src/components/analytics';

function CustomAnalyticsView() {
  const {
    analytics,
    chartData,
    isLoading,
    filters,
    handleTimeRangeChange
  } = useAnalyticsData(true);

  return (
    <div>
      {/* Your custom layout using the hook data */}
    </div>
  );
}
```

## Key Features

### 1. Modular Design
- Each component has a single responsibility
- Easy to test and maintain
- Reusable across different parts of the application

### 2. Type Safety
- Comprehensive TypeScript types in `types/analytics.types.ts`
- Proper type definitions for all props and state

### 3. Custom Hook
- `useAnalyticsData` hook encapsulates all data fetching and state management
- Can be reused in different UI layouts

### 4. Utility Functions
- Pure functions for formatting and calculations
- Easy to test and reuse

### 5. Export Functionality
- Supports JSON and CSV export formats
- Separated logic for easy customization

## Component Details

### Filters
- **TimeRangeFilter**: Select time range (today, 7 days, 30 days, 90 days)
- **ModelFilter**: Filter by AI models with multi-select support
- **FilterSidebar**: Container that combines all filters

### Charts
- **UsageChart**: Recharts-based bar chart
- **ChartContainer**: Wrapper with tab switching for different metrics (tokens, cost, tasks)

### Summary
- **MetricCard**: Reusable card for displaying a single metric
- **SummaryCards**: Grid of 4 metric cards (total cost, tasks, tokens, avg cost)

### Breakdown
- **ModelBreakdown**: Detailed breakdown by AI model
- **TaskTypeBreakdown**: Detailed breakdown by task type

### States
- **LoadingState**: Skeleton UI during data loading
- **ErrorState**: Error display with retry button

### Export
- **ExportButton**: Dropdown button for export options
- **exportUtils**: Functions for JSON and CSV export

## Best Practices

1. **Component Organization**: Each component is in its own file based on functional grouping
2. **Import Management**: Use the barrel export (`index.ts`) for cleaner imports
3. **Type Safety**: Always use proper TypeScript types
4. **Reusability**: Components are designed to be reused in different contexts
5. **Separation of Concerns**: Business logic is in hooks/utils, UI is in components

## Future Enhancements

Potential improvements:
- Add unit tests for each component
- Add Storybook stories for component documentation
- Add more chart types (line chart, pie chart)
- Add date range picker for custom time ranges
- Add more export formats (PDF, Excel)
- Add data visualization libraries for advanced charts

## Migration Guide

If you're using the old monolithic `UsageAnalyticsDialog.tsx`, it's now deprecated but still works via re-export for backward compatibility. To migrate:

**Old:**
```typescript
import UsageAnalyticsDialog from '@/src/components/UsageAnalyticsDialog';
```

**New (recommended):**
```typescript
import UsageAnalyticsDialog from '@/src/components/analytics/UsageAnalyticsDialog';
// or
import { UsageAnalyticsDialog } from '@/src/components/analytics';
```

The old import path will continue to work but is deprecated.
