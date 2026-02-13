# MessageContentPreferredService

Preferred messaging service to use for this message.
If not specified, uses default fallback chain: iMessage → RCS → SMS.
- iMessage: Enforces iMessage without fallback to RCS or SMS. Message fails if recipient doesn't support iMessage.
- RCS: Enforces RCS or SMS (no iMessage). Uses RCS if recipient supports it, otherwise falls back to SMS.
- SMS: Enforces SMS (no iMessage). Uses RCS if recipient supports it, otherwise falls back to SMS.


## Example Usage

```typescript
import { MessageContentPreferredService } from "@linqapp/sdk/models/components";

let value: MessageContentPreferredService = "iMessage";
```

## Values

```typescript
"iMessage" | "RCS" | "SMS"
```