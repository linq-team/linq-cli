# WebhookErrorCode

Error codes that appear in webhook failure events (`message.failed`,
`chat.group_name_update_failed`, `chat.group_icon_update_failed`).

| Code | Name | Description | Recommended Action |
|------|------|-------------|-------------------|
| 3007 | `retries_exhausted` | Maximum delivery attempts exceeded | Retry after delay |
| 4001 | `delivery_failed` | Request could not be delivered | Check phone status |


## Example Usage

```typescript
import { WebhookErrorCode } from "@linqapp/sdk/models/components";

let value: WebhookErrorCode = 4001;
```

## Values

```typescript
3007 | 4001
```