<!--
SYNC IMPACT REPORT
Version Change: 0.0.0 -> 1.0.0 (Initial Ratification)
Modified Principles: N/A (Initial Definition)
Added Sections: All principles derived from AGENTS.md and project context.
Templates Requiring Updates: ✅ None (Templates reference constitution generically).
Follow-up TODOs: None.
-->

# ai-code-translator Constitution

## Core Principles

### I. Conventions & Structure
Adherence to existing project conventions is mandatory. Analyze surrounding code, file structure, and configuration before modifying. Use the Next.js App Router in `src/app`, shared UI in `src/components`, and strict path aliases (`@/*`). Feature-based folder organization is required.

### II. Modern Tech Stack
The stack is non-negotiable: Next.js 15/16, React 19, TypeScript, Tailwind CSS, Radix UI, and Zustand. Do not introduce new libraries without verifying they match this established stack. Avoid inline styles; use Tailwind utility classes.

### III. Security First
Never commit secrets, API keys, or `.env` files. Secrets must be stored in environment variables. All file system operations must be validated. Destructive commands require clear explanation and user confirmation.

### IV. Code Quality & Linting
Linting (`npm run lint`) is the absolute minimum quality gate and must pass before any PR. TypeScript strict mode is enforced. Naming must follow conventions: PascalCase for components/types, camelCase for hooks/utils.

### V. Testing & Verification
Business logic and API integrations require tests (placed in `src/**/__tests__`). UI flows favor integration-style tests. No PR is mergeable without passing the project's linting and build checks (`npm run build`).

## Governance

### Amendment Process
This Constitution supersedes other documentation in case of conflict. Amendments require a PR with a "governance:" type commit, updated version number, and Sync Impact Report.

### Versioning Policy
Follows Semantic Versioning (MAJOR.MINOR.PATCH).
- MAJOR: Removal or redefinition of a core principle.
- MINOR: Addition of new principles or significant guidance.
- PATCH: Clarifications, typos, or non-material refinements.

### Compliance
All Pull Requests must verify compliance with these principles. Code reviews explicitly check for "Conventions & Structure" and "Security First" violations.

**Version**: 1.0.0 | **Ratified**: 2026-01-15 | **Last Amended**: 2026-01-15
