# WebhookSubscriptionCreatedResponse

Response returned when creating a webhook subscription. Includes the signing secret which is only shown once.

## Example Usage

```typescript
import { WebhookSubscriptionCreatedResponse } from "@linqapp/sdk/models/components";

let value: WebhookSubscriptionCreatedResponse = {
  id: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
  targetUrl: "https://webhooks.example.com/linq/events",
  signingSecret: "whsec_abc123def456",
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
| `signingSecret`                                                                               | *string*                                                                                      | :heavy_check_mark:                                                                            | Secret for verifying webhook signatures. Store this securely - it cannot be retrieved again.  | whsec_abc123def456                                                                            |
| `subscribedEvents`                                                                            | [components.WebhookEventType](../../models/components/webhook-event-type.md)[]                | :heavy_check_mark:                                                                            | List of event types this subscription receives                                                | [<br/>"message.sent",<br/>"message.delivered",<br/>"message.read"<br/>]                       |
| `isActive`                                                                                    | *boolean*                                                                                     | :heavy_check_mark:                                                                            | Whether this subscription is currently active                                                 | true                                                                                          |
| `createdAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_check_mark:                                                                            | When the subscription was created                                                             | 2024-01-15T10:30:00Z                                                                          |
| `updatedAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_check_mark:                                                                            | When the subscription was last updated                                                        | 2024-01-15T10:30:00Z                                                                          |