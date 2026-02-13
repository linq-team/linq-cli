# SentMessagePreferredService

Preferred service for sending this message

## Example Usage

```typescript
import { SentMessagePreferredService } from "@linqapp/sdk/models/components";

let value: SentMessagePreferredService = "iMessage";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"iMessage" | "SMS" | "RCS" | Unrecognized<string>
```