# MessageService

Service used to send/receive this message

## Example Usage

```typescript
import { MessageService } from "@linqapp/sdk/models/components";

let value: MessageService = "iMessage";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"iMessage" | "SMS" | "RCS" | Unrecognized<string>
```