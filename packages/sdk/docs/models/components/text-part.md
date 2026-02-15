# TextPart

## Example Usage

```typescript
import { TextPart } from "@linqapp/sdk/models/components";

let value: TextPart = {
  type: "text",
  value: "Check this out!",
};
```

## Fields

| Field                                                                                                           | Type                                                                                                            | Required                                                                                                        | Description                                                                                                     | Example                                                                                                         |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `type`                                                                                                          | *"text"*                                                                                                        | :heavy_check_mark:                                                                                              | Indicates this is a text message part                                                                           |                                                                                                                 |
| `value`                                                                                                         | *string*                                                                                                        | :heavy_check_mark:                                                                                              | The text content                                                                                                | Hello!                                                                                                          |
| `idempotencyKey`                                                                                                | *string*                                                                                                        | :heavy_minus_sign:                                                                                              | Optional idempotency key for this specific message part.<br/>Use this to prevent duplicate sends of the same part.<br/> | text-part-abc123                                                                                                |