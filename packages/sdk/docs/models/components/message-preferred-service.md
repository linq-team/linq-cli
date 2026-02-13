# MessagePreferredService

Preferred service for sending this message

## Example Usage

```typescript
import { MessagePreferredService } from "@linqapp/sdk/models/components";

let value: MessagePreferredService = "iMessage";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"iMessage" | "SMS" | "RCS" | Unrecognized<string>
```