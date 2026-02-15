# SendReactionRequest

## Example Usage

```typescript
import { SendReactionRequest } from "@linqapp/sdk/models/operations";

let value: SendReactionRequest = {
  messageId: "69a37c7d-af4f-4b5e-af42-e28e98ce873a",
  body: {
    operation: "add",
    type: "love",
    customEmoji: "😍",
    partIndex: 1,
  },
};
```

## Fields

| Field                                                                              | Type                                                                               | Required                                                                           | Description                                                                        | Example                                                                            |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `messageId`                                                                        | *string*                                                                           | :heavy_check_mark:                                                                 | Unique identifier of the message to react to                                       | 69a37c7d-af4f-4b5e-af42-e28e98ce873a                                               |
| `body`                                                                             | [components.SendReactionRequest](../../models/components/send-reaction-request.md) | :heavy_check_mark:                                                                 | N/A                                                                                |                                                                                    |