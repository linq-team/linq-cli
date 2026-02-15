# WebhookEventsResult

## Example Usage

```typescript
import { WebhookEventsResult } from "@linqapp/sdk/models/components";

let value: WebhookEventsResult = {
  events: [
    "message.read",
  ],
  docUrl: "https://apidocs.linqapp.com/documentation/webhook-events",
};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `events`                                                                       | [components.WebhookEventType](../../models/components/webhook-event-type.md)[] | :heavy_check_mark:                                                             | List of all available webhook event types                                      |
| `docUrl`                                                                       | *"https://apidocs.linqapp.com/documentation/webhook-events"*                   | :heavy_check_mark:                                                             | URL to the webhook events documentation                                        |