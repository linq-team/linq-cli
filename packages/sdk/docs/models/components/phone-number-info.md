# PhoneNumberInfo

## Example Usage

```typescript
import { PhoneNumberInfo } from "@linqapp/sdk/models/components";

let value: PhoneNumberInfo = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  phoneNumber: "+12025551234",
  type: "APPLE_ID",
  countryCode: "US",
  capabilities: {
    sms: true,
    mms: true,
    voice: false,
  },
};
```

## Fields

| Field                                                                               | Type                                                                                | Required                                                                            | Description                                                                         | Example                                                                             |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `id`                                                                                | *string*                                                                            | :heavy_check_mark:                                                                  | Unique identifier for the phone number                                              | 550e8400-e29b-41d4-a716-446655440000                                                |
| `phoneNumber`                                                                       | *string*                                                                            | :heavy_check_mark:                                                                  | Phone number in E.164 format                                                        | +12025551234                                                                        |
| `type`                                                                              | [components.PhoneNumberInfoType](../../models/components/phone-number-info-type.md) | :heavy_check_mark:                                                                  | Type of phone number                                                                | APPLE_ID                                                                            |
| `countryCode`                                                                       | *string*                                                                            | :heavy_check_mark:                                                                  | ISO 3166-1 alpha-2 country code                                                     | US                                                                                  |
| `capabilities`                                                                      | [components.PhoneCapabilities](../../models/components/phone-capabilities.md)       | :heavy_check_mark:                                                                  | N/A                                                                                 |                                                                                     |