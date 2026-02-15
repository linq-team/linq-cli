# ChatInfo

## Example Usage

```typescript
import { ChatInfo } from "@linqapp/sdk/models/components";

let value: ChatInfo = {
  id: "7b44cca9-1cd9-40ab-8880-ed39f8f6bcb7",
  handles: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      handle: "+15551234567",
      service: "iMessage",
      joinedAt: new Date("2025-05-21T15:30:00.000-05:00"),
      isMe: false,
    },
  ],
  isGroup: true,
  service: "iMessage",
  isActive: false,
};
```

## Fields

| Field                                                             | Type                                                              | Required                                                          | Description                                                       | Example                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `id`                                                              | *string*                                                          | :heavy_check_mark:                                                | Chat identifier                                                   |                                                                   |
| `handles`                                                         | [components.ChatHandle](../../models/components/chat-handle.md)[] | :heavy_check_mark:                                                | Chat participants                                                 |                                                                   |
| `isGroup`                                                         | *boolean*                                                         | :heavy_check_mark:                                                | Whether this is a group chat                                      |                                                                   |
| `service`                                                         | *string*                                                          | :heavy_check_mark:                                                | Messaging service                                                 | iMessage                                                          |
| `isActive`                                                        | *boolean*                                                         | :heavy_check_mark:                                                | Whether the chat is active                                        |                                                                   |