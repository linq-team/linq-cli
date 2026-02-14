# Copilot Instructions

## Project Context

Linq CLI is an open source CLI for the Linq messaging API (iMessage, SMS). Built with oclif, TypeScript, ESM (`"type": "module"`).

## Code Review Guidelines

When reviewing pull requests, check for:

### Security (Critical)
- No hardcoded secrets, API tokens, passwords, or PII — this is a public OSS project
- No command injection, XSS, or other OWASP vulnerabilities
- Sensitive values must come from config (`~/.linq/config.json`) or environment variables

### Architecture
- API types are auto-generated from `openapi.yaml` — never edit `src/gen/api-types.ts` by hand
- Commands follow the pattern: parse flags → `loadConfig()` → `requireToken()` → `createApiClient()` → API call → format output
- All human-readable output goes through formatter functions in `src/lib/format.ts`
- Error handling uses `parseApiError()` from `src/lib/errors.ts`
- Commands use space as topic separator (e.g., `linq chats create`), not colons

### Code Quality
- Keep it simple — avoid over-engineering and unnecessary abstractions
- TypeScript strict mode is enabled
- ESLint and Prettier are configured — flag style issues
- Prefer editing existing files over creating new ones

### Testing
- Tests must be present for new functionality
- Tests use vitest with `vi.stubGlobal('fetch', mockFetch)` for HTTP mocking
- Config isolation: temp dir via `fs.mkdtemp()`, override `process.env.HOME`
- Mocks should be realistic — don't mock things unnecessarily

### Documentation
- README.md must stay in sync with code changes
- Keep docs simple, clear, and concise

### Git Conventions
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
- No AI attribution in commits, PRs, or code comments
