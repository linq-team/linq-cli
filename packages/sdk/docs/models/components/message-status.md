# MessageStatus

Participant status

## Example Usage

```typescript
import { MessageStatus } from "@linqapp/sdk/models/components";

let value: MessageStatus = "removed";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"active" | "left" | "removed" | Unrecognized<string>
```