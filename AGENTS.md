# Repository Guidelines

## Project Structure & Module Organization
- Next.js App Router lives in `src/app` with feature routes like `(translate)`, `chat-with-pdf`, `enhance-prompt`, and `generate-data`.
- Shared UI is in `src/components`; hooks in `src/hooks`; utilities in `src/lib` and `src/utils`; Zustand state in `src/store`.
- Types live in `src/types`; i18n config in `src/i18n`; static assets in `public` (images, `messages/{en,ja,vi}`).
- Use the `@/*` alias for internal imports to keep paths short and consistent.

## Build, Test, and Development Commands
- `npm run dev` starts the Next.js dev server with Turbopack.
- `npm run build` creates the production bundle.
- `npm run start` serves the built app locally.
- `npm run lint` runs ESLint and is required before PRs.
- `npm run build:analyze` (optional) inspects bundle composition.

## Coding Style & Naming Conventions
- TypeScript/React with 2-space indents, single quotes, semicolons, no trailing commas, 120-character max line length.
- Components use PascalCase (`UserProfile.tsx`); hooks/utilities use camelCase (`useLocalStorage.ts`);
  pages use kebab-case directories; types use PascalCase interfaces.
- Import order: external packages first, then internal modules grouped by components, hooks, utils, types.
- Tailwind + Radix UI for styling; keep class names readable and extract repeated values into helpers.

## Testing Guidelines
- No dedicated test runner is bundled yet; run `npm run lint` as the baseline regression check.
- Add tests for business logic or API integrations under `src/**/__tests__` or next to the module.
- For UI flows, prefer integration tests (React Testing Library/Playwright) and mock external AI/PDF calls.

## Commit & Pull Request Guidelines
- Git history follows conventional commits, e.g., `feat: implement daily cost tracking` or `fix: correct OpenAI model invocation`.
- Target the `develop` branch for new features, and ensure `npm run lint` passes before opening a PR.
- PRs should include a concise summary, linked issues where applicable, and screenshots/clips for visible UI changes.
- Keep diffs focused; separate refactors from feature work.

## Architecture Overview & Safety
- Stack: Next.js 15/16, React 19, TypeScript, Zustand, Tailwind, Radix UI, CodeMirror, next-intl, OpenAI/Google SDKs.
- Store secrets in environment variables; never commit `.env` files. Rotate keys if exposed.
