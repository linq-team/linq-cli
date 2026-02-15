# VoiceMemo

## Example Usage

```typescript
import { VoiceMemo } from "@linqapp/sdk/models/components";

let value: VoiceMemo = {
  id: "69a37c7d-af4f-4b5e-af42-e28e98ce873a",
  from: "+12052535597",
  to: [
    "+12052532136",
  ],
  status: "queued",
  service: "iMessage",
  voiceMemo: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    url: "https://cdn.example.com/voice-memos/abc123.m4a",
    filename: "voice-memo.m4a",
    mimeType: "audio/x-m4a",
    sizeBytes: 524288,
    durationMs: 15000,
  },
  createdAt: new Date("2026-05-27T10:45:40.880Z"),
  chat: {
    id: "8a0be6da-044a-478c-b93a-4e8d5390fd67",
    handles: [],
    isGroup: true,
    service: "iMessage",
    isActive: false,
  },
};
```

## Fields

| Field                                                                                                            | Type                                                                                                             | Required                                                                                                         | Description                                                                                                      | Example                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `id`                                                                                                             | *string*                                                                                                         | :heavy_check_mark:                                                                                               | Message identifier                                                                                               | 69a37c7d-af4f-4b5e-af42-e28e98ce873a                                                                             |
| `from`                                                                                                           | *string*                                                                                                         | :heavy_check_mark:                                                                                               | Sender phone number                                                                                              | +12052535597                                                                                                     |
| `to`                                                                                                             | *string*[]                                                                                                       | :heavy_check_mark:                                                                                               | Recipient handles (phone numbers or email addresses)                                                             | [<br/>"+12052532136"<br/>]                                                                                       |
| `status`                                                                                                         | *string*                                                                                                         | :heavy_check_mark:                                                                                               | Current delivery status                                                                                          | queued                                                                                                           |
| `service`                                                                                                        | [components.SendVoiceMemoToChatResultService](../../models/components/send-voice-memo-to-chat-result-service.md) | :heavy_minus_sign:                                                                                               | Service used to send this voice memo                                                                             | iMessage                                                                                                         |
| `voiceMemo`                                                                                                      | [components.VoiceMemoAttachment](../../models/components/voice-memo-attachment.md)                               | :heavy_check_mark:                                                                                               | N/A                                                                                                              |                                                                                                                  |
| `createdAt`                                                                                                      | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)                    | :heavy_check_mark:                                                                                               | When the voice memo was created                                                                                  |                                                                                                                  |
| `chat`                                                                                                           | [components.ChatInfo](../../models/components/chat-info.md)                                                      | :heavy_check_mark:                                                                                               | N/A                                                                                                              |                                                                                                                  |