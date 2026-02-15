# AttachmentStatus

Current upload/processing status

## Example Usage

```typescript
import { AttachmentStatus } from "@linqapp/sdk/models/components";

let value: AttachmentStatus = "complete";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"pending" | "complete" | "failed" | Unrecognized<string>
```