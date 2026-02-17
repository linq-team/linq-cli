# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Linq CLI — open source command-line interface for the [Linq](https://linqapp.com) messaging API (iMessage, SMS). Built with [oclif](https://oclif.io/) framework, TypeScript, ESM (`"type": "module"`).

## Commands

```bash
npm run build          # Compile TypeScript
npm test               # Run all tests (vitest)
npm run test:watch     # Run tests in watch mode
npx vitest run test/commands/chats/create.test.ts  # Run a single test file
npm run lint           # ESLint
npm run lint:fix       # ESLint with auto-fix
npm run format         # Prettier
./bin/dev.js           # Run CLI in dev mode (no build needed)
```

## Architecture

**API client** (`src/lib/api-client.ts`): Uses `@linqapp/sdk` for type-safe API calls. Created via `createApiClient(token)` which returns a `Linq` client instance with namespaced methods (e.g., `client.chats.create(...)`, `client.messages.send(...)`, `client.webhooks.create(...)`). SDK types are accessed via `Linq.Chats.ChatCreateParams`, `Linq.Messages.MessageSendParams`, etc.

**Config** (`src/lib/config.ts`): Multi-profile config stored at `~/.linq/config.json`. Supports profiles (like AWS CLI), env var overrides (`LINQ_TOKEN`, `LINQ_FROM_PHONE`, `LINQ_PROFILE`). Tests override `process.env.HOME` to a temp dir.

**Command pattern**: Every command follows the same structure:
1. Parse flags → `loadConfig(flags.profile)` → `requireToken(flags.token, config)` → `createApiClient(token)`
2. Make SDK call in a try/catch block
3. Output via formatter (`src/lib/format.ts`) or `--json` for raw JSON

**Formatters** (`src/lib/format.ts`): All human-readable output goes through dedicated format functions. Uses chalk for colors.

**Error handling**: SDK throws errors on failure. Commands catch errors in try/catch and use `e.message` for display.

**Commands use oclif topic separator as space** (not colon) — e.g., `linq chats create`, not `linq chats:create`. File paths determine command hierarchy: `src/commands/chats/create.ts` → `linq chats create`.

## Testing

- **Framework**: vitest with globals enabled
- **HTTP mocking**: `vi.stubGlobal('fetch', mockFetch)` — mock the global fetch. SDK validates responses with Zod, so mocks must include all required fields
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
- API types come from `@linqapp/sdk` — check SDK types (e.g., `Linq.Chats`, `Linq.Messages`) for request/response shapes