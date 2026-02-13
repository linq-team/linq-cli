# DeliveryStatus

Current delivery status of a message

## Example Usage

```typescript
import { DeliveryStatus } from "@linqapp/sdk/models/components";

let value: DeliveryStatus = "pending";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"pending" | "queued" | "sent" | "delivered" | "failed" | Unrecognized<string>
```