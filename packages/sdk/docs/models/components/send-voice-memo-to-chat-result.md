# SendVoiceMemoToChatResult

Response for sending a voice memo to a chat

## Example Usage

```typescript
import { SendVoiceMemoToChatResult } from "@linqapp/sdk/models/components";

let value: SendVoiceMemoToChatResult = {
  voiceMemo: {
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
    createdAt: new Date("2025-08-24T09:15:00.491Z"),
    chat: {
      id: "8a0be6da-044a-478c-b93a-4e8d5390fd67",
      handles: [],
      isGroup: true,
      service: "iMessage",
      isActive: false,
    },
  },
};
```

## Fields

| Field                                                         | Type                                                          | Required                                                      | Description                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| `voiceMemo`                                                   | [components.VoiceMemo](../../models/components/voice-memo.md) | :heavy_check_mark:                                            | N/A                                                           |