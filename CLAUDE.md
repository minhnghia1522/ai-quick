# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Code Translator - A Next.js 15 application for code and language translation powered by OpenAI and Google AI models. Features include code translation, language translation, prompt enhancement, data generation, and PDF chat with RAG capabilities.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Architecture

### State Management Architecture

The app uses **Zustand** with a slice pattern for modular state management:

- **Store Location**: `src/store/index.ts`
- **Store Pattern**: Multiple slices combined into a single store
- **Existing Slices**:
  - `ApiKeySlice`: Manages OpenAI and Gemini API keys
  - `UsageCostSlice`: Tracks token usage and cost analytics

When adding new state, create a new slice file following the pattern in `src/store/ApiKeySlice.ts` or `src/store/UsageCostSlice.ts`, then integrate it into `src/store/index.ts`.

### AI Service Integration Pattern

All AI service calls follow a consistent pattern with automatic cost tracking:

1. **Service Layer** (`src/service/`):
   - `translateService.ts`: Handles translation with `modelCallWithText()` and `modelCallWithStreaming()`
   - `chatService.ts`: Manages PDF chat with RAG using `chatPdfService()`
   - `embeddingService.ts`: Generates embeddings for semantic search

2. **Cost Tracking Interceptor**:
   - Location: `src/service/costTrackingInterceptor.ts`
   - Automatically captures token usage from AI SDK responses
   - Integrated via `onFinish` callback in `streamText()` or after `generateText()`
   - Task types: `'chat' | 'translate' | 'enhance-prompt' | 'generate-data'`

3. **Provider Management**:
   - Location: `src/utils/getProvider.ts`
   - Dynamically selects OpenAI or Google provider based on model name
   - Uses API keys from localStorage via `STORAGE_KEY_OPENAI_API_KEY` and `STORAGE_KEY_GEMINI_API_KEY`

### Data Persistence Pattern

The app uses **IndexedDB** via the `idb` library for client-side persistence:

- **Pattern**: Each domain has its own database class in `src/lib/database/`
- **Existing Databases**:
  - `chatHistoryDB.ts`: Stores chat conversation history
  - `fileDataDB.ts`: Stores PDF embeddings for RAG
  - `usageCostDB.ts`: Stores token usage records for analytics

Each database class follows this pattern:
- Define a DBSchema interface
- Create a store class with async `getDB()` method
- Implement CRUD operations and queries with indexes
- Export singleton instance

### AI Model Configuration

Model definitions in `src/types/model.ts`:

```typescript
interface ModelAI {
  id: number;
  model: string;        // Model identifier for provider
  name: string;         // Display name
  description: string;
  reasoningEffort?: string;  // For reasoning models
  temperature?: number;
  priceInput: number;   // Cost per 1M input tokens
  priceOutput: number;  // Cost per 1M output tokens
}
```

**Important**: Cost tracking relies on accurate `priceInput` and `priceOutput` values in model definitions.

### Component Architecture

- **UI Components**: Uses shadcn/ui components in `src/components/ui/`
- **Feature Components**: Domain-specific components in `src/components/`
- **Layout Pattern**: Follows Next.js App Router with route groups like `(translate)`
- **Styling**: Tailwind CSS with `cn()` utility from `src/lib/utils.ts`

### Internationalization (i18n)

- **Library**: next-intl
- **Config**: `src/i18n/config.ts`
- **Supported Locales**: English (`en`), Vietnamese (`vi`), Japanese (`ja`)
- **Messages**: JSON files in `public/messages/[locale]/` (not included in repo, generated at build)
- **Storage**: Selected locale stored in localStorage via `STORAGE_KEY_LOCALE`

### RAG (Retrieval-Augmented Generation) Pattern

PDF chat feature uses a custom RAG implementation:

1. **PDF Processing**: Extract text and chunk by pages
2. **Embedding Generation**: `embeddingService.ts` generates embeddings via AI SDK
3. **Storage**: Embeddings stored in `fileDataDB.ts` with semantic search support
4. **Retrieval**: `findRelevantContent()` in `chatService.ts` uses cosine similarity
5. **Tool Integration**: LLM uses `getInformation` tool to query knowledge base

## Key Files to Know

- `src/app/layoutClient.tsx`: Main layout with header, sidebar, and usage analytics initialization
- `src/components/AppHeader.tsx`: Header with locale switcher and usage cost badge
- `src/prompt/`: System prompts for different AI tasks
- `src/types/model.ts`: Model definitions with pricing information
- `src/store/index.ts`: Central state management

## Feature-Specific Notes

### Cost Analytics Feature

Recently implemented comprehensive cost tracking system:

- **Badge Component**: `src/components/UsageCostBadge.tsx` - displays total cost in header
- **Analytics Dialog**: `src/components/UsageAnalyticsDialog.tsx` - detailed usage breakdown
- **Initialization**: `src/hooks/useCostAnalyticsInit.ts` - loads initial cost data
- **Service Layer**: `src/service/usageCostService.ts` - business logic for cost calculations
- **Interceptor**: Automatically tracks all AI interactions via `costTrackingInterceptor`

Filtering capabilities:
- Time ranges: today, 7 days, 30 days, 90 days
- Model-based filtering
- Task type filtering

### Translation History

Translation results can be stored in localStorage for quick access. See `src/components/TranslationHistory.tsx` for implementation pattern.

## Coding Conventions

**File Naming**:
- React components: PascalCase (`UserProfile.tsx`)
- Utilities/hooks: camelCase (`useCustomChat.ts`)
- Pages: lowercase with hyphens (`chat-with-pdf/`)

**Code Style**:
- 2 spaces indentation
- Single quotes for strings
- Semicolons required
- 120 character line limit

**Import Organization**:
- External libraries first
- Internal imports: components, hooks, utils, types
- Use `@/*` path alias for internal imports

**Commit Messages**:
Follow conventional commit format: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`

## Git Workflow

- **Main Branch**: `main`
- **Development Branch**: `develop`
- Target `develop` for new features
- Ensure linting passes before committing

## Important Implementation Notes

1. **Always integrate cost tracking** when adding new AI service calls using the `costTrackingInterceptor` pattern
2. **Model selection** is stored in localStorage via `STORAGE_KEY_MODEL`
3. **API keys** are managed per provider (OpenAI, Gemini) in localStorage
4. **Client-side only**: All AI calls happen in the browser, no server API routes
5. **Error handling**: Services should throw errors to be caught by UI components
6. When adding new database stores, follow the IndexedDB pattern with proper schema and indexes
7. For new AI features, define the task type in `costTrackingInterceptor.ts` for proper cost attribution
