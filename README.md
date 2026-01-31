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
   linq phonenumbers
   ```

3. **Send a message**:

   ```bash
   linq send --to +19876543210 --from +12025551234 --message "Hello from Linq!"
   ```

## Commands

### `linq login`

Authenticate with Linq and save your API token. Get your token from [Integration Details](https://zero.linqapp.com/api-tooling/) in the Linq dashboard.

```bash
# Interactive prompt
linq login

# Or provide token directly
linq login --token YOUR_API_TOKEN
```

Your token is saved to `~/.linq/config.json`.

### `linq config get|set`

Manage configuration values.

```bash
# View current token (masked)
linq config get

# Set a new token
linq config set token YOUR_API_TOKEN
```

### `linq send`

Send a message to a phone number.

```bash
linq send --to +19876543210 --from +12025551234 --message "Hello!"

# With iMessage effects
linq send --to +19876543210 --from +12025551234 --message "Party time!" --effect confetti
```

**Flags:**
- `--to` (required): Recipient phone number in E.164 format
- `--from` (required): Sender phone number in E.164 format
- `--message`, `-m` (required): Message text
- `--effect`: iMessage effect (confetti, fireworks, lasers, balloons, etc.)
- `--token`, `-t`: Override stored API token

### `linq phonenumbers`

List your available phone numbers.

```bash
linq phonenumbers
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

## License

Apache-2.0
