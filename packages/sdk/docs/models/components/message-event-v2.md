# MessageEventV2

Unified payload for message webhooks when using `webhook_version: "2026-02-03"`.

This schema is used for message.sent, message.received, message.delivered, and message.read
events when the subscription URL includes `?version=2026-02-03`.

Key differences from V1 (2025-01-01):
- `direction`: "inbound" or "outbound" instead of `is_from_me` boolean
- `sender_handle`: Full handle object for the sender
- `chat`: Nested object with `id`, `is_group`, and `owner_handle`
- Message fields (`id`, `parts`, `effect`, etc.) are at the top level, not nested in `message`

Timestamps indicate the message state:
- `message.sent`: sent_at set, delivered_at=null, read_at=null
- `message.received`: sent_at set, delivered_at=null, read_at=null
- `message.delivered`: sent_at set, delivered_at set, read_at=null
- `message.read`: sent_at set, delivered_at set, read_at set


## Example Usage

```typescript
import { MessageEventV2 } from "@linqapp/sdk/models/components";

let value: MessageEventV2 = {
  chat: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    isGroup: true,
    ownerHandle: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      handle: "+15551234567",
      service: "iMessage",
      joinedAt: new Date("2025-05-21T15:30:00.000-05:00"),
      isMe: false,
    },
  },
  id: "550e8400-e29b-41d4-a716-446655440001",
  idempotencyKey: "unique-key",
  direction: "outbound",
  senderHandle: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    handle: "+15551234567",
    service: "iMessage",
    joinedAt: new Date("2025-05-21T15:30:00.000-05:00"),
    isMe: false,
  },
  parts: [],
  sentAt: new Date("2026-01-30T20:49:19.704Z"),
  deliveredAt: new Date("2026-01-30T20:49:20.352Z"),
  readAt: null,
  effect: {
    type: "bubble",
    name: "gentle",
  },
  service: "iMessage",
  preferredService: "iMessage",
};
```

## Fields

| Field                                                                                                      | Type                                                                                                       | Required                                                                                                   | Description                                                                                                | Example                                                                                                    |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `chat`                                                                                                     | [components.MessageEventV2Chat](../../models/components/message-event-v2-chat.md)                          | :heavy_check_mark:                                                                                         | Chat information                                                                                           |                                                                                                            |
| `id`                                                                                                       | *string*                                                                                                   | :heavy_check_mark:                                                                                         | Message identifier                                                                                         | 550e8400-e29b-41d4-a716-446655440001                                                                       |
| `idempotencyKey`                                                                                           | *string*                                                                                                   | :heavy_minus_sign:                                                                                         | Idempotency key for deduplication of outbound messages.                                                    | unique-key                                                                                                 |
| `direction`                                                                                                | [components.Direction](../../models/components/direction.md)                                               | :heavy_check_mark:                                                                                         | Message direction - "outbound" if sent by you, "inbound" if received                                       | outbound                                                                                                   |
| `senderHandle`                                                                                             | [components.ChatHandle](../../models/components/chat-handle.md)                                            | :heavy_check_mark:                                                                                         | The handle that sent this message                                                                          |                                                                                                            |
| `parts`                                                                                                    | *components.MessageEventV2Part*[]                                                                          | :heavy_check_mark:                                                                                         | Message parts (text and/or media)                                                                          |                                                                                                            |
| `sentAt`                                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)              | :heavy_minus_sign:                                                                                         | When the message was sent. Null if not yet sent.                                                           | 2026-01-30T20:49:19.704Z                                                                                   |
| `deliveredAt`                                                                                              | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)              | :heavy_minus_sign:                                                                                         | When the message was delivered. Null if not yet delivered.                                                 | 2026-01-30T20:49:20.352Z                                                                                   |
| `readAt`                                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)              | :heavy_minus_sign:                                                                                         | When the message was read. Null if not yet read.                                                           | <nil>                                                                                                      |
| `replyTo`                                                                                                  | [components.MessageEventV2ReplyTo](../../models/components/message-event-v2-reply-to.md)                   | :heavy_minus_sign:                                                                                         | Reference to the message this is replying to (for threaded replies)                                        |                                                                                                            |
| `effect`                                                                                                   | [components.MessageEventV2Effect](../../models/components/message-event-v2-effect.md)                      | :heavy_minus_sign:                                                                                         | iMessage effect applied to the message (bubble or screen animation). Null if no effect.                    |                                                                                                            |
| `service`                                                                                                  | [components.MessageEventV2Service](../../models/components/message-event-v2-service.md)                    | :heavy_check_mark:                                                                                         | The service used to send/receive the message                                                               | iMessage                                                                                                   |
| `preferredService`                                                                                         | [components.MessageEventV2PreferredService](../../models/components/message-event-v2-preferred-service.md) | :heavy_minus_sign:                                                                                         | The service that was requested when sending. Null for inbound messages.                                    | iMessage                                                                                                   |