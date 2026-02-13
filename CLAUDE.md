# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Linq CLI — open source command-line interface for the [Linq](https://linqapp.com) messaging API (iMessage, SMS). Built with [oclif](https://oclif.io/) framework, TypeScript, ESM (`"type": "module"`). Monorepo with npm workspaces — the CLI dogfoods `@linqapp/sdk` (in `packages/sdk/`), a TypeScript SDK auto-generated from `openapi.yaml` via Speakeasy.

## Commands

```bash
npm run build          # Compile TypeScript
npm test               # Run all tests (vitest)
npm run test:watch     # Run tests in watch mode
npx vitest run test/commands/chats/create.test.ts  # Run a single test file
npm run lint           # ESLint
npm run lint:fix       # ESLint with auto-fix
npm run format         # Prettier
npm run generate:sdk   # Regenerate @linqapp/sdk from openapi.yaml (requires Speakeasy CLI)
./bin/dev.js           # Run CLI in dev mode (no build needed)
```

## Architecture

**SDK** (`packages/sdk/`): Auto-generated TypeScript SDK from `openapi.yaml` via Speakeasy. Regenerate with `npm run generate:sdk`. Never edit SDK files by hand. Check `packages/sdk/src/models/` for exact request/response types.

**API client** (`src/lib/api-client.ts`): Creates an SDK instance via `createLinqClient(token)` which returns a `Linq` client with namespaced methods (e.g., `client.chats.createChat(...)`, `client.messages.sendMessageToChat(...)`).

**Config** (`src/lib/config.ts`): Multi-profile config stored at `~/.linq/config.json`. Supports profiles (like AWS CLI), env var overrides (`LINQ_TOKEN`, `LINQ_FROM_PHONE`, `LINQ_PROFILE`). Tests override `process.env.HOME` to a temp dir.

**Command pattern**: Every command follows the same structure:
1. Parse flags → `loadConfig(flags.profile)` → `requireToken(flags.token, config)` → `createLinqClient(token)`
2. Call SDK method in a `try/catch`, use `parseApiError(err)` on failure
3. Output via formatter (`src/lib/format.ts`) or `--json` for raw JSON

**Formatters** (`src/lib/format.ts`): All human-readable output goes through dedicated format functions. Uses chalk for colors.

**Error handling** (`src/lib/errors.ts`): `parseApiError()` handles SDK's `ErrorResponse` type and other error shapes.

**Commands use oclif topic separator as space** (not colon) — e.g., `linq chats create`, not `linq chats:create`. File paths determine command hierarchy: `src/commands/chats/create.ts` → `linq chats create`.

## Testing

- **Framework**: vitest with globals enabled
- **HTTP mocking**: `vi.stubGlobal('fetch', mockFetch)` — mock the global fetch, create responses with `new Response(JSON.stringify(body), { status, headers })`
- **Config isolation**: Create a temp dir via `fs.mkdtemp()`, set `process.env.HOME` to it, write a test config file, restore in `afterEach`
- **Command instantiation**: `new Cmd(argv, await Config.load({ root: process.cwd() }))`
- **Module mocking** (e.g., `@inquirer/prompts`): Use `vi.mock()` then dynamic `await import()`

## Git Conventions

- **Conventional Commits** enforced by commitlint via lefthook pre-commit hook: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
- **No AI attribution** in commits, PRs, or code comments
- Pre-commit hooks also run lint and typecheck in parallel

## Key Constraints

- Node.js >=22, npm >=10
- This is a **public open source project** — never include secrets, PII, or proprietary information of any kind
- Keep README.md in sync with code changes
- SDK uses camelCase property names (e.g., `phoneNumbers`, `displayName`) — always verify against `packages/sdk/src/models/`
- SDK validates response schemas with Zod — test mocks must include all required fields with correct status codes