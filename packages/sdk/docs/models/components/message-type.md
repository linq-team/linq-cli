# MessageType

Type of effect

## Example Usage

```typescript
import { MessageType } from "@linqapp/sdk/models/components";

let value: MessageType = "screen";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"screen" | "bubble" | Unrecognized<string>
```