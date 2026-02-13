# MessageEventV2ReplyTo

Reference to the message this is replying to (for threaded replies)

## Example Usage

```typescript
import { MessageEventV2ReplyTo } from "@linqapp/sdk/models/components";

let value: MessageEventV2ReplyTo = {};
```

## Fields

| Field                              | Type                               | Required                           | Description                        |
| ---------------------------------- | ---------------------------------- | ---------------------------------- | ---------------------------------- |
| `messageId`                        | *string*                           | :heavy_minus_sign:                 | ID of the message being replied to |
| `partIndex`                        | *number*                           | :heavy_minus_sign:                 | Index of the part being replied to |