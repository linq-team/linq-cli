# AddParticipantResponse

Participant addition queued successfully

## Example Usage

```typescript
import { AddParticipantResponse } from "@linqapp/sdk/models/operations";

let value: AddParticipantResponse = {
  status: "accepted",
  message: "Participant addition queued",
};
```

## Fields

| Field                       | Type                        | Required                    | Description                 | Example                     |
| --------------------------- | --------------------------- | --------------------------- | --------------------------- | --------------------------- |
| `status`                    | *string*                    | :heavy_minus_sign:          | N/A                         | accepted                    |
| `traceId`                   | *string*                    | :heavy_minus_sign:          | N/A                         |                             |
| `message`                   | *string*                    | :heavy_minus_sign:          | N/A                         | Participant addition queued |