# SentMessageService

Service used to send this message

## Example Usage

```typescript
import { SentMessageService } from "@linqapp/sdk/models/components";

let value: SentMessageService = "iMessage";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"iMessage" | "SMS" | "RCS" | Unrecognized<string>
```