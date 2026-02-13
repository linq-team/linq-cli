# GetMessageThreadRequest

## Example Usage

```typescript
import { GetMessageThreadRequest } from "@linqapp/sdk/models/operations";

let value: GetMessageThreadRequest = {
  messageId: "69a37c7d-af4f-4b5e-af42-e28e98ce873a",
};
```

## Fields

| Field                                                             | Type                                                              | Required                                                          | Description                                                       | Example                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `messageId`                                                       | *string*                                                          | :heavy_check_mark:                                                | ID of any message in the thread (can be originator or any reply)  | 69a37c7d-af4f-4b5e-af42-e28e98ce873a                              |
| `cursor`                                                          | *string*                                                          | :heavy_minus_sign:                                                | Pagination cursor from previous next_cursor response              |                                                                   |
| `limit`                                                           | *number*                                                          | :heavy_minus_sign:                                                | Maximum number of messages to return                              |                                                                   |
| `order`                                                           | [operations.Order](../../models/operations/order.md)              | :heavy_minus_sign:                                                | Sort order for messages (asc = oldest first, desc = newest first) |                                                                   |