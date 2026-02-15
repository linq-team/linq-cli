# SendVoiceMemoToChatResultService

Service used to send this voice memo

## Example Usage

```typescript
import { SendVoiceMemoToChatResultService } from "@linqapp/sdk/models/components";

let value: SendVoiceMemoToChatResultService = "iMessage";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"iMessage" | "SMS" | "RCS" | Unrecognized<string>
```