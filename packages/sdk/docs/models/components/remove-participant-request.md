# RemoveParticipantRequest

## Example Usage

```typescript
import { RemoveParticipantRequest } from "@linqapp/sdk/models/components";

let value: RemoveParticipantRequest = {
  handle: "+12052532136",
};
```

## Fields

| Field                                                                     | Type                                                                      | Required                                                                  | Description                                                               | Example                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `handle`                                                                  | *string*                                                                  | :heavy_check_mark:                                                        | Phone number (E.164 format) or email address of the participant to remove | +12052532136                                                              |