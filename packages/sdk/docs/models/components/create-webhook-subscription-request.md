# CreateWebhookSubscriptionRequest

## Example Usage

```typescript
import { CreateWebhookSubscriptionRequest } from "@linqapp/sdk/models/components";

let value: CreateWebhookSubscriptionRequest = {
  targetUrl: "https://webhooks.example.com/linq/events",
  subscribedEvents: [
    "message.sent",
    "message.delivered",
  ],
};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    | Example                                                                        |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `targetUrl`                                                                    | *string*                                                                       | :heavy_check_mark:                                                             | URL where webhook events will be sent. Must be HTTPS.                          | https://webhooks.example.com/linq/events                                       |
| `subscribedEvents`                                                             | [components.WebhookEventType](../../models/components/webhook-event-type.md)[] | :heavy_check_mark:                                                             | List of event types to subscribe to                                            | [<br/>"message.sent",<br/>"message.delivered"<br/>]                            |