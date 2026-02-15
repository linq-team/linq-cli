# SentMessageFromHandle

The sender of this message as a full handle object

## Example Usage

```typescript
import { SentMessageFromHandle } from "@linqapp/sdk/models/components";

let value: SentMessageFromHandle = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  handle: "+15551234567",
  service: "iMessage",
  joinedAt: new Date("2025-05-21T15:30:00.000-05:00"),
  isMe: false,
};
```

## Fields

| Field                                                                                                  | Type                                                                                                   | Required                                                                                               | Description                                                                                            | Example                                                                                                |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `id`                                                                                                   | *string*                                                                                               | :heavy_check_mark:                                                                                     | Unique identifier for this handle                                                                      | 550e8400-e29b-41d4-a716-446655440000                                                                   |
| `handle`                                                                                               | *string*                                                                                               | :heavy_check_mark:                                                                                     | Phone number (E.164) or email address of the participant                                               | +15551234567                                                                                           |
| `service`                                                                                              | [components.SentMessageFromHandleService](../../models/components/sent-message-from-handle-service.md) | :heavy_check_mark:                                                                                     | Service type (iMessage, SMS, RCS, etc.)                                                                | iMessage                                                                                               |
| `status`                                                                                               | [components.SentMessageStatus](../../models/components/sent-message-status.md)                         | :heavy_minus_sign:                                                                                     | Participant status                                                                                     |                                                                                                        |
| `joinedAt`                                                                                             | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)          | :heavy_check_mark:                                                                                     | When this participant joined the chat                                                                  | 2025-05-21T15:30:00.000-05:00                                                                          |
| `leftAt`                                                                                               | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)          | :heavy_minus_sign:                                                                                     | When they left (if applicable)                                                                         |                                                                                                        |
| `isMe`                                                                                                 | *boolean*                                                                                              | :heavy_minus_sign:                                                                                     | Whether this handle belongs to the sender (your phone number)                                          | false                                                                                                  |