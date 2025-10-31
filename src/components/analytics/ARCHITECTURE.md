# Analytics Component Architecture

## Overview

The UsageAnalyticsDialog has been refactored from a monolithic ~725 line component into a modular architecture with 18 separate files, organized by functional responsibility.

## Component Dependencies Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                    UsageAnalyticsDialog.tsx                     │
│                      (Main Container)                           │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─── useAnalyticsData (hooks/)
             │    └─── Manages all state and data fetching
             │
             ├─── FilterSidebar (filters/)
             │    ├─── TimeRangeFilter
             │    │    └─── Select (ui)
             │    └─── ModelFilter
             │         └─── DropdownMenu (ui)
             │
             ├─── LoadingState (states/)
             │    └─── Skeleton (ui)
             │
             ├─── ErrorState (states/)
             │    └─── Button (ui)
             │
             ├─── SummaryCards (summary/)
             │    └─── MetricCard (x4)
             │         └─── Card (ui)
             │
             ├─── ChartContainer (charts/)
             │    ├─── Tabs (ui)
             │    └─── UsageChart
             │         └─── Recharts (BarChart)
             │
             ├─── ModelBreakdown (breakdown/)
             │    └─── Card (ui)
             │
             ├─── TaskTypeBreakdown (breakdown/)
             │    └─── Card (ui)
             │
             └─── ExportButton (export/)
                  ├─── DropdownMenu (ui)
                  └─── exportUtils
                       ├─── exportAsJson()
                       └─── exportAsCsv()
```

## Data Flow

```
┌─────────────────────┐
│   User Interaction  │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  useAnalyticsData   │ ← Custom Hook
│  (State Management) │
└──────────┬──────────┘
           │
           ├── usageCostService.getAnalytics()
           ├── usageCostService.getTimeSeriesData()
           └── usageCostService.getUsedModels()
           │
           v
┌─────────────────────┐
│   UI Components     │
│  (Read-only views)  │
└─────────────────────┘
```

## File Size Breakdown

**Before Refactoring:**
- `UsageAnalyticsDialog.tsx`: ~725 lines (single file)

**After Refactoring:**
- Main component: ~150 lines
- Filter components: ~3 files, ~200 lines total
- Chart components: ~2 files, ~130 lines total
- Summary components: ~2 files, ~80 lines total
- Breakdown components: ~2 files, ~140 lines total
- State components: ~2 files, ~60 lines total
- Export utilities: ~2 files, ~120 lines total
- Hook: ~1 file, ~180 lines
- Types: ~1 file, ~25 lines
- Utils: ~1 file, ~50 lines

**Total:** 18 files, well-organized by functionality

## Module Organization

### 1. **Types Module** (`types/`)
Purpose: Type definitions for the entire analytics feature
- No runtime dependencies
- Can be imported anywhere without circular dependencies

### 2. **Utils Module** (`utils/`)
Purpose: Pure functions for formatting and calculations
- No side effects
- Easy to unit test
- Reusable across components

### 3. **Hooks Module** (`hooks/`)
Purpose: Business logic and state management
- Encapsulates data fetching
- Manages all state
- Provides clean interface to UI components

### 4. **UI Modules** (`filters/`, `charts/`, `summary/`, `breakdown/`, `states/`)
Purpose: Presentational components
- Receive data via props
- No direct data fetching
- Highly reusable
- Easy to test with mock data

### 5. **Export Module** (`export/`)
Purpose: Data export functionality
- Separated from UI for testability
- Supports multiple formats

## Benefits of This Architecture

### 1. **Maintainability**
- Small, focused files (30-150 lines each)
- Clear separation of concerns
- Easy to locate and fix issues

### 2. **Reusability**
- Components can be used independently
- Hook can be used in different UI layouts
- Utils can be shared across features

### 3. **Testability**
- Each component can be tested in isolation
- Pure functions are easy to unit test
- Mock data can be easily provided

### 4. **Scalability**
- Easy to add new chart types
- Simple to add new filters
- Can extend export formats without touching UI

### 5. **Developer Experience**
- Clear file structure
- Logical grouping
- Barrel exports for clean imports
- TypeScript for type safety

### 6. **Performance**
- Smaller components for better tree-shaking
- Can lazy load individual modules if needed
- Easier to optimize specific components

## Component Responsibilities

### Primary Components
| Component | Responsibility | Lines | Dependencies |
|-----------|---------------|-------|--------------|
| UsageAnalyticsDialog | Orchestration & layout | ~150 | All child components |
| useAnalyticsData | State & data management | ~180 | usageCostService |

### UI Components
| Component | Responsibility | Lines | UI Library |
|-----------|---------------|-------|------------|
| FilterSidebar | Filter container | ~70 | TimeRangeFilter, ModelFilter |
| TimeRangeFilter | Time range selection | ~50 | Select |
| ModelFilter | Model selection | ~90 | DropdownMenu |
| SummaryCards | Metrics overview | ~65 | MetricCard |
| MetricCard | Single metric display | ~30 | Card |
| ChartContainer | Chart with tabs | ~70 | Tabs, UsageChart |
| UsageChart | Bar chart rendering | ~80 | Recharts |
| ModelBreakdown | Model usage details | ~75 | Card |
| TaskTypeBreakdown | Task type details | ~70 | Card |
| LoadingState | Loading skeleton | ~30 | Skeleton |
| ErrorState | Error display | ~30 | Button |
| ExportButton | Export dropdown | ~45 | DropdownMenu |

### Utility Modules
| Module | Responsibility | Functions | Pure |
|--------|---------------|-----------|------|
| analytics.utils | Formatting & calculations | 6 | Yes |
| exportUtils | Export logic | 2 | Yes |
| analytics.types | Type definitions | 6 types | N/A |

## Import Strategy

### Barrel Export Pattern
The `index.ts` file provides a clean API surface:

```typescript
// Everything available from one import
import {
  UsageAnalyticsDialog,
  useAnalyticsData,
  SummaryCards,
  ChartContainer,
  // ... etc
} from '@/src/components/analytics';
```

### Direct Imports
For tree-shaking optimization:

```typescript
// Import only what you need
import { useAnalyticsData } from '@/src/components/analytics/hooks/useAnalyticsData';
import { SummaryCards } from '@/src/components/analytics/summary/SummaryCards';
```

## Extension Points

### Adding a New Chart Type
1. Create new component in `charts/`
2. Add metric type to `analytics.types.ts`
3. Update `ChartContainer` to include new tab
4. Add formatting logic to `analytics.utils.ts`

### Adding a New Filter
1. Create new component in `filters/`
2. Add filter state to `analytics.types.ts`
3. Add handler in `useAnalyticsData` hook
4. Include in `FilterSidebar`

### Adding a New Export Format
1. Add export function to `exportUtils.ts`
2. Update `ExportButton` dropdown
3. No changes needed to other components

## Testing Strategy

### Unit Tests
- **Utils**: Test all formatting functions
- **Types**: Validate type definitions
- **Export**: Test JSON/CSV generation

### Component Tests
- **UI Components**: Test with mock data
- **Hook**: Test state management logic
- **Integration**: Test component interaction

### E2E Tests
- Test complete user flows
- Test data loading and filtering
- Test export functionality

## Future Considerations

### Potential Improvements
1. Add React.memo to expensive components
2. Implement virtual scrolling for large datasets
3. Add component lazy loading
4. Create Storybook stories
5. Add comprehensive test coverage
6. Add animation transitions
7. Implement data caching strategy

### Scalability Considerations
- Can add more breakdown views easily
- Can support multiple chart libraries
- Can extend to support real-time updates
- Can add data persistence layer
