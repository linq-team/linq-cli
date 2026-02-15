# DeleteMessageRequest

## Example Usage

```typescript
import { DeleteMessageRequest } from "@linqapp/sdk/models/operations";

let value: DeleteMessageRequest = {
  messageId: "69a37c7d-af4f-4b5e-af42-e28e98ce873a",
  body: {
    chatId: "94c6bf33-31d9-40e3-a0e9-f94250ecedb9",
  },
};
```

## Fields

| Field                                                                                | Type                                                                                 | Required                                                                             | Description                                                                          | Example                                                                              |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `messageId`                                                                          | *string*                                                                             | :heavy_check_mark:                                                                   | Unique identifier of the message to delete                                           | 69a37c7d-af4f-4b5e-af42-e28e98ce873a                                                 |
| `body`                                                                               | [components.DeleteMessageRequest](../../models/components/delete-message-request.md) | :heavy_check_mark:                                                                   | N/A                                                                                  |                                                                                      |