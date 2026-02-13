# VoiceMemoAttachment

## Example Usage

```typescript
import { VoiceMemoAttachment } from "@linqapp/sdk/models/components";

let value: VoiceMemoAttachment = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  url: "https://cdn.example.com/voice-memos/abc123.m4a",
  filename: "voice-memo.m4a",
  mimeType: "audio/x-m4a",
  sizeBytes: 524288,
  durationMs: 15000,
};
```

## Fields

| Field                                          | Type                                           | Required                                       | Description                                    | Example                                        |
| ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| `id`                                           | *string*                                       | :heavy_check_mark:                             | Attachment identifier                          | 550e8400-e29b-41d4-a716-446655440000           |
| `url`                                          | *string*                                       | :heavy_check_mark:                             | CDN URL for downloading the voice memo         | https://cdn.example.com/voice-memos/abc123.m4a |
| `filename`                                     | *string*                                       | :heavy_check_mark:                             | Original filename                              | voice-memo.m4a                                 |
| `mimeType`                                     | *string*                                       | :heavy_check_mark:                             | Audio MIME type                                | audio/x-m4a                                    |
| `sizeBytes`                                    | *number*                                       | :heavy_check_mark:                             | File size in bytes                             | 524288                                         |
| `durationMs`                                   | *number*                                       | :heavy_minus_sign:                             | Duration in milliseconds                       | 15000                                          |