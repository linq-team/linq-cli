# ChatService

Service type for the chat

## Example Usage

```typescript
import { ChatService } from "@linqapp/sdk/models/components";

let value: ChatService = "iMessage";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"iMessage" | "SMS" | "RCS" | Unrecognized<string>
```