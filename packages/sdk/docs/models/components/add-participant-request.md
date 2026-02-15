# AddParticipantRequest

## Example Usage

```typescript
import { AddParticipantRequest } from "@linqapp/sdk/models/components";

let value: AddParticipantRequest = {
  handle: "+12052532136",
};
```

## Fields

| Field                                                                  | Type                                                                   | Required                                                               | Description                                                            | Example                                                                |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `handle`                                                               | *string*                                                               | :heavy_check_mark:                                                     | Phone number (E.164 format) or email address of the participant to add | +12052532136                                                           |