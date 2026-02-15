# RemoveParticipantRequest

## Example Usage

```typescript
import { RemoveParticipantRequest } from "@linqapp/sdk/models/operations";

let value: RemoveParticipantRequest = {
  chatId: "550e8400-e29b-41d4-a716-446655440000",
  body: {
    handle: "+12052532136",
  },
};
```

## Fields

| Field                                                                                        | Type                                                                                         | Required                                                                                     | Description                                                                                  | Example                                                                                      |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `chatId`                                                                                     | *string*                                                                                     | :heavy_check_mark:                                                                           | Unique identifier of the chat                                                                | 550e8400-e29b-41d4-a716-446655440000                                                         |
| `body`                                                                                       | [components.RemoveParticipantRequest](../../models/components/remove-participant-request.md) | :heavy_check_mark:                                                                           | N/A                                                                                          |                                                                                              |