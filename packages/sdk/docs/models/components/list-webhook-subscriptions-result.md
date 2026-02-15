# ListWebhookSubscriptionsResult

## Example Usage

```typescript
import { ListWebhookSubscriptionsResult } from "@linqapp/sdk/models/components";

let value: ListWebhookSubscriptionsResult = {
  subscriptions: [
    {
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
    },
  ],
};
```

## Fields

| Field                                                                                                | Type                                                                                                 | Required                                                                                             | Description                                                                                          |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `subscriptions`                                                                                      | [components.WebhookSubscriptionResponse](../../models/components/webhook-subscription-response.md)[] | :heavy_check_mark:                                                                                   | List of webhook subscriptions                                                                        |