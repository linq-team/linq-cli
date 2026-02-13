# GetMessagesRequest

## Example Usage

```typescript
import { GetMessagesRequest } from "@linqapp/sdk/models/operations";

let value: GetMessagesRequest = {
  chatId: "550e8400-e29b-41d4-a716-446655440000",
};
```

## Fields

| Field                                                | Type                                                 | Required                                             | Description                                          | Example                                              |
| ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `chatId`                                             | *string*                                             | :heavy_check_mark:                                   | Unique identifier of the chat                        | 550e8400-e29b-41d4-a716-446655440000                 |
| `cursor`                                             | *string*                                             | :heavy_minus_sign:                                   | Pagination cursor from previous next_cursor response |                                                      |
| `limit`                                              | *number*                                             | :heavy_minus_sign:                                   | Maximum number of messages to return                 |                                                      |