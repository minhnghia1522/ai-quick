# Repository Guidelines

## Project Structure & Module Organization

This is an AI Code Translator built with Next.js 15, React 19, and TypeScript. The project follows Next.js App Router conventions:

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── (translate)/        # Translation feature routes
│   ├── chat-with-pdf/      # PDF chat functionality
│   ├── enhance-prompt/     # Prompt enhancement tools
│   └── generate-data/      # Data generation utilities
├── components/             # Reusable React components
├── hooks/                  # Custom React hooks
├── i18n/                   # Internationalization setup
├── lib/                    # Utility libraries and configurations
├── service/                # API service layers
├── store/                  # State management (Zustand)
├── types/                  # TypeScript type definitions
└── utils/                  # Helper functions
public/
├── images/                 # Static images and assets
└── messages/               # i18n translation files (en, ja, vi)
```

## Build, Test, and Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Coding Style & Naming Conventions

**Code Formatting:**
- 2 spaces for indentation (no tabs)
- Single quotes for strings and JSX
- Semicolons required
- 120 character line limit
- Trailing commas omitted

**File Naming:**
- React components: PascalCase (`UserProfile.tsx`)
- Utilities/hooks: camelCase (`useLocalStorage.ts`)
- Pages: lowercase with hyphens (`chat-with-pdf/`)
- Types: PascalCase interfaces (`ModelAI`, `TranslationHistory`)

**Import Organization:**
- External libraries first
- Internal imports grouped by: components, hooks, utils, types
- Use `@/*` path alias for internal imports

## Commit & Pull Request Guidelines

**Commit Message Format:**
Follow the conventional commit pattern observed in the project:
```
feat: add translation history feature with local storage support
feat: increase maximum text length to 25000 for translation input
feat: update GPT-5 model identifiers and comment out temperature property
```

**Commit Types:**
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `style:` - Formatting changes
- `docs:` - Documentation updates

**Pull Request Requirements:**
- Target the `develop` branch for new features
- Include descriptive title and summary
- Reference related issues when applicable
- Ensure all linting passes (`npm run lint`)
- Test locally before submitting

## Architecture Overview

The application uses:
- **AI Integration:** OpenAI and Google AI SDK for translation services
- **State Management:** Zustand for client-side state
- **Styling:** Tailwind CSS with Radix UI components
- **Internationalization:** next-intl with support for English, Japanese, and Vietnamese
- **Code Editor:** CodeMirror with syntax highlighting