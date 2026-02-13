# PhoneCapabilities

## Example Usage

```typescript
import { PhoneCapabilities } from "@linqapp/sdk/models/components";

let value: PhoneCapabilities = {
  sms: true,
  mms: true,
  voice: false,
};
```

## Fields

| Field                              | Type                               | Required                           | Description                        | Example                            |
| ---------------------------------- | ---------------------------------- | ---------------------------------- | ---------------------------------- | ---------------------------------- |
| `sms`                              | *boolean*                          | :heavy_check_mark:                 | Whether SMS messaging is supported | true                               |
| `mms`                              | *boolean*                          | :heavy_check_mark:                 | Whether MMS messaging is supported | true                               |
| `voice`                            | *boolean*                          | :heavy_check_mark:                 | Whether voice calls are supported  | false                              |