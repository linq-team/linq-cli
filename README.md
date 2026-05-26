# Linq CLI

[![License](https://img.shields.io/github/license/linq-team/linq-cli.svg)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/linq-team/linq-cli/ci.yml?branch=main)](https://github.com/linq-team/linq-cli/actions/workflows/ci.yml)

A command-line interface for the [Linq](https://linqapp.com) messaging API. Send and receive iMessages programmatically.

## Installation

### npm (cross-platform)

Requires Node.js >= 22.

```bash
npm install -g @linqapp/cli
```

### Homebrew (macOS / Linux)

```bash
brew install linq-team/tap/linq
```

### Quick Install (macOS / Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/linq-team/linq-cli/main/install.sh | sh
```

Automatically detects your OS and architecture, downloads the latest release, and installs it.

### Manual Download

Download the latest installer for your platform from the [Releases](https://github.com/linq-team/linq-cli/releases/latest) page:

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

1. **Create your account**:

   ```bash
   linq signup
   ```

   Enter your email, paste the 6-digit code we send you, then your name. You get a shared phone line you can use right away.

2. **Add a contact** so they can text you:

   ```bash
   linq contacts add +19876543210
   ```

3. **Listen for incoming messages**:

   ```bash
   linq webhooks listen
   ```

   Have the contact text your shared line — events stream into your terminal.

4. **Reply back**:

   ```bash
   linq chats create --to +19876543210 --message "Hi from the CLI!"
   ```

> **Heads up:** shared lines are inbound-first. Someone on your contact list has to text you before you can text them. Upgrade to a dedicated line to message anyone without that restriction.

## Commands

### Setup

#### `linq signup`

Create a Linq developer account and get a shared phone line. Authenticates via email OTP — no API token needed.

```bash
linq signup
```

The flow: enter email → check inbox for the 6-digit code → enter the code → enter your name. You're in.

#### `linq login`

Authenticate with an API token. Run bare to paste your token interactively, or use `--token` to pass it directly.

```bash
linq login
linq login --token linq_xxxxxxxxxxxx
linq login --profile work
```

#### `linq logout`

Clear local credentials. Does **not** revoke your API key on the server — just removes the stored token from this machine.

```bash
linq logout
```

#### `linq whoami`

Show your current identity and account info.

```bash
linq whoami
linq whoami --json
```

#### `linq doctor`

Check your CLI configuration and API connectivity. Runs diagnostic checks and reports any issues.

```bash
linq doctor
```

#### `linq init`

Interactive setup wizard. Same behavior as `linq login` — included for backwards compatibility.

```bash
linq init
```

### Tokens

Manage API tokens directly from the CLI. Mirrors the [web dashboard's API Tooling page](https://dashboard.linqapp.com/api-tooling/).

#### `linq tokens list`

List your API tokens. The token currently saved in your profile is marked `← active`.

```bash
linq tokens list
linq tokens list --json
```

#### `linq tokens show`

Print the API token saved in your local config. Useful if you lost the token printed at signup and need to copy it elsewhere (password manager, CI env var, etc.).

```bash
linq tokens show
linq tokens show --copy           # copy to clipboard instead of printing
linq tokens show --json
```

> Reads from your local `~/.linq/config.json` — never from the server. For security, raw tokens are never stored server-side. If you don't have the token locally either, regenerate it with `linq tokens regenerate <id>` or create a new one.

#### `linq tokens create`

Create a new API token. Run bare for an interactive wizard (name + expiration preset/custom/never). With flags, runs non-interactively and defaults to no expiry.

```bash
linq tokens create
linq tokens create --name "My CLI Token"
linq tokens create --name "Worker" --expires-in 30d
linq tokens create --name "Test"    --expires-in 2026-12-01
```

Expiration accepts `7d`, `30d`, `60d`, `90d`, `none`, or a `YYYY-MM-DD` date. **The full token is shown only once** — save it somewhere safe.

#### `linq tokens rename`

Rename a token.

```bash
linq tokens rename <id> --name "New Name"
```

#### `linq tokens regenerate`

Mint a new secret for an existing token. The old secret is immediately expired. If you regenerate the token currently saved in your profile, the new secret is automatically written to your local config so you stay logged in.

```bash
linq tokens regenerate <id>
linq tokens regenerate <id> --expires-in 30d
```

#### `linq tokens delete`

Permanently delete a token. **Interactive only** — refuses to run when invoked from a script, CI pipeline, or AI assistant. Also hard-refuses deleting the token you're currently logged in with (you'd lock yourself out).

```bash
linq tokens delete <id>
```

### Profile

#### `linq profile get|set`

Manage profile configuration values.

```bash
# View current profile config
linq profile get

# Set your API token manually
linq profile set token YOUR_API_TOKEN

# Set default sender phone (must be one from `linq phonenumbers`)
linq profile set fromPhone +12025551234
```

#### `linq profile list`

List all configuration profiles.

```bash
linq profile list
# Output:
# Profiles:
#   default (active)
#   personal
#   work
```

#### `linq profile use`

Switch to a different profile.

```bash
linq profile use work
```

#### `linq profile create`

Create a new named profile.

```bash
linq profile create staging
linq profile create work --token YOUR_TOKEN --from-phone +12025551234
```

#### `linq profile delete`

Delete a named profile.

```bash
linq profile delete staging
```

### Profiles

Profiles work like AWS CLI profiles — switch between different accounts or phone numbers easily. `linq signup` and `linq login` save credentials to the `default` profile.

```bash
# Create a work profile
linq profile create work
linq profile set token WORK_TOKEN --profile work
linq profile set fromPhone +18005551234 --profile work

# Switch default profile
linq profile use work

# Or use --profile flag with any command
linq chats create --to +19876543210 --message "Hello" --profile personal
```

Environment variables:
- `LINQ_PROFILE` — Override the active profile
- `LINQ_FROM_PHONE` — Override the sender phone number

### Phone Numbers

#### `linq phonenumbers`

List your available phone numbers.

```bash
linq phonenumbers
```

#### `linq phonenumbers set`

Set the default sender phone for the active profile.

```bash
linq phonenumbers set +12025551234
```

### Contacts (shared line)

Shared lines are inbound-first: a contact must text you before you can text them. Use `linq contacts` to manage the allowed contact list (max 20 per shared line).

#### `linq contacts add`

Allow a phone number to message your shared line.

```bash
linq contacts add +19876543210
```

#### `linq contacts list`

List all contacts on your shared line.

```bash
linq contacts list
```

#### `linq contacts remove`

Remove a contact.

```bash
linq contacts remove +19876543210
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
linq messages delete MESSAGE_ID
```

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

Listen for webhook events in real time, optionally forwarding them to a local server. Creates a temporary webhook subscription that's automatically deleted when you stop.

```bash
# Listen for all events (structured log output)
linq webhooks listen

# Forward to a local server (great for local dev)
linq webhooks listen --forward-to http://localhost:3000/webhook

# Filter to specific events
linq webhooks listen --events message.received,message.sent

# Output raw JSON instead of structured logs
linq webhooks listen --json
```

**Flags:**
- `--forward-to`, `-f`: Forward each event to a local URL via HTTP POST
- `--events`: Comma-separated list of events to subscribe to (default: all)
- `--token`, `-t`: API token (overrides stored token)
- `--profile`: Config profile to use
- `--json`: Output raw JSON instead of structured log format

Events are displayed in a structured log format:

```
2024-01-15T10:30:45.123Z [message.received] data.id=msg_123 data.chat.id=chat_456 data.body="Hello world"
```

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
# Via profile config
linq profile set telemetry false

# Or via environment variable
export LINQ_TELEMETRY=0
```

## Environment Variables

- `LINQ_TOKEN`: API token (overrides config file)
- `LINQ_FROM_PHONE`: Default sender phone number (overrides config file)
- `LINQ_PROFILE`: Profile to use (overrides config file)
- `LINQ_TELEMETRY`: Set to `0` to disable telemetry

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## License

Apache-2.0 — see [LICENSE](LICENSE) for details.
