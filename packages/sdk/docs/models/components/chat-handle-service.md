# ChatHandleService

Service type (iMessage, SMS, RCS, etc.)

## Example Usage

```typescript
import { ChatHandleService } from "@linqapp/sdk/models/components";

let value: ChatHandleService = "iMessage";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"iMessage" | "SMS" | "RCS" | Unrecognized<string>
```