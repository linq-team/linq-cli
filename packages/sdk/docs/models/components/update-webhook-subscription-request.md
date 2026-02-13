# UpdateWebhookSubscriptionRequest

## Example Usage

```typescript
import { UpdateWebhookSubscriptionRequest } from "@linqapp/sdk/models/components";

let value: UpdateWebhookSubscriptionRequest = {
  targetUrl: "https://webhooks.example.com/linq/events",
  subscribedEvents: [
    "message.sent",
    "message.delivered",
  ],
  isActive: true,
};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    | Example                                                                        |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `targetUrl`                                                                    | *string*                                                                       | :heavy_minus_sign:                                                             | New target URL for webhook events                                              | https://webhooks.example.com/linq/events                                       |
| `subscribedEvents`                                                             | [components.WebhookEventType](../../models/components/webhook-event-type.md)[] | :heavy_minus_sign:                                                             | Updated list of event types to subscribe to                                    | [<br/>"message.sent",<br/>"message.delivered"<br/>]                            |
| `isActive`                                                                     | *boolean*                                                                      | :heavy_minus_sign:                                                             | Activate or deactivate the subscription                                        | true                                                                           |