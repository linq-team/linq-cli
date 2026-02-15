# SentMessageFromHandleService

Service type (iMessage, SMS, RCS, etc.)

## Example Usage

```typescript
import { SentMessageFromHandleService } from "@linqapp/sdk/models/components";

let value: SentMessageFromHandleService = "iMessage";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"iMessage" | "SMS" | "RCS" | Unrecognized<string>
```