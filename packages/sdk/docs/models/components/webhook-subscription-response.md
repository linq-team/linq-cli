# WebhookSubscriptionResponse

## Example Usage

```typescript
import { WebhookSubscriptionResponse } from "@linqapp/sdk/models/components";

let value: WebhookSubscriptionResponse = {
  id: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  targetUrl: "https://webhooks.example.com/linq/events",
  subscribedEvents: [
    "message.sent",
    "message.delivered",
    "message.read",
  ],
  isActive: true,
  createdAt: new Date("2024-01-15T10:30:00Z"),
  updatedAt: new Date("2024-01-15T10:30:00Z"),
};
```

## Fields

| Field                                                                                         | Type                                                                                          | Required                                                                                      | Description                                                                                   | Example                                                                                       |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `id`                                                                                          | *string*                                                                                      | :heavy_check_mark:                                                                            | Unique identifier for the webhook subscription                                                | b2c3d4e5-f6a7-8901-bcde-f23456789012                                                          |
| `targetUrl`                                                                                   | *string*                                                                                      | :heavy_check_mark:                                                                            | URL where webhook events will be sent                                                         | https://webhooks.example.com/linq/events                                                      |
| `subscribedEvents`                                                                            | [components.WebhookEventType](../../models/components/webhook-event-type.md)[]                | :heavy_check_mark:                                                                            | List of event types this subscription receives                                                | [<br/>"message.sent",<br/>"message.delivered",<br/>"message.read"<br/>]                       |
| `isActive`                                                                                    | *boolean*                                                                                     | :heavy_check_mark:                                                                            | Whether this subscription is currently active                                                 | true                                                                                          |
| `createdAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_check_mark:                                                                            | When the subscription was created                                                             | 2024-01-15T10:30:00Z                                                                          |
| `updatedAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_check_mark:                                                                            | When the subscription was last updated                                                        | 2024-01-15T10:30:00Z                                                                          |