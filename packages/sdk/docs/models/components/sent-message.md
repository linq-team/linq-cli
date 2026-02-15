# SentMessage

A message that was sent (used in CreateChat and SendMessage responses)

## Example Usage

```typescript
import { SentMessage } from "@linqapp/sdk/models/components";

let value: SentMessage = {
  id: "69a37c7d-af4f-4b5e-af42-e28e98ce873a",
  service: "iMessage",
  preferredService: "iMessage",
  parts: [
    {
      type: "text",
      value: "Hello!",
      reactions: [
        {
          isMe: false,
          handle: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            handle: "+15551234567",
            service: "iMessage",
            status: "active",
            joinedAt: new Date("2025-05-21T15:30:00.000-05:00"),
            isMe: false,
          },
          type: "love",
          customEmoji: "🚀",
        },
      ],
    },
  ],
  sentAt: new Date("2025-10-23T13:07:55.019-05:00"),
  deliveredAt: null,
  deliveryStatus: "pending",
  isRead: false,
  effect: {
    type: "screen",
    name: "confetti",
  },
  fromHandle: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    handle: "+15551234567",
    service: "iMessage",
    joinedAt: new Date("2025-05-21T15:30:00.000-05:00"),
    isMe: false,
  },
  replyTo: {
    messageId: "550e8400-e29b-41d4-a716-446655440000",
    partIndex: 0,
  },
};
```

## Fields

| Field                                                                                               | Type                                                                                                | Required                                                                                            | Description                                                                                         | Example                                                                                             |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `id`                                                                                                | *string*                                                                                            | :heavy_check_mark:                                                                                  | Message identifier (UUID)                                                                           | 69a37c7d-af4f-4b5e-af42-e28e98ce873a                                                                |
| `service`                                                                                           | [components.SentMessageService](../../models/components/sent-message-service.md)                    | :heavy_minus_sign:                                                                                  | Service used to send this message                                                                   | iMessage                                                                                            |
| `preferredService`                                                                                  | [components.SentMessagePreferredService](../../models/components/sent-message-preferred-service.md) | :heavy_minus_sign:                                                                                  | Preferred service for sending this message                                                          | iMessage                                                                                            |
| `parts`                                                                                             | *components.SentMessagePart*[]                                                                      | :heavy_check_mark:                                                                                  | Message parts in order (text and media)                                                             |                                                                                                     |
| `sentAt`                                                                                            | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)       | :heavy_check_mark:                                                                                  | When the message was sent                                                                           | 2025-10-23T13:07:55.019-05:00                                                                       |
| `deliveredAt`                                                                                       | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)       | :heavy_minus_sign:                                                                                  | When the message was delivered                                                                      | <nil>                                                                                               |
| `deliveryStatus`                                                                                    | [components.DeliveryStatus](../../models/components/delivery-status.md)                             | :heavy_check_mark:                                                                                  | Current delivery status of a message                                                                | pending                                                                                             |
| `isRead`                                                                                            | *boolean*                                                                                           | :heavy_check_mark:                                                                                  | Whether the message has been read                                                                   | false                                                                                               |
| `effect`                                                                                            | [components.SentMessageEffect](../../models/components/sent-message-effect.md)                      | :heavy_minus_sign:                                                                                  | iMessage effect applied to this message (screen or bubble effect)                                   |                                                                                                     |
| `fromHandle`                                                                                        | [components.SentMessageFromHandle](../../models/components/sent-message-from-handle.md)             | :heavy_minus_sign:                                                                                  | The sender of this message as a full handle object                                                  |                                                                                                     |
| `replyTo`                                                                                           | [components.SentMessageReplyTo](../../models/components/sent-message-reply-to.md)                   | :heavy_minus_sign:                                                                                  | N/A                                                                                                 |                                                                                                     |