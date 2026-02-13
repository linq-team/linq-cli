# ChatTypingIndicatorStartedEvent

Payload for chat.typing_indicator.started webhook events

## Example Usage

```typescript
import { ChatTypingIndicatorStartedEvent } from "@linqapp/sdk/models/components";

let value: ChatTypingIndicatorStartedEvent = {
  chatId: "550e8400-e29b-41d4-a716-446655440000",
};
```

## Fields

| Field                                | Type                                 | Required                             | Description                          | Example                              |
| ------------------------------------ | ------------------------------------ | ------------------------------------ | ------------------------------------ | ------------------------------------ |
| `chatId`                             | *string*                             | :heavy_check_mark:                   | Chat identifier                      | 550e8400-e29b-41d4-a716-446655440000 |