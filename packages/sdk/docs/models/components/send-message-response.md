# SendMessageResponse

Response for sending a message to a chat

## Example Usage

```typescript
import { SendMessageResponse } from "@linqapp/sdk/models/components";

let value: SendMessageResponse = {
  chatId: "550e8400-e29b-41d4-a716-446655440000",
  message: {
    id: "69a37c7d-af4f-4b5e-af42-e28e98ce873a",
    service: "iMessage",
    preferredService: "iMessage",
    parts: [],
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
  },
};
```

## Fields

| Field                                                                  | Type                                                                   | Required                                                               | Description                                                            | Example                                                                |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `chatId`                                                               | *string*                                                               | :heavy_check_mark:                                                     | Unique identifier of the chat this message was sent to                 | 550e8400-e29b-41d4-a716-446655440000                                   |
| `message`                                                              | [components.SentMessage](../../models/components/sent-message.md)      | :heavy_check_mark:                                                     | A message that was sent (used in CreateChat and SendMessage responses) |                                                                        |