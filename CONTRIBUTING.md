# Contributing to Linq CLI

Thank you for your interest in contributing to the Linq CLI! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building something together.

## Getting Started

### Prerequisites

- Node.js 22 or higher (LTS)
- npm (comes with Node.js)

### Setup

```bash
# Clone the repository
git clone https://github.com/linq-team/linq-cli.git
cd linq-cli

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
./bin/dev.js --help
```

### Development Scripts

```bash
npm run build        # Generate types from OpenAPI spec + compile TypeScript
npm test         # Run tests
npm test:watch   # Run tests in watch mode
npm run lint         # Lint code
npm run format       # Format code
npm run generate:types  # Regenerate API types from OpenAPI spec
```

## Making Changes

### Branching

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug in webhooks"
   git commit -m "docs: update README"
   ```

### Commit Message Format

We use Conventional Commits for semantic versioning:

- `feat:` - New features (minor version bump)
- `fix:` - Bug fixes (patch version bump)
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests

### Code Style

- TypeScript strict mode is enabled
- ESLint and Prettier are configured
- Run `npm run lint` and `npm run format` before committing
- Pre-commit hooks will run automatically via lefthook

### Testing

- Write tests for new features
- Ensure all tests pass: `npm test`
- Tests are located in `test/commands/`

## Project Structure

```
linq-cli/
├── src/
│   ├── commands/       # CLI commands (oclif structure)
│   │   ├── chats/
│   │   ├── config/
│   │   ├── messages/
│   │   └── webhooks/
│   ├── gen/            # Generated types (do not edit)
│   └── lib/            # Shared utilities
├── test/               # Test files
├── openapi.yaml        # API specification
└── bin/                # CLI entry points
```

## Adding a New Command

1. Create a new file in `src/commands/` following the oclif structure
2. Use the existing commands as templates
3. Add tests in `test/commands/`
4. Update README.md if needed

Example command structure:

```typescript
import { Command, Flags } from '@oclif/core';
import { loadConfig, requireToken } from '../../lib/config.js';
import { createApiClient } from '../../lib/api-client.js';

export default class MyCommand extends Command {
  static override description = 'Description of the command';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --flag value',
  ];

  static override flags = {
    profile: Flags.string({
      char: 'p',
      description: 'Config profile to use',
    }),
    token: Flags.string({
      char: 't',
      description: 'API token (overrides stored token)',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(MyCommand);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    // Your implementation here

    this.log(JSON.stringify(data, null, 2));
  }
}
```

## Updating the API

When the Linq API changes:

1. Update `openapi.yaml` with the new specification
2. Run `npm run generate:types` to regenerate TypeScript types
3. Update affected commands
4. Add/update tests

## Pull Requests

1. Ensure your branch is up to date with `main`
2. Run all checks locally:
   ```bash
   npm run build && npm test && npm run lint
   ```
3. Push your branch and open a PR
4. Fill out the PR template with a clear description
5. Link any related issues

## Reporting Issues

When reporting issues, please include:

- CLI version (`linq --version`)
- Node.js version (`node --version`)
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Any error messages

## Questions?

Open an issue or discussion on GitHub. We're happy to help!
