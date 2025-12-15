# Repository Guidelines

## Project Structure & Module Organization
- Next.js App Router in `src/app` with feature routes: `(translate)`, `chat-with-pdf`, `enhance-prompt`, `generate-data`.
- Shared UI lives in `src/components`, hooks in `src/hooks`, and utilities in `src/lib` and `src/utils`; state is in `src/store` (Zustand).
- Types sit in `src/types`; i18n config in `src/i18n`; static assets in `public` (images, `messages/{en,ja,vi}`).
- Follow the `@/*` path alias for internal imports to keep paths short and consistent.

## Build, Test, and Development Commands
- `npm run dev` – start the Next.js dev server with Turbopack.
- `npm run build` – production build; use before shipping changes.
- `npm run start` – serve the built app locally.
- `npm run lint` – run ESLint with the project rules; required before PRs.
- Optional: `npm run build:analyze` to inspect bundle composition.

## Coding Style & Naming Conventions
- TypeScript/React with 2-space indents, single quotes, semicolons, no trailing commas, and a 120-character line limit.
- File naming: components in PascalCase (`UserProfile.tsx`), hooks/utilities in camelCase (`useLocalStorage.ts`), pages in kebab-case directories, types in PascalCase interfaces.
- Import order: external packages first, then internal modules grouped by components, hooks, utils, types; prefer `@/*` aliases.
- Tailwind + Radix UI for styling; keep class names readable and avoid inline magic values—extract helpers when reused.

## Testing Guidelines
- No dedicated test runner is bundled yet; at minimum, run `npm run lint` to guard for regressions.
- Add tests when introducing business logic or API integrations; place them near the code under `src/**/__tests__` or a co-located pattern that keeps imports simple.
- For UI flows, favor integration-style tests (e.g., React Testing Library/Playwright) if added—mock external AI/PDF calls.

## Commit & Pull Request Guidelines
- Commit messages follow conventional commits, e.g., `feat: add translation history feature with local storage support` or `fix: handle pdf parsing errors`.
- Target the `develop` branch for new features; ensure `npm run lint` passes before opening a PR.
- PRs should include a brief summary, linked issues when applicable, and screenshots or short clips for visible UI changes.
- Keep diffs focused; separate refactors from feature work when possible to ease review.

## Architecture Overview & Safety
- Stack: Next.js 15/16, React 19, TypeScript, Zustand for state, Tailwind + Radix UI for styling, CodeMirror for editing, next-intl for i18n, AI providers via OpenAI/Google SDKs.
- Store secrets in environment variables; never commit credentials or `.env` files. Rotate keys if they leak.
