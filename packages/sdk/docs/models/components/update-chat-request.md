# UpdateChatRequest

## Example Usage

```typescript
import { UpdateChatRequest } from "@linqapp/sdk/models/components";

let value: UpdateChatRequest = {
  displayName: "Updated Team Name",
  groupChatIcon: "https://example.com/icon.png",
};
```

## Fields

| Field                                                            | Type                                                             | Required                                                         | Description                                                      | Example                                                          |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `displayName`                                                    | *string*                                                         | :heavy_minus_sign:                                               | New display name for the chat (group chats only)                 | Updated Team Name                                                |
| `groupChatIcon`                                                  | *string*                                                         | :heavy_minus_sign:                                               | URL of an image to set as the group chat icon (group chats only) | https://example.com/icon.png                                     |