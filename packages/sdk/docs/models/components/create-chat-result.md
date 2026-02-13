# CreateChatResult

Response for creating a new chat with an initial message

## Example Usage

```typescript
import { CreateChatResult } from "@linqapp/sdk/models/components";

let value: CreateChatResult = {
  chat: {
    id: "94c6bf33-31d9-40e3-a0e9-f94250ecedb9",
    displayName: "+14155551234, +14155559876",
    service: "iMessage",
    isGroup: false,
    handles: [
      {
        id: "550e8400-e29b-41d4-a716-446655440010",
        handle: "+14155551234",
        service: "iMessage",
        joinedAt: new Date("2025-05-21T15:30:00.000Z"),
        isMe: true,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440011",
        handle: "+14155559876",
        service: "iMessage",
        joinedAt: new Date("2025-05-21T15:30:00.000Z"),
        isMe: false,
      },
    ],
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
  },
};
```

## Fields

| Field                                                                                 | Type                                                                                  | Required                                                                              | Description                                                                           |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `chat`                                                                                | [components.CreateChatResultChat](../../models/components/create-chat-result-chat.md) | :heavy_check_mark:                                                                    | N/A                                                                                   |