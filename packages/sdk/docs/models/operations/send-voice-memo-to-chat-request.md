# SendVoiceMemoToChatRequest

## Example Usage

```typescript
import { SendVoiceMemoToChatRequest } from "@linqapp/sdk/models/operations";

let value: SendVoiceMemoToChatRequest = {
  chatId: "f19ee7b8-8533-4c5c-83ec-4ef8d6d1ddbd",
  body: {
    from: "+12052535597",
    voiceMemoUrl: "https://example.com/voice-memo.m4a",
  },
};
```

## Fields

| Field                                                                                               | Type                                                                                                | Required                                                                                            | Description                                                                                         | Example                                                                                             |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `chatId`                                                                                            | *string*                                                                                            | :heavy_check_mark:                                                                                  | Unique identifier of the chat                                                                       | f19ee7b8-8533-4c5c-83ec-4ef8d6d1ddbd                                                                |
| `body`                                                                                              | [components.SendVoiceMemoToChatRequest](../../models/components/send-voice-memo-to-chat-request.md) | :heavy_check_mark:                                                                                  | N/A                                                                                                 |                                                                                                     |