# ParticipantRemovedEventParticipant

The removed participant as a full handle object

## Example Usage

```typescript
import { ParticipantRemovedEventParticipant } from "@linqapp/sdk/models/components";

let value: ParticipantRemovedEventParticipant = {
  id: "550e8400-e29b-41d4-a716-446655440011",
  handle: "+14155559876",
  service: "iMessage",
  status: "removed",
  joinedAt: new Date("2025-11-23T17:30:00.000Z"),
  leftAt: new Date("2025-11-23T17:45:00.000Z"),
  isMe: false,
};
```

## Fields

| Field                                                                                                     | Type                                                                                                      | Required                                                                                                  | Description                                                                                               | Example                                                                                                   |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `id`                                                                                                      | *string*                                                                                                  | :heavy_check_mark:                                                                                        | Unique identifier for this handle                                                                         | 550e8400-e29b-41d4-a716-446655440000                                                                      |
| `handle`                                                                                                  | *string*                                                                                                  | :heavy_check_mark:                                                                                        | Phone number (E.164) or email address of the participant                                                  | +15551234567                                                                                              |
| `service`                                                                                                 | [components.ParticipantRemovedEventService](../../models/components/participant-removed-event-service.md) | :heavy_check_mark:                                                                                        | Service type (iMessage, SMS, RCS, etc.)                                                                   | iMessage                                                                                                  |
| `status`                                                                                                  | [components.ParticipantRemovedEventStatus](../../models/components/participant-removed-event-status.md)   | :heavy_minus_sign:                                                                                        | Participant status                                                                                        |                                                                                                           |
| `joinedAt`                                                                                                | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)             | :heavy_check_mark:                                                                                        | When this participant joined the chat                                                                     | 2025-05-21T15:30:00.000-05:00                                                                             |
| `leftAt`                                                                                                  | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)             | :heavy_minus_sign:                                                                                        | When they left (if applicable)                                                                            |                                                                                                           |
| `isMe`                                                                                                    | *boolean*                                                                                                 | :heavy_minus_sign:                                                                                        | Whether this handle belongs to the sender (your phone number)                                             | false                                                                                                     |