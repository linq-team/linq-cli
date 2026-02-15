# ListChatsResult

## Example Usage

```typescript
import { ListChatsResult } from "@linqapp/sdk/models/components";

let value: ListChatsResult = {
  chats: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      displayName: "+14155551234, +14155559876",
      service: "iMessage",
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
      createdAt: new Date("2024-01-15T10:30:00Z"),
      updatedAt: new Date("2024-01-15T10:30:00Z"),
    },
  ],
};
```

## Fields

| Field                                                                                                                                                     | Type                                                                                                                                                      | Required                                                                                                                                                  | Description                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chats`                                                                                                                                                   | [components.Chat](../../models/components/chat.md)[]                                                                                                      | :heavy_check_mark:                                                                                                                                        | List of chats                                                                                                                                             |
| `nextCursor`                                                                                                                                              | *string*                                                                                                                                                  | :heavy_minus_sign:                                                                                                                                        | Cursor for fetching the next page of results.<br/>Null if there are no more results to fetch.<br/>Pass this value as the `cursor` parameter in the next request.<br/> |