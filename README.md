# Linq CLI

A command-line interface for the [Linq](https://linqapp.com) messaging API. Send and receive iMessages programmatically.

## Installation

```bash
npm install -g linq-cli
```

Or use directly with npx:

```bash
npx linq-cli login
```

## Quick Start

1. **Authenticate** with your Linq API token:

   ```bash
   linq login
   ```

2. **List your phone numbers**:

   ```bash
   linq numbers list
   ```

3. **Send a message**:

   ```bash
   linq send --to +19876543210 --from +12025551234 --message "Hello from Linq!"
   ```

## Commands

### `linq login`

Authenticate with Linq and save your API token.

```bash
# Interactive prompt
linq login

# Or provide token directly
linq login --token YOUR_API_TOKEN
```

Your token is saved to `~/.linq/config.json`.

### `linq send`

Send a message to a phone number.

```bash
linq send --to +19876543210 --from +12025551234 --message "Hello!"

# With iMessage effects
linq send --to +19876543210 --from +12025551234 --message "Party time!" --effect confetti
```

**Flags:**
- `--to` (required): Recipient phone number in E.164 format
- `--from`: Sender phone number (uses default if set in config)
- `--message`, `-m` (required): Message text
- `--effect`: iMessage effect (confetti, fireworks, lasers, balloons, etc.)
- `--token`, `-t`: Override stored API token

### `linq numbers list`

List your available phone numbers.

```bash
linq numbers list
```

### `linq listen`

Start a local webhook server to receive incoming messages.

```bash
# Default port 4040
linq listen

# Custom port
linq listen --port 8080

# Output as JSON
linq listen --json

# Filter by event type
linq listen --events message.received,message.delivered
```

**Flags:**
- `--port`, `-p`: Local port to listen on (default: 4040)
- `--json`: Output events as JSON lines
- `--events`: Comma-separated list of event types to filter

## Environment Variables

- `LINQ_TOKEN`: API token (overrides config file)

## Development

### Prerequisites

- Node.js 22 or higher (LTS)
- pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/linq-team/linq-cli.git
cd linq-cli

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run in development mode
./bin/dev.js login
```

### Scripts

```bash
# Build (generates types from OpenAPI spec + compiles TypeScript)
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint code
pnpm lint

# Format code
pnpm format

# Generate API types from OpenAPI spec
pnpm generate:types
```

### Project Structure

```
linq-cli/
├── bin/
│   ├── run.js          # Production entry point
│   └── dev.js          # Development entry point
├── src/
│   ├── commands/       # oclif commands
│   │   ├── login.ts
│   │   ├── send.ts
│   │   ├── listen.ts
│   │   └── numbers/
│   │       └── list.ts
│   ├── gen/                # Generated (do not edit)
│   │   └── api-types.ts    # Generated from OpenAPI spec
│   └── lib/
│       ├── api-client.ts   # Type-safe API client
│       └── config.ts       # Config management
├── test/
│   └── commands/       # Command tests
├── openapi.yaml        # Linq Partner API spec
└── package.json
```

## License

Apache-2.0
