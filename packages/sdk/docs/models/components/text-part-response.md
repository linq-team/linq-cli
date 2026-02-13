# TextPartResponse

A text message part

## Example Usage

```typescript
import { TextPartResponse } from "@linqapp/sdk/models/components";

let value: TextPartResponse = {
  type: "text",
  value: "Hello!",
  reactions: [],
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  | Example                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `type`                                                       | *"text"*                                                     | :heavy_check_mark:                                           | Indicates this is a text message part                        |                                                              |
| `value`                                                      | *string*                                                     | :heavy_check_mark:                                           | The text content                                             | Check this out!                                              |
| `reactions`                                                  | [components.Reaction](../../models/components/reaction.md)[] | :heavy_check_mark:                                           | Reactions on this message part                               |                                                              |