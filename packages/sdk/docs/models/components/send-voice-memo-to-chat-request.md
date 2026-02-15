# SendVoiceMemoToChatRequest

Request to send a voice memo to a chat (chat_id provided in path)

## Example Usage

```typescript
import { SendVoiceMemoToChatRequest } from "@linqapp/sdk/models/components";

let value: SendVoiceMemoToChatRequest = {
  from: "+12052535597",
  voiceMemoUrl: "https://example.com/voice-memo.m4a",
};
```

## Fields

| Field                                                                      | Type                                                                       | Required                                                                   | Description                                                                | Example                                                                    |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `from`                                                                     | *string*                                                                   | :heavy_check_mark:                                                         | Sender phone number in E.164 format                                        | +12052535597                                                               |
| `voiceMemoUrl`                                                             | *string*                                                                   | :heavy_check_mark:                                                         | URL of the voice memo audio file. Must be a publicly accessible HTTPS URL. | https://example.com/voice-memo.m4a                                         |