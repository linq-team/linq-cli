# ChatTypingIndicatorStoppedEvent

Payload for chat.typing_indicator.stopped webhook events

## Example Usage

```typescript
import { ChatTypingIndicatorStoppedEvent } from "@linqapp/sdk/models/components";

let value: ChatTypingIndicatorStoppedEvent = {
  chatId: "550e8400-e29b-41d4-a716-446655440000",
};
```

## Fields

| Field                                | Type                                 | Required                             | Description                          | Example                              |
| ------------------------------------ | ------------------------------------ | ------------------------------------ | ------------------------------------ | ------------------------------------ |
| `chatId`                             | *string*                             | :heavy_check_mark:                   | Chat identifier                      | 550e8400-e29b-41d4-a716-446655440000 |