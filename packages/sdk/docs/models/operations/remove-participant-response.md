# RemoveParticipantResponse

Participant removal queued successfully

## Example Usage

```typescript
import { RemoveParticipantResponse } from "@linqapp/sdk/models/operations";

let value: RemoveParticipantResponse = {
  status: "accepted",
  message: "Participant removal queued",
};
```

## Fields

| Field                      | Type                       | Required                   | Description                | Example                    |
| -------------------------- | -------------------------- | -------------------------- | -------------------------- | -------------------------- |
| `status`                   | *string*                   | :heavy_minus_sign:         | N/A                        | accepted                   |
| `traceId`                  | *string*                   | :heavy_minus_sign:         | N/A                        |                            |
| `message`                  | *string*                   | :heavy_minus_sign:         | N/A                        | Participant removal queued |