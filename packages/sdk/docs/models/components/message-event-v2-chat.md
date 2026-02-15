# MessageEventV2Chat

Chat information

## Example Usage

```typescript
import { MessageEventV2Chat } from "@linqapp/sdk/models/components";

let value: MessageEventV2Chat = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  isGroup: true,
  ownerHandle: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    handle: "+15551234567",
    service: "iMessage",
    joinedAt: new Date("2025-05-21T15:30:00.000-05:00"),
    isMe: false,
  },
};
```

## Fields

| Field                                                             | Type                                                              | Required                                                          | Description                                                       | Example                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `id`                                                              | *string*                                                          | :heavy_check_mark:                                                | Chat identifier                                                   | 550e8400-e29b-41d4-a716-446655440000                              |
| `isGroup`                                                         | *boolean*                                                         | :heavy_minus_sign:                                                | Whether this is a group chat                                      | true                                                              |
| `ownerHandle`                                                     | [components.OwnerHandle](../../models/components/owner-handle.md) | :heavy_minus_sign:                                                | Your phone number's handle. Always has is_me=true.                |                                                                   |