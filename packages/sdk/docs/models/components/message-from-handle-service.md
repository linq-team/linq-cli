# MessageFromHandleService

Service type (iMessage, SMS, RCS, etc.)

## Example Usage

```typescript
import { MessageFromHandleService } from "@linqapp/sdk/models/components";

let value: MessageFromHandleService = "iMessage";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"iMessage" | "SMS" | "RCS" | Unrecognized<string>
```