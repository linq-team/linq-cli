# CreateChatRequest

## Example Usage

```typescript
import { CreateChatRequest } from "@linqapp/sdk/models/components";

let value: CreateChatRequest = {
  from: "+12052535597",
  to: [
    "+14155559876",
    "+14155550123",
  ],
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

| Field                                                                                                                                                           | Type                                                                                                                                                            | Required                                                                                                                                                        | Description                                                                                                                                                     | Example                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from`                                                                                                                                                          | *string*                                                                                                                                                        | :heavy_check_mark:                                                                                                                                              | Sender phone number in E.164 format. Must be a phone number that the<br/>authenticated partner has permission to send from.<br/>                                | +12052535597                                                                                                                                                    |
| `to`                                                                                                                                                            | *string*[]                                                                                                                                                      | :heavy_check_mark:                                                                                                                                              | Array of recipient handles (phone numbers in E.164 format or email addresses).<br/>For individual chats, provide one recipient. For group chats, provide multiple.<br/> | [<br/>"+14155559876",<br/>"+14155550123"<br/>]                                                                                                                  |
| `message`                                                                                                                                                       | [components.MessageContent](../../models/components/message-content.md)                                                                                         | :heavy_check_mark:                                                                                                                                              | Message content container. Groups all message-related fields together,<br/>separating the "what" (message content) from the "where" (routing fields like from/to).<br/> |                                                                                                                                                                 |