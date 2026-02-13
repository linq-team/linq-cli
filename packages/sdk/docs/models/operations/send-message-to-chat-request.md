# SendMessageToChatRequest

## Example Usage

```typescript
import { SendMessageToChatRequest } from "@linqapp/sdk/models/operations";

let value: SendMessageToChatRequest = {
  chatId: "550e8400-e29b-41d4-a716-446655440000",
  body: {
    message: {
      parts: [
        {
          type: "text",
          value: "Check this out!",
        },
        {
          type: "media",
          url:
            "https://skywalker-next.linqapp.com/_next/static/media/conversations-imessage.0dc825b0.png",
        },
      ],
      effect: {
        type: "screen",
        name: "confetti",
      },
      replyTo: {
        messageId: "550e8400-e29b-41d4-a716-446655440000",
        partIndex: 0,
      },
      idempotencyKey: "msg-abc123xyz",
      preferredService: "iMessage",
    },
  },
};
```

## Fields

| Field                                                                                          | Type                                                                                           | Required                                                                                       | Description                                                                                    | Example                                                                                        |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `chatId`                                                                                       | *string*                                                                                       | :heavy_check_mark:                                                                             | Unique identifier of the chat                                                                  | 550e8400-e29b-41d4-a716-446655440000                                                           |
| `body`                                                                                         | [components.SendMessageToChatRequest](../../models/components/send-message-to-chat-request.md) | :heavy_check_mark:                                                                             | N/A                                                                                            |                                                                                                |