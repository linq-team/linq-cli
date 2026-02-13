# UpdateWebhookSubscriptionRequest

## Example Usage

```typescript
import { UpdateWebhookSubscriptionRequest } from "@linqapp/sdk/models/operations";

let value: UpdateWebhookSubscriptionRequest = {
  subscriptionId: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  body: {
    targetUrl: "https://webhooks.example.com/linq/events",
    subscribedEvents: [
      "message.sent",
      "message.delivered",
    ],
    isActive: true,
  },
};
```

## Fields

| Field                                                                                                         | Type                                                                                                          | Required                                                                                                      | Description                                                                                                   | Example                                                                                                       |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `subscriptionId`                                                                                              | *string*                                                                                                      | :heavy_check_mark:                                                                                            | Unique identifier of the webhook subscription                                                                 | b2c3d4e5-f6a7-8901-bcde-f23456789012                                                                          |
| `body`                                                                                                        | [components.UpdateWebhookSubscriptionRequest](../../models/components/update-webhook-subscription-request.md) | :heavy_check_mark:                                                                                            | N/A                                                                                                           |                                                                                                               |