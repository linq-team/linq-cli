# Linq CLI

A command-line interface for the [Linq](https://linqapp.com) messaging API. Send and receive iMessages programmatically.

## Installation

### npm (all platforms)

```bash
npm install -g @linqapp/cli
```

Or use directly with npx:

```bash
npx @linqapp/cli login
```

### Native Installers

Download the latest installer for your platform from the [Releases](https://github.com/linq-team/linq-cli/releases) page:

| Platform | File | Install Command |
|----------|------|-----------------|
| **macOS (Intel)** | `linq-*-x64.pkg` | Double-click to install |
| **macOS (Apple Silicon)** | `linq-*-arm64.pkg` | Double-click to install |
| **Windows (x64)** | `linq-*-x64.exe` | Run the installer |
| **Windows (ARM)** | `linq-*-arm64.exe` | Run the installer |
| **Debian/Ubuntu (x64)** | `linq_*_amd64.deb` | `sudo dpkg -i linq_*.deb` |
| **Debian/Ubuntu (ARM)** | `linq_*_arm64.deb` | `sudo dpkg -i linq_*.deb` |

After installation, the `linq` command will be available in your terminal.

## Quick Start

1. **Run the setup wizard**:

   ```bash
   linq init
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

### Setup

#### `linq init`

Interactive setup wizard. Validates your API token, selects a default phone number, and optionally configures ngrok for webhook testing.

```bash
linq init
```

#### `linq doctor`

Check your CLI configuration and API connectivity. Runs 5 diagnostic checks and reports any issues.

```bash
linq doctor
```

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
# View current config
linq config get

# Set your API token
linq config set token YOUR_API_TOKEN

# Set default sender phone (must be one from `linq phonenumbers`)
linq config set fromPhone +12025551234

# Set ngrok auth token
linq config set ngrokAuthtoken YOUR_NGROK_TOKEN
```

#### `linq config list`

List all configuration profiles.

```bash
linq config list
# Output:
# Profiles:
#   default (active)
#   personal
#   work
```

#### `linq config use`

Switch to a different profile.

```bash
linq config use work
```

### Profiles

Profiles work like AWS CLI profiles - switch between different accounts or phone numbers easily.

```bash
# Create a work profile
linq config set token WORK_TOKEN --profile work
linq config set fromPhone +18005551234 --profile work

# Create a personal profile
linq config set token PERSONAL_TOKEN --profile personal
linq config set fromPhone +12025551234 --profile personal

# Switch default profile
linq config use work

# Or use --profile flag with any command
linq chats create --to +19876543210 --message "Hello" --profile personal
```

Environment variables:
- `LINQ_PROFILE` - Override the active profile
- `LINQ_FROM_PHONE` - Override the sender phone number

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
# Send to a single recipient (uses fromPhone from config)
linq chats create --to +19876543210 --message "Hello!"

# Or specify --from explicitly
linq chats create --to +19876543210 --from +12025551234 --message "Hello!"

# Send to multiple recipients (group chat)
linq chats create --to +1111111111 --to +2222222222 --from +12025551234 --message "Group chat"

# With iMessage effects
linq chats create --to +19876543210 --from +12025551234 --message "Party!" --effect confetti
```

**Flags:**
- `--to` (required): Recipient phone number or email. Can be specified multiple times for group chats.
- `--from`: Your sender phone number (must be one from `linq phonenumbers`). Uses config `fromPhone` if not specified.
- `--message`, `-m` (required): Message text
- `--effect`: iMessage effect (confetti, fireworks, lasers, balloons, etc.)
- `--profile`, `-p`: Config profile to use
- `--token`, `-t`: Override stored API token

#### `linq chats list`

List chats for a phone number.

```bash
# Uses fromPhone from config
linq chats list

# Specify phone number explicitly
linq chats list --from +12025551234
linq chats list --from +12025551234 --limit 50
```

**Flags:**
- `--from`: Your phone number to list chats for (must be one from `linq phonenumbers`). Uses config `fromPhone` if not specified.
- `--limit`: Maximum number of chats to return (default: 20, max: 100)
- `--cursor`: Pagination cursor from previous response
- `--profile`, `-p`: Config profile to use
- `--token`, `-t`: Override stored API token

#### `linq chats get`

Get details of a specific chat.

```bash
linq chats get CHAT_ID
```

### Messages

#### `linq messages send`

Send a message to an existing chat.

```bash
# Uses fromPhone from config
linq messages send CHAT_ID --message "Hello!"

# Specify sender explicitly
linq messages send CHAT_ID --from +12025551234 --message "Hello!"

# With iMessage effect
linq messages send CHAT_ID --message "Surprise!" --effect fireworks
```

**Flags:**
- `--from`: Your sender phone number (must be one from `linq phonenumbers`). Uses config `fromPhone` if not specified.
- `--message`, `-m` (required): Message text
- `--effect`: iMessage effect
- `--profile`, `-p`: Config profile to use
- `--token`, `-t`: Override stored API token

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
- `--profile`, `-p`: Config profile to use
- `--token`, `-t`: Override stored API token

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
# Add a reaction (--operation defaults to "add")
linq messages react MESSAGE_ID --type love

# Remove a reaction
linq messages react MESSAGE_ID --operation remove --type like

# Custom emoji reaction
linq messages react MESSAGE_ID --type custom --emoji "🎉"

# React to a specific message part
linq messages react MESSAGE_ID --type laugh --part-index 1
```

**Flags:**
- `--type` (required): Reaction type (love, like, dislike, laugh, emphasize, question, custom)
- `--operation`: Operation to perform — `add` (default) or `remove`
- `--emoji`: Custom emoji (required when type is `custom`)
- `--part-index`: Index of the message part to react to (default: 0)

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

#### `linq webhooks listen`

Start a local server with automatic ngrok tunnel and webhook registration. Creates a temporary webhook subscription that's automatically deleted when you stop.

```bash
# Listen for all events
linq webhooks listen

# Listen for specific events only
linq webhooks listen --events message.received,message.sent

# Output raw JSON instead of structured logs
linq webhooks listen --json
```

**Output Format:**

Events are displayed in a structured log format:

```
2024-01-15T10:30:45.123Z [message.received] message.id=msg_123 message.body="Hello world" message.chat_id=chat_456
```

Use `--json` for raw JSON output (useful for piping to `jq`).

## Testing Webhooks

This guide walks you through setting up webhook testing from scratch.

### 1. Get Your ngrok Auth Token

1. Create a free account at [ngrok.com](https://ngrok.com)
2. Go to [Your Authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Copy your auth token

### 2. Configure the CLI

```bash
# Log in with your Linq API token
linq login

# Set your ngrok auth token
linq config set ngrokAuthtoken YOUR_NGROK_AUTHTOKEN
```

Or use environment variables:

```bash
export LINQ_TOKEN=your_linq_token
export NGROK_AUTHTOKEN=your_ngrok_authtoken
```

### 3. Start Listening for Webhooks

```bash
linq webhooks listen
```

You'll see output like:

```
Local server started on port 4040
ngrok tunnel: https://abc123.ngrok-free.app

Webhook created: wh_abc123
Events: message.sent, message.received, message.read, ...

Listening for events... (Ctrl+C to stop)
```

### 4. Send a Test Message

Open a new terminal and send a message:

```bash
# List your phone numbers
linq phonenumbers

# Create a chat and send a message
linq chats create --to +19876543210 --from +12025551234 --message "Hello from Linq!"
```

### 5. Watch Events Arrive

Back in your first terminal, you'll see webhook events in structured log format:

```
2024-01-15T10:30:00.123Z [message.sent] message.id=msg_abc123 message.body="Hello from Linq!"
2024-01-15T10:30:01.456Z [message.delivered] message.id=msg_abc123
2024-01-15T10:30:05.789Z [message.received] message.id=msg_def456 message.body="Hi there!" message.chat_id=chat_xyz
```

### 6. Clean Up

Press `Ctrl+C` to stop. The CLI automatically cleans up the webhook subscription and ngrok tunnel.

## Shell Autocomplete

Enable tab completion for all commands and flags:

```bash
# Setup for your shell (bash, zsh, or fish)
linq autocomplete

# Follow the printed instructions, then restart your terminal
```

After setup, press `<TAB>` to autocomplete commands, subcommands, and flags.

## Environment Variables

- `LINQ_TOKEN`: API token (overrides config file)
- `LINQ_FROM_PHONE`: Default sender phone number (overrides config file)
- `LINQ_PROFILE`: Profile to use (overrides config file)
- `NGROK_AUTHTOKEN`: ngrok auth token for `webhooks listen` command

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## License

Apache-2.0
