# Feature Specification: Show Daily and Monthly Usage Cost

**Feature Branch**: `001-show-daily-monthly-cost`  
**Created**: Thu Jan 15 2026  
**Status**: Draft  
**Input**: User description: "Show daily and monthly usage cost"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Daily and Monthly Usage Costs (Priority: P1)

As a user, I want to see my usage cost for the current day and current month at a glance so that I can track my spending and usage patterns effectively.

**Why this priority**: High value for users to monitor their AI usage costs in real-time and avoid budget surprises.

**Independent Test**: Can be tested by performing AI tasks (chat, translation) and verifying the badge updates both daily and monthly counters appropriate to the date.

**Acceptance Scenarios**:

1. **Given** the application is loaded, **When** I view the usage badge in the UI, **Then** I see two cost values formatted as `($Daily | $Monthly)`.
2. **Given** I have performed no tasks today, **When** I view the badge, **Then** the daily cost shows `$0.0000`.
3. **Given** I perform a new AI task, **When** the task completes, **Then** both the daily and monthly cost values increment by the cost of that task.
4. **Given** I hover over the usage badge, **When** the tooltip appears, **Then** it explicitly identifies the values as "Daily" and "Monthly" costs.

### Edge Cases

- What happens when the month changes (e.g., from Jan 31 to Feb 1)? The monthly cost should reset to the value of usage on Feb 1 only, or 0 if none.
- What happens when the day changes (midnight)? The daily cost should reset to 0.
- How does the system handle timezone differences? Calculations should be consistent with the user's local time (browser time).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate the total usage cost for the current day (defined as usage since 00:00:00 local time).
- **FR-002**: System MUST calculate the total usage cost for the current month (defined as usage since 00:00:00 on the 1st day of the current month).
- **FR-003**: The `UsageCostBadge` component MUST display both daily and monthly costs in a format similar to `($0.0000 | $0.0000)`.
- **FR-004**: Costs MUST be formatted to 4 decimal places to accurately reflect small token usage costs.
- **FR-005**: The component MUST display a loading indicator (e.g., `...`) while the costs are being fetched or calculated.
- **FR-006**: The badge tooltip MUST be updated to explain the dual-value display (e.g., "Daily Usage | Monthly Usage").

### Key Entities

- **UsageRecord**: Existing entity containing timestamp and cost, used to aggregate daily and monthly totals.
- **UsageAnalytics**: May need extension or helper functions to provide period-specific aggregates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see their updated daily and monthly costs within 1 second of a task completion.
- **SC-002**: The displayed daily cost resets to $0.0000 at the start of a new day.
- **SC-003**: The displayed monthly cost resets to $0.0000 at the start of a new month.
