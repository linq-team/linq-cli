# SentMessageReplyTo

Indicates this message is a threaded reply to another message

## Example Usage

```typescript
import { SentMessageReplyTo } from "@linqapp/sdk/models/components";

let value: SentMessageReplyTo = {
  messageId: "550e8400-e29b-41d4-a716-446655440000",
  partIndex: 0,
};
```

## Fields

| Field                                                                                                                                                                 | Type                                                                                                                                                                  | Required                                                                                                                                                              | Description                                                                                                                                                           | Example                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messageId`                                                                                                                                                           | *string*                                                                                                                                                              | :heavy_check_mark:                                                                                                                                                    | The ID of the message to reply to                                                                                                                                     | 550e8400-e29b-41d4-a716-446655440000                                                                                                                                  |
| `partIndex`                                                                                                                                                           | *number*                                                                                                                                                              | :heavy_minus_sign:                                                                                                                                                    | The specific message part to reply to (0-based index).<br/>Defaults to 0 (first part) if not provided.<br/>Use this when replying to a specific part of a multipart message.<br/> | 0                                                                                                                                                                     |