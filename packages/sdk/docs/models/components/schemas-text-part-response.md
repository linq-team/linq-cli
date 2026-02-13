# SchemasTextPartResponse

A text message part

## Example Usage

```typescript
import { SchemasTextPartResponse } from "@linqapp/sdk/models/components";

let value: SchemasTextPartResponse = {
  type: "text",
  value: "Hello!",
};
```

## Fields

| Field                                 | Type                                  | Required                              | Description                           | Example                               |
| ------------------------------------- | ------------------------------------- | ------------------------------------- | ------------------------------------- | ------------------------------------- |
| `type`                                | *"text"*                              | :heavy_check_mark:                    | Indicates this is a text message part |                                       |
| `value`                               | *string*                              | :heavy_check_mark:                    | The text content                      | Check this out!                       |