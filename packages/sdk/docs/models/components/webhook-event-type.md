# WebhookEventType

Valid webhook event types that can be subscribed to

## Example Usage

```typescript
import { WebhookEventType } from "@linqapp/sdk/models/components";

let value: WebhookEventType = "message.failed";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"message.sent" | "message.received" | "message.read" | "message.delivered" | "message.failed" | "reaction.added" | "reaction.removed" | "participant.added" | "participant.removed" | "chat.created" | "chat.group_name_updated" | "chat.group_icon_updated" | "chat.group_name_update_failed" | "chat.group_icon_update_failed" | "chat.typing_indicator.started" | "chat.typing_indicator.stopped" | Unrecognized<string>
```