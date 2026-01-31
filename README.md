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

3. **Create a chat and send a message**:

   ```bash
   linq chats create --to +19876543210 --from +12025551234 --message "Hello from Linq!"
   ```

## Commands

### Authentication

#### `linq login`

Authenticate with Linq and save your API token. Get your token from [Integration Details](https://zero.linqapp.com/api-tooling/) in the Linq dashboard.

```bash
# Interactive prompt
linq login

# Or provide token directly
linq login --token YOUR_API_TOKEN
```

Your token is saved to `~/.linq/config.json`.

#### `linq config get|set`

Manage configuration values.

```bash
# View current token (masked)
linq config get

# Set a new token
linq config set token YOUR_API_TOKEN
```

### Phone Numbers

#### `linq phonenumbers`

List your available phone numbers.

```bash
linq phonenumbers
```

### Chats

#### `linq chats create`

Create a new chat and send an initial message.

```bash
# Send to a single recipient
linq chats create --to +19876543210 --from +12025551234 --message "Hello!"

# Send to multiple recipients (group chat)
linq chats create --to +1111111111 --to +2222222222 --from +12025551234 --message "Group chat"

# With iMessage effects
linq chats create --to +19876543210 --from +12025551234 --message "Party!" --effect confetti
```

**Flags:**
- `--to` (required): Recipient phone number or email. Can be specified multiple times for group chats.
- `--from` (required): Sender phone number (E.164 format)
- `--message`, `-m` (required): Message text
- `--effect`: iMessage effect (confetti, fireworks, lasers, balloons, etc.)
- `--token`, `-t`: Override stored API token
- `--json`: Output response as JSON

#### `linq chats list`

List chats for a phone number.

```bash
linq chats list +12025551234
linq chats list +12025551234 --limit 50
```

**Flags:**
- `--limit`: Maximum number of chats to return (default: 20)
- `--cursor`: Pagination cursor from previous response
- `--token`, `-t`: Override stored API token
- `--json`: Output response as JSON

#### `linq chats get`

Get details of a specific chat.

```bash
linq chats get CHAT_ID
```

### Messages

#### `linq messages send`

Send a message to an existing chat.

```bash
linq messages send CHAT_ID --from +12025551234 --message "Hello!"
linq messages send CHAT_ID --from +12025551234 --message "Surprise!" --effect fireworks
```

**Flags:**
- `--from` (required): Sender phone number (E.164 format)
- `--message`, `-m` (required): Message text
- `--effect`: iMessage effect
- `--token`, `-t`: Override stored API token
- `--json`: Output response as JSON

#### `linq messages list`

List messages in a chat.

```bash
linq messages list CHAT_ID
linq messages list CHAT_ID --limit 50
linq messages list CHAT_ID --order asc
```

**Flags:**
- `--limit`: Maximum number of messages to return (default: 20, max: 100)
- `--cursor`: Pagination cursor from previous response
- `--order`: Sort order (asc or desc, default: desc)
- `--token`, `-t`: Override stored API token
- `--json`: Output response as JSON

#### `linq messages get`

Get a specific message by ID.

```bash
linq messages get MESSAGE_ID
```

#### `linq messages delete`

Delete a message.

```bash
linq messages delete MESSAGE_ID --chat CHAT_ID
```

**Flags:**
- `--chat` (required): Chat ID the message belongs to

#### `linq messages react`

Add or remove a reaction on a message.

```bash
# Add a reaction
linq messages react MESSAGE_ID --operation add --type heart

# Remove a reaction
linq messages react MESSAGE_ID --operation remove --type thumbs_up
```

**Flags:**
- `--operation` (required): Operation to perform (add or remove)
- `--type` (required): Reaction type (heart, thumbs_up, thumbs_down, ha_ha, exclamation, question)

### Webhooks

#### `linq webhooks create`

Create a new webhook subscription.

```bash
linq webhooks create --url https://example.com/webhook --events message.received,message.sent
```

**Flags:**
- `--url` (required): Target URL for webhook events
- `--events` (required): Comma-separated list of events to subscribe to

Available events: message.sent, message.received, message.read, message.delivered, message.failed, reaction.added, reaction.removed, participant.added, participant.removed, chat.created, chat.group_name_updated, chat.group_icon_updated, chat.typing_indicator.started, chat.typing_indicator.stopped

#### `linq webhooks list`

List all webhook subscriptions.

```bash
linq webhooks list
```

#### `linq webhooks get`

Get details of a specific webhook subscription.

```bash
linq webhooks get SUBSCRIPTION_ID
```

#### `linq webhooks update`

Update a webhook subscription.

```bash
# Update URL
linq webhooks update SUBSCRIPTION_ID --url https://new-url.com/webhook

# Update events
linq webhooks update SUBSCRIPTION_ID --events message.received,message.sent

# Activate/deactivate
linq webhooks update SUBSCRIPTION_ID --activate
linq webhooks update SUBSCRIPTION_ID --deactivate
```

#### `linq webhooks delete`

Delete a webhook subscription.

```bash
linq webhooks delete SUBSCRIPTION_ID
```

### Local Development

#### `linq listen`

Start a local webhook server to receive incoming messages (for development).

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
