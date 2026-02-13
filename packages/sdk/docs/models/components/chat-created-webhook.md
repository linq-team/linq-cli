# ChatCreatedWebhook

Complete webhook payload for chat.created events

## Example Usage

```typescript
import { ChatCreatedWebhook } from "@linqapp/sdk/models/components";

let value: ChatCreatedWebhook = {
  apiVersion: "v3",
  webhookVersion: "2025-01-01",
  eventType: "chat.typing_indicator.stopped",
  eventId: "550e8400-e29b-41d4-a716-446655440000",
  createdAt: new Date("2025-11-23T17:30:00Z"),
  traceId: "abc123def456",
  partnerId: "partner_abc123",
  data: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    displayName: "+14155551234, +14155559876",
    service: "iMessage",
    handles: [
      {
        id: "550e8400-e29b-41d4-a716-446655440010",
        handle: "+14155551234",
        service: "iMessage",
        joinedAt: new Date("2025-11-23T17:30:00.000Z"),
        leftAt: null,
        isMe: true,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440011",
        handle: "+14155559876",
        service: "iMessage",
        joinedAt: new Date("2025-11-23T17:30:00.000Z"),
        leftAt: null,
        isMe: false,
      },
    ],
    isGroup: true,
    createdAt: new Date("2025-11-23T17:30:00Z"),
    updatedAt: new Date("2025-11-23T17:30:00Z"),
  },
};
```

## Fields

| Field                                                                                                                                                                                                    | Type                                                                                                                                                                                                     | Required                                                                                                                                                                                                 | Description                                                                                                                                                                                              | Example                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apiVersion`                                                                                                                                                                                             | *string*                                                                                                                                                                                                 | :heavy_check_mark:                                                                                                                                                                                       | API version for the webhook payload format                                                                                                                                                               | v3                                                                                                                                                                                                       |
| `webhookVersion`                                                                                                                                                                                         | *string*                                                                                                                                                                                                 | :heavy_check_mark:                                                                                                                                                                                       | Date-based webhook payload version.<br/>Determined by the `?version=` query parameter in your webhook subscription URL.<br/>If no version parameter is specified, defaults based on subscription creation date.<br/> | 2025-01-01                                                                                                                                                                                               |
| `eventType`                                                                                                                                                                                              | [components.WebhookEventType](../../models/components/webhook-event-type.md)                                                                                                                             | :heavy_check_mark:                                                                                                                                                                                       | Valid webhook event types that can be subscribed to                                                                                                                                                      |                                                                                                                                                                                                          |
| `eventId`                                                                                                                                                                                                | *string*                                                                                                                                                                                                 | :heavy_check_mark:                                                                                                                                                                                       | Unique identifier for this event (for deduplication)                                                                                                                                                     | 550e8400-e29b-41d4-a716-446655440000                                                                                                                                                                     |
| `createdAt`                                                                                                                                                                                              | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)                                                                                                            | :heavy_check_mark:                                                                                                                                                                                       | When the event was created                                                                                                                                                                               | 2025-11-23T17:30:00Z                                                                                                                                                                                     |
| `traceId`                                                                                                                                                                                                | *string*                                                                                                                                                                                                 | :heavy_check_mark:                                                                                                                                                                                       | Trace ID for debugging and correlation across systems.                                                                                                                                                   | abc123def456                                                                                                                                                                                             |
| `partnerId`                                                                                                                                                                                              | *string*                                                                                                                                                                                                 | :heavy_check_mark:                                                                                                                                                                                       | Partner identifier. Present on all webhooks for cross-referencing.                                                                                                                                       | partner_abc123                                                                                                                                                                                           |
| `data`                                                                                                                                                                                                   | [components.ChatCreatedEvent](../../models/components/chat-created-event.md)                                                                                                                             | :heavy_check_mark:                                                                                                                                                                                       | Payload for chat.created webhook events. Matches GET /v3/chats/{chatId} response.                                                                                                                        |                                                                                                                                                                                                          |