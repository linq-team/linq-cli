# MessageEventV2PreferredService

The service that was requested when sending. Null for inbound messages.

## Example Usage

```typescript
import { MessageEventV2PreferredService } from "@linqapp/sdk/models/components";

let value: MessageEventV2PreferredService = "iMessage";
```

## Values

```typescript
"iMessage" | "SMS" | "RCS" | "auto"
```