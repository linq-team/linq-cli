# Messages

## Overview

Messages are individual text or multimedia communications within a chat thread.

Messages can include text, attachments, special effects (like confetti or fireworks),
and reactions. All messages are associated with a specific chat and sent from a
phone number you own.

Messages support delivery status tracking, read receipts, and editing capabilities.


### Available Operations

* [sendMessageToChat](#sendmessagetochat) - Send a message to an existing chat
* [getMessages](#getmessages) - Get messages from a chat
* [getMessageThread](#getmessagethread) - Get all messages in a thread
* [sendVoiceMemoToChat](#sendvoicememotochat) - Send a voice memo to a chat
* [getMessage](#getmessage) - Get a message by ID
* [deleteMessage](#deletemessage) - Delete a message from system
* [sendReaction](#sendreaction) - Add or remove a reaction to a message

## sendMessageToChat

Send a message to an existing chat. Use this endpoint when you already have
a chat ID and want to send additional messages to it.

## Message Effects

You can add iMessage effects to make your messages more expressive. Effects are
optional and can be either screen effects (full-screen animations) or bubble effects
(message bubble animations).

**Screen Effects:** `confetti`, `fireworks`, `lasers`, `sparkles`, `celebration`,
`hearts`, `love`, `balloons`, `happy_birthday`, `echo`, `spotlight`

**Bubble Effects:** `slam`, `loud`, `gentle`, `invisible`

Only one effect type can be applied per message.


### Example Usage: simple_text

<!-- UsageSnippet language="typescript" operationID="sendMessageToChat" method="post" path="/v3/chats/{chatId}/messages" example="simple_text" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.messages.sendMessageToChat("550e8400-e29b-41d4-a716-446655440000", {
    message: {
      parts: [
        {
          type: "text",
          value: "Hello, world!",
        },
      ],
    },
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { messagesSendMessageToChat } from "@linqapp/sdk/funcs/messages-send-message-to-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await messagesSendMessageToChat(linq, "550e8400-e29b-41d4-a716-446655440000", {
    message: {
      parts: [
        {
          type: "text",
          value: "Hello, world!",
        },
      ],
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendMessageToChat failed:", res.error);
  }
}

run();
```
### Example Usage: with_confetti

<!-- UsageSnippet language="typescript" operationID="sendMessageToChat" method="post" path="/v3/chats/{chatId}/messages" example="with_confetti" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.messages.sendMessageToChat("550e8400-e29b-41d4-a716-446655440000", {
    message: {
      parts: [
        {
          type: "text",
          value: "Congratulations! 🎉",
        },
      ],
      effect: {},
    },
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { messagesSendMessageToChat } from "@linqapp/sdk/funcs/messages-send-message-to-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await messagesSendMessageToChat(linq, "550e8400-e29b-41d4-a716-446655440000", {
    message: {
      parts: [
        {
          type: "text",
          value: "Congratulations! 🎉",
        },
      ],
      effect: {},
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendMessageToChat failed:", res.error);
  }
}

run();
```
### Example Usage: with_invisible_ink

<!-- UsageSnippet language="typescript" operationID="sendMessageToChat" method="post" path="/v3/chats/{chatId}/messages" example="with_invisible_ink" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.messages.sendMessageToChat("550e8400-e29b-41d4-a716-446655440000", {
    message: {
      parts: [
        {
          type: "text",
          value: "This is a secret message",
        },
      ],
      effect: {},
    },
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { messagesSendMessageToChat } from "@linqapp/sdk/funcs/messages-send-message-to-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await messagesSendMessageToChat(linq, "550e8400-e29b-41d4-a716-446655440000", {
    message: {
      parts: [
        {
          type: "text",
          value: "This is a secret message",
        },
      ],
      effect: {},
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendMessageToChat failed:", res.error);
  }
}

run();
```
### Example Usage: with_slam

<!-- UsageSnippet language="typescript" operationID="sendMessageToChat" method="post" path="/v3/chats/{chatId}/messages" example="with_slam" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.messages.sendMessageToChat("550e8400-e29b-41d4-a716-446655440000", {
    message: {
      parts: [
        {
          type: "text",
          value: "BOOM!",
        },
      ],
      effect: {},
    },
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { messagesSendMessageToChat } from "@linqapp/sdk/funcs/messages-send-message-to-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await messagesSendMessageToChat(linq, "550e8400-e29b-41d4-a716-446655440000", {
    message: {
      parts: [
        {
          type: "text",
          value: "BOOM!",
        },
      ],
      effect: {},
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendMessageToChat failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chatId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the chat                                                                                                                                                  | 550e8400-e29b-41d4-a716-446655440000                                                                                                                                           |
| `body`                                                                                                                                                                         | [components.SendMessageToChatRequest](../../models/components/send-message-to-chat-request.md)                                                                                 | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |                                                                                                                                                                                |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[components.SendMessageResponse](../../models/components/send-message-response.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 400, 401, 404           | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## getMessages

Retrieve messages from a specific chat with pagination support.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="getMessages" method="get" path="/v3/chats/{chatId}/messages" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.messages.getMessages("550e8400-e29b-41d4-a716-446655440000");

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { messagesGetMessages } from "@linqapp/sdk/funcs/messages-get-messages.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await messagesGetMessages(linq, "550e8400-e29b-41d4-a716-446655440000");
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesGetMessages failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chatId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the chat                                                                                                                                                  | 550e8400-e29b-41d4-a716-446655440000                                                                                                                                           |
| `cursor`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | Pagination cursor from previous next_cursor response                                                                                                                           |                                                                                                                                                                                |
| `limit`                                                                                                                                                                        | *number*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | Maximum number of messages to return                                                                                                                                           |                                                                                                                                                                                |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[components.GetMessagesResult](../../models/components/get-messages-result.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401, 404                | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## getMessageThread

Retrieve all messages in a conversation thread. Given any message ID in the thread,
returns the originator message and all replies in chronological order.

If the message is not part of a thread, returns just that single message.

Supports pagination and configurable ordering.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="getMessageThread" method="get" path="/v3/messages/{messageId}/thread" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.messages.getMessageThread("69a37c7d-af4f-4b5e-af42-e28e98ce873a");

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { messagesGetMessageThread } from "@linqapp/sdk/funcs/messages-get-message-thread.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await messagesGetMessageThread(linq, "69a37c7d-af4f-4b5e-af42-e28e98ce873a");
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesGetMessageThread failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `messageId`                                                                                                                                                                    | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | ID of any message in the thread (can be originator or any reply)                                                                                                               | 69a37c7d-af4f-4b5e-af42-e28e98ce873a                                                                                                                                           |
| `cursor`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | Pagination cursor from previous next_cursor response                                                                                                                           |                                                                                                                                                                                |
| `limit`                                                                                                                                                                        | *number*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | Maximum number of messages to return                                                                                                                                           |                                                                                                                                                                                |
| `order`                                                                                                                                                                        | [operations.Order](../../models/operations/order.md)                                                                                                                           | :heavy_minus_sign:                                                                                                                                                             | Sort order for messages (asc = oldest first, desc = newest first)                                                                                                              |                                                                                                                                                                                |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[components.GetThreadResponse](../../models/components/get-thread-response.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401, 404                | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## sendVoiceMemoToChat

Send a voice memo to all participants in a chat. Voice memos MUST be sent alone without text
or other attachments.

**Supported audio formats:**
- MP3 (audio/mpeg)
- M4A (audio/x-m4a, audio/mp4)
- AAC (audio/aac)
- CAF (audio/x-caf) - Core Audio Format
- WAV (audio/wav)
- AIFF (audio/aiff, audio/x-aiff)
- AMR (audio/amr)


### Example Usage

<!-- UsageSnippet language="typescript" operationID="sendVoiceMemoToChat" method="post" path="/v3/chats/{chatId}/voicememo" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.messages.sendVoiceMemoToChat("f19ee7b8-8533-4c5c-83ec-4ef8d6d1ddbd", {
    from: "+12052535597",
    voiceMemoUrl: "https://example.com/voice-memo.m4a",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { messagesSendVoiceMemoToChat } from "@linqapp/sdk/funcs/messages-send-voice-memo-to-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await messagesSendVoiceMemoToChat(linq, "f19ee7b8-8533-4c5c-83ec-4ef8d6d1ddbd", {
    from: "+12052535597",
    voiceMemoUrl: "https://example.com/voice-memo.m4a",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendVoiceMemoToChat failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chatId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the chat                                                                                                                                                  | f19ee7b8-8533-4c5c-83ec-4ef8d6d1ddbd                                                                                                                                           |
| `body`                                                                                                                                                                         | [components.SendVoiceMemoToChatRequest](../../models/components/send-voice-memo-to-chat-request.md)                                                                            | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |                                                                                                                                                                                |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[components.SendVoiceMemoToChatResult](../../models/components/send-voice-memo-to-chat-result.md)\>**

### Errors

| Error Type                   | Status Code                  | Content Type                 |
| ---------------------------- | ---------------------------- | ---------------------------- |
| errors.ErrorResponse         | 400, 401, 403, 404, 413, 422 | application/json             |
| errors.ErrorResponse         | 500                          | application/json             |
| errors.LinqDefaultError      | 4XX, 5XX                     | \*/\*                        |

## getMessage

Retrieve a specific message by its ID. This endpoint returns the full message
details including text, attachments, reactions, and metadata.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="getMessage" method="get" path="/v3/messages/{messageId}" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.messages.getMessage("69a37c7d-af4f-4b5e-af42-e28e98ce873a");

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { messagesGetMessage } from "@linqapp/sdk/funcs/messages-get-message.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await messagesGetMessage(linq, "69a37c7d-af4f-4b5e-af42-e28e98ce873a");
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesGetMessage failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `messageId`                                                                                                                                                                    | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the message to retrieve                                                                                                                                   | 69a37c7d-af4f-4b5e-af42-e28e98ce873a                                                                                                                                           |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[components.Message](../../models/components/message.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401, 403, 404           | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## deleteMessage

Deletes a message from the Linq API only. This does NOT unsend or remove the message
from the actual chat - recipients will still see the message.

Use this endpoint to remove messages from your records and prevent them from appearing
in API responses.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="deleteMessage" method="delete" path="/v3/messages/{messageId}" example="deleteMessage" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  await linq.messages.deleteMessage("69a37c7d-af4f-4b5e-af42-e28e98ce873a", {
    chatId: "94c6bf33-31d9-40e3-a0e9-f94250ecedb9",
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { messagesDeleteMessage } from "@linqapp/sdk/funcs/messages-delete-message.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await messagesDeleteMessage(linq, "69a37c7d-af4f-4b5e-af42-e28e98ce873a", {
    chatId: "94c6bf33-31d9-40e3-a0e9-f94250ecedb9",
  });
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("messagesDeleteMessage failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `messageId`                                                                                                                                                                    | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the message to delete                                                                                                                                     | 69a37c7d-af4f-4b5e-af42-e28e98ce873a                                                                                                                                           |
| `body`                                                                                                                                                                         | [components.DeleteMessageRequest](../../models/components/delete-message-request.md)                                                                                           | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |                                                                                                                                                                                |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<void\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 400, 401, 404           | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## sendReaction

Add or remove emoji reactions to messages. Reactions let users express
their response to a message without sending a new message.

**Supported Reactions:**
- love ❤️
- like 👍
- dislike 👎
- laugh 😂
- emphasize ‼️
- question ❓
- custom - any emoji (use `custom_emoji` field to specify)


### Example Usage: addLove

<!-- UsageSnippet language="typescript" operationID="sendReaction" method="post" path="/v3/messages/{messageId}/reactions" example="addLove" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.messages.sendReaction("69a37c7d-af4f-4b5e-af42-e28e98ce873a", {
    operation: "add",
    type: "love",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { messagesSendReaction } from "@linqapp/sdk/funcs/messages-send-reaction.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await messagesSendReaction(linq, "69a37c7d-af4f-4b5e-af42-e28e98ce873a", {
    operation: "add",
    type: "love",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendReaction failed:", res.error);
  }
}

run();
```
### Example Usage: reactToMessagePart

<!-- UsageSnippet language="typescript" operationID="sendReaction" method="post" path="/v3/messages/{messageId}/reactions" example="reactToMessagePart" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.messages.sendReaction("69a37c7d-af4f-4b5e-af42-e28e98ce873a", {
    operation: "add",
    type: "laugh",
    partIndex: 1,
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { messagesSendReaction } from "@linqapp/sdk/funcs/messages-send-reaction.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await messagesSendReaction(linq, "69a37c7d-af4f-4b5e-af42-e28e98ce873a", {
    operation: "add",
    type: "laugh",
    partIndex: 1,
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendReaction failed:", res.error);
  }
}

run();
```
### Example Usage: removeLike

<!-- UsageSnippet language="typescript" operationID="sendReaction" method="post" path="/v3/messages/{messageId}/reactions" example="removeLike" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.messages.sendReaction("69a37c7d-af4f-4b5e-af42-e28e98ce873a", {
    operation: "remove",
    type: "like",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { messagesSendReaction } from "@linqapp/sdk/funcs/messages-send-reaction.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await messagesSendReaction(linq, "69a37c7d-af4f-4b5e-af42-e28e98ce873a", {
    operation: "remove",
    type: "like",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("messagesSendReaction failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `messageId`                                                                                                                                                                    | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the message to react to                                                                                                                                   | 69a37c7d-af4f-4b5e-af42-e28e98ce873a                                                                                                                                           |
| `body`                                                                                                                                                                         | [components.SendReactionRequest](../../models/components/send-reaction-request.md)                                                                                             | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |                                                                                                                                                                                |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[components.Reaction](../../models/components/reaction.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 400, 401                | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |