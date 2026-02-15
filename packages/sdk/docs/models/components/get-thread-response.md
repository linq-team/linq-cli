# GetThreadResponse

Response containing messages in a thread with pagination

## Example Usage

```typescript
import { GetThreadResponse } from "@linqapp/sdk/models/components";

let value: GetThreadResponse = {
  messages: [
    {
      id: "69a37c7d-af4f-4b5e-af42-e28e98ce873a",
      chatId: "94c6bf33-31d9-40e3-a0e9-f94250ecedb9",
      service: "iMessage",
      preferredService: "iMessage",
      fromHandle: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        handle: "+15551234567",
        service: "iMessage",
        joinedAt: new Date("2025-05-21T15:30:00.000-05:00"),
        isMe: false,
      },
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
      replyTo: {
        messageId: "550e8400-e29b-41d4-a716-446655440000",
        partIndex: 0,
      },
      isFromMe: true,
      isDelivered: true,
      isRead: false,
      createdAt: new Date("2024-01-15T10:30:00Z"),
      updatedAt: new Date("2024-01-15T10:30:00Z"),
      sentAt: new Date("2024-01-15T10:30:05Z"),
      deliveredAt: new Date("2024-01-15T10:30:10Z"),
      readAt: new Date("2024-01-15T10:35:00Z"),
      effect: {
        type: "screen",
        name: "confetti",
      },
    },
  ],
  nextCursor: "eyJpZCI6IjEyMzQ1Njc4OTAiLCJ0cyI6MTYzMDUwMDAwMH0=",
};
```

## Fields

| Field                                                                  | Type                                                                   | Required                                                               | Description                                                            | Example                                                                |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `messages`                                                             | [components.Message](../../models/components/message.md)[]             | :heavy_check_mark:                                                     | Messages in the thread, ordered by the specified order parameter       |                                                                        |
| `nextCursor`                                                           | *string*                                                               | :heavy_minus_sign:                                                     | Cursor for fetching the next page of results (null if no more results) | eyJpZCI6IjEyMzQ1Njc4OTAiLCJ0cyI6MTYzMDUwMDAwMH0=                       |