# ErrorResponse

Invalid request - validation error

## Example Usage

```typescript
import { ErrorResponse } from "@linqapp/sdk/models/errors";

// No examples available for this model
```

## Fields

| Field                                                             | Type                                                              | Required                                                          | Description                                                       | Example                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `error`                                                           | [components.ErrorDetail](../../models/components/error-detail.md) | :heavy_check_mark:                                                | N/A                                                               |                                                                   |
| `success`                                                         | *boolean*                                                         | :heavy_check_mark:                                                | Always false for error responses                                  | false                                                             |
| `traceId`                                                         | *string*                                                          | :heavy_minus_sign:                                                | Unique trace ID for request tracing and debugging                 | trace_abc123def456                                                |