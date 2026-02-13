# SendMessageToChatRequest

## Example Usage

```typescript
import { SendMessageToChatRequest } from "@linqapp/sdk/models/components";

let value: SendMessageToChatRequest = {
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
};
```

## Fields

| Field                                                                                                                                                           | Type                                                                                                                                                            | Required                                                                                                                                                        | Description                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message`                                                                                                                                                       | [components.MessageContent](../../models/components/message-content.md)                                                                                         | :heavy_check_mark:                                                                                                                                              | Message content container. Groups all message-related fields together,<br/>separating the "what" (message content) from the "where" (routing fields like from/to).<br/> |