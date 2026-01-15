# Data Model: Show Daily and Monthly Usage Cost

## Entities

### UsageRecord (Existing)
*Source: `src/types/usage.ts`*
- `id`: string
- `timestamp`: Date
- `modelName`: string
- `inputTokens`: number
- `outputTokens`: number
- `inputCost`: number
- `outputCost`: number
- `totalCost`: number
- `taskType`: 'chat' | 'translate' | 'enhance-prompt' | 'generate-data'

## Aggregation Models (New)

### PeriodCost
*Used for returning calculated costs*
- `daily`: number (Cost for current day starting 00:00:00 local time)
- `monthly`: number (Cost for current month starting 1st 00:00:00)
