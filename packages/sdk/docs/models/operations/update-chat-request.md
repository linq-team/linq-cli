# UpdateChatRequest

## Example Usage

```typescript
import { UpdateChatRequest } from "@linqapp/sdk/models/operations";

let value: UpdateChatRequest = {
  chatId: "550e8400-e29b-41d4-a716-446655440000",
  body: {
    displayName: "Updated Team Name",
    groupChatIcon: "https://example.com/icon.png",
  },
};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    | Example                                                                        |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `chatId`                                                                       | *string*                                                                       | :heavy_check_mark:                                                             | Unique identifier of the chat                                                  | 550e8400-e29b-41d4-a716-446655440000                                           |
| `body`                                                                         | [components.UpdateChatRequest](../../models/components/update-chat-request.md) | :heavy_check_mark:                                                             | N/A                                                                            |                                                                                |