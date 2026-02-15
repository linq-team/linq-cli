# Linq CLI

[![License](https://img.shields.io/github/license/linq-team/linq-cli.svg)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/linq-team/linq-cli/ci.yml?branch=main)](https://github.com/linq-team/linq-cli/actions/workflows/ci.yml)

A command-line interface for the [Linq](https://linqapp.com) messaging API. Send and receive iMessages programmatically.

## Installation

Download the latest installer for your platform from the [Releases](https://github.com/linq-team/linq-cli/releases) page:

| Platform | File | Install Command |
|----------|------|-----------------|
| **macOS (Apple Silicon)** | `linq-*-mac-apple-silicon.pkg` | Double-click to install |
| **macOS (Intel)** | `linq-*-mac-intel.pkg` | Double-click to install |
| **Windows (x64)** | `linq-*-windows-x64.exe` | Run the installer |
| **Windows (ARM)** | `linq-*-windows-arm64.exe` | Run the installer |
| **Linux (x64)** | `linq-*-linux-x64.deb` | `sudo dpkg -i linq-*.deb` |
| **Linux (ARM)** | `linq-*-linux-arm64.deb` | `sudo dpkg -i linq-*.deb` |

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

Interactive setup wizard. Validates your API token and selects a default phone number.

```bash
linq init
```

#### `linq signup`

Get a sandbox phone number for testing. Authenticates via GitHub and provisions a temporary sandbox number (valid for 3 hours).

```bash
linq signup
```

#### `linq doctor`

Check your CLI configuration and API connectivity. Runs diagnostic checks and reports any issues.

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

#### `linq chats update`

Update a chat's display name or group icon.

```bash
# Rename a chat
linq chats update CHAT_ID --name "Team Discussion"

# Set group icon
linq chats update CHAT_ID --icon https://example.com/icon.png
```

**Flags:**
- `--name`: New display name for the chat
- `--icon`: URL for group chat icon
- At least one of `--name` or `--icon` must be specified

#### `linq chats read`

Mark all messages in a chat as read.

```bash
linq chats read CHAT_ID
```

#### `linq chats typing`

Start or stop a typing indicator in a chat.

```bash
# Start typing indicator
linq chats typing CHAT_ID

# Stop typing indicator
linq chats typing CHAT_ID --stop
```

#### `linq chats voicememo`

Send a voice memo to a chat.

```bash
linq chats voicememo CHAT_ID --url https://example.com/memo.m4a
```

**Flags:**
- `--url` (required): URL of the voice memo audio file
- `--from`: Sender phone number. Uses config `fromPhone` if not specified.

#### `linq chats share-contact`

Share your contact card with a chat.

```bash
linq chats share-contact CHAT_ID
```

#### `linq chats participants add`

Add a participant to a group chat.

```bash
linq chats participants add CHAT_ID --handle +19876543210
```

**Flags:**
- `--handle` (required): Phone number or email of participant to add

#### `linq chats participants remove`

Remove a participant from a group chat.

```bash
linq chats participants remove CHAT_ID --handle +19876543210
```

**Flags:**
- `--handle` (required): Phone number or email of participant to remove

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

# Reply to a message (creates a thread)
linq messages send CHAT_ID --message "Reply" --reply-to MSG_ID
```

**Flags:**
- `--from`: Your sender phone number (must be one from `linq phonenumbers`). Uses config `fromPhone` if not specified.
- `--message`, `-m` (required): Message text
- `--effect`: iMessage effect
- `--reply-to`: Message ID to reply to (creates a thread)
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

#### `linq messages thread`

Get all messages in a thread.

```bash
linq messages thread MESSAGE_ID
linq messages thread MESSAGE_ID --limit 10 --order desc
```

**Flags:**
- `--limit`: Maximum number of messages to return
- `--cursor`: Pagination cursor
- `--order`: Sort order (asc or desc)

### Attachments

#### `linq attachments upload`

Request a presigned upload URL for a file.

```bash
linq attachments upload --filename photo.jpg --content-type image/jpeg --size 1024000
```

**Flags:**
- `--filename` (required): Filename (e.g. photo.jpg)
- `--content-type` (required): MIME type (e.g. image/jpeg)
- `--size` (required): File size in bytes

#### `linq attachments get`

Get attachment metadata.

```bash
linq attachments get ATTACHMENT_ID
```

### Webhooks

#### `linq webhooks create`

Create a new webhook subscription.

```bash
# Subscribe to specific events
linq webhooks create --url https://example.com/webhook --events message.received,message.sent

# Subscribe to all events
linq webhooks create --url https://example.com/webhook --all-events
```

**Flags:**
- `--url` (required): Target URL for webhook events
- `--events`: Comma-separated list of events to subscribe to
- `--all-events`: Subscribe to all event types

Either `--events` or `--all-events` is required.

Available events: message.sent, message.received, message.read, message.delivered, message.failed, reaction.added, reaction.removed, participant.added, participant.removed, chat.created, chat.group_name_updated, chat.group_icon_updated, chat.group_name_update_failed, chat.group_icon_update_failed, chat.typing_indicator.started, chat.typing_indicator.stopped

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

#### `linq webhooks events`

List available webhook event types.

```bash
linq webhooks events
```

#### `linq webhooks listen`

Listen for webhook events in real time. Creates a temporary webhook subscription that's automatically deleted when you stop.

```bash
# Listen for all events
linq webhooks listen

# Listen for specific events only
linq webhooks listen --events message.received,message.sent

# Output raw JSON instead of structured logs
linq webhooks listen --json
```

Events are displayed in a structured log format:

```
2024-01-15T10:30:45.123Z [message.received] message.id=msg_123 message.body="Hello world" message.chat_id=chat_456
```

Use `--json` for raw JSON output (useful for piping to `jq`).

Press `Ctrl+C` to stop. The CLI automatically cleans up the webhook subscription.

## Shell Autocomplete

Enable tab completion for all commands and flags:

```bash
# Setup for your shell (bash, zsh, or fish)
linq autocomplete

# Follow the printed instructions, then restart your terminal
```

After setup, press `<TAB>` to autocomplete commands, subcommands, and flags.

## Telemetry

Linq CLI collects anonymous usage data to help improve the tool. This includes:

- **Command name** (e.g., `chats create`)
- **CLI version**, OS, Node version, architecture
- **Error stack traces** for crashes

**Never collected**: tokens, phone numbers, message content, flag values, or any PII.

### Opt out

```bash
# Via config
linq config set telemetry false

# Or via environment variable
export LINQ_TELEMETRY=0
```

## Environment Variables

- `LINQ_TOKEN`: API token (overrides config file)
- `LINQ_FROM_PHONE`: Default sender phone number (overrides config file)
- `LINQ_PROFILE`: Profile to use (overrides config file)
- `LINQ_RELAY_URL`: Custom relay URL for `webhooks listen`
- `LINQ_RELAY_WS_URL`: Custom WebSocket relay URL for `webhooks listen`
- `LINQ_TELEMETRY`: Set to `0` to disable telemetry

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## License

Apache-2.0 — see [LICENSE](LICENSE) for details.
