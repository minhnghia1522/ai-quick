# Implementation Plan

- [x] 1. Set up core data models and database infrastructure
  - Create TypeScript interfaces for UsageRecord, UsageAnalytics, and UsageFilter
  - Implement UsageCostDB class with IndexedDB integration following existing patterns
  - Set up database schema with proper indexes for efficient querying
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3_

- [x] 1.1 Create usage data types and interfaces
  - Define UsageRecord interface with all required fields (id, timestamp, tokens, costs, model, taskType)
  - Define UsageAnalytics interface for aggregated data display
  - Define UsageFilter interface for filtering options
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 1.2 Implement UsageCostDB database class
  - Create IndexedDB wrapper class following chatHistoryDB.ts patterns
  - Implement CRUD operations for usage records
  - Add indexes on timestamp, modelName, and taskType for efficient filtering
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 1.3 Write unit tests for database operations
  - Test database initialization and schema creation
  - Test CRUD operations with various data scenarios
  - Test index-based queries and filtering
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2. Implement cost calculation and tracking service
  - Create UsageCostService with cost calculation logic using existing model pricing
  - Implement methods for recording usage, calculating costs, and retrieving analytics
  - Add data aggregation functions for analytics display
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2.1 Create UsageCostService class
  - Implement recordUsage method to store new usage data
  - Implement calculateCost method using model pricing from types/model.ts
  - Add getTotalCost method for badge display
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.2 Implement analytics data aggregation
  - Create getAnalytics method with time-based filtering
  - Implement model-based filtering and breakdown calculations
  - Add task type breakdown and statistics generation
  - _Requirements: 3.2, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 2.3 Write unit tests for service methods
  - Test cost calculation accuracy with different models
  - Test analytics aggregation with various filter combinations
  - Test edge cases and error handling scenarios
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 5.1_

- [x] 3. Create Zustand store slice for usage cost state management
  - Implement UsageCostSlice following existing ApiKeySlice patterns
  - Add state for total cost, recent analytics, and loading states
  - Integrate with existing AppStore structure
  - _Requirements: 1.3, 1.4, 3.2, 6.2_

- [x] 3.1 Implement UsageCostSlice
  - Create Zustand slice with totalCost state for badge display
  - Add actions for updating usage data and refreshing totals
  - Implement caching for analytics data to improve performance
  - _Requirements: 1.3, 1.4, 3.2_

- [x] 3.2 Integrate with existing AppStore
  - Add UsageCostSlice to the main AppStore configuration
  - Ensure proper TypeScript typing for the combined store
  - Test store integration and state updates
  - _Requirements: 1.3, 1.4, 6.2_

- [ ]* 3.3 Write unit tests for store slice
  - Test state updates and action dispatching
  - Test store integration and data flow
  - Test caching behavior and performance optimizations
  - _Requirements: 1.3, 1.4, 3.2_

- [x] 4. Implement cost tracking interceptor for automatic usage capture
  - Create CostTrackingInterceptor to capture token usage from AI service calls
  - Integrate with existing chatService.ts and other AI services
  - Handle different response formats from various AI providers
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4.1 Create cost tracking interceptor
  - Implement middleware to intercept AI service responses
  - Extract token usage data from streamText responses
  - Handle different AI provider response formats (OpenAI, Gemini)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4.2 Integrate with existing AI services
  - Modify chatService.ts to include usage tracking
  - Add tracking to translate, enhance-prompt, and generate-data services
  - Ensure minimal impact on existing service performance
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 4.3 Write integration tests for service tracking
  - Test usage capture across different AI services
  - Test token extraction accuracy from various response formats
  - Test error handling when tracking fails
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Create UsageCostBadge component for header display
  - Implement badge component to display total cost next to LocaleSwitcher
  - Add click handler to open analytics dialog
  - Ensure real-time updates when new usage is recorded
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 5.1 Implement UsageCostBadge component
  - Create React component with cost display formatting
  - Connect to Zustand store for real-time total cost updates
  - Add click handler to trigger analytics dialog opening
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 5.2 Integrate badge into AppHeader
  - Modify AppHeader.tsx to include UsageCostBadge next to LocaleSwitcher
  - Ensure proper responsive layout and styling
  - Test badge positioning and visual integration
  - _Requirements: 1.1, 1.2_

- [ ]* 5.3 Write component tests for UsageCostBadge
  - Test cost display formatting and updates
  - Test click handling and dialog triggering
  - Test responsive behavior and styling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6. Implement UsageAnalyticsDialog for detailed analytics display
  - Create comprehensive analytics dialog with filtering capabilities
  - Implement time-based filtering (Today, 7d, 30d, 90d)
  - Add model-based filtering with multi-select functionality
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6.1 Create UsageAnalyticsDialog component structure
  - Implement modal dialog using existing UI patterns
  - Create layout for analytics display with filter controls
  - Add loading states and error handling UI
  - _Requirements: 3.1, 3.2_

- [x] 6.2 Implement time-based filtering functionality
  - Add filter buttons for Today, 7d, 30d, 90d time ranges
  - Implement date range calculations and data filtering
  - Update analytics display when time filters are applied
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6.3 Implement model-based filtering functionality
  - Create multi-select dropdown for model filtering
  - Implement model-specific analytics calculations
  - Add model breakdown display with costs and task counts
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6.4 Add analytics data visualization
  - Display total cost, task count, and token usage statistics
  - Implement breakdown by model and task type
  - Add data export functionality for user data management
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 5.5, 6.5_

- [ ]* 6.5 Write component tests for analytics dialog
  - Test dialog opening and closing behavior
  - Test filtering functionality and data updates
  - Test data visualization and export features
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 5.1_

- [x] 7. Wire up complete cost analytics system
  - Connect all components and services together
  - Ensure data flows correctly from usage capture to UI display
  - Test end-to-end functionality across all features
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7.1 Initialize cost analytics system on app startup
  - Load existing usage data from IndexedDB on application start
  - Initialize Zustand store with current total cost
  - Set up automatic usage tracking for all AI services
  - _Requirements: 1.3, 6.2, 6.3_

- [x] 7.2 Test complete system integration
  - Verify usage tracking works across all AI features (chat, translate, etc.)
  - Test badge updates in real-time when new usage is recorded
  - Verify analytics dialog displays accurate filtered data
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 7.3 Write end-to-end integration tests
  - Test complete user workflow from usage generation to analytics viewing
  - Test data persistence across browser sessions
  - Test system performance with large usage datasets
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_