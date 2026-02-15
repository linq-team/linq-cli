# MessageEventV2Effect

iMessage effect applied to the message (bubble or screen animation). Null if no effect.

## Example Usage

```typescript
import { MessageEventV2Effect } from "@linqapp/sdk/models/components";

let value: MessageEventV2Effect = {
  type: "bubble",
  name: "gentle",
};
```

## Fields

| Field                                                                             | Type                                                                              | Required                                                                          | Description                                                                       | Example                                                                           |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `type`                                                                            | [components.MessageEventV2Type](../../models/components/message-event-v2-type.md) | :heavy_minus_sign:                                                                | Effect category                                                                   | bubble                                                                            |
| `name`                                                                            | *string*                                                                          | :heavy_minus_sign:                                                                | Effect name (confetti, fireworks, slam, gentle, etc.)                             | gentle                                                                            |