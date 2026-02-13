# Chats

## Overview

A Chat is a conversation thread with one or more participants.

To begin a chat, you must create a Chat with at least one recipient handle.
Including multiple handles creates a group chat.

When creating a chat or sending messages, the `from` field specifies which of your
authorized phone numbers the message originates from. Your authentication token grants
access to one or more phone numbers, but the `from` field determines the actual sender.

**Handle Format:**
- Handles can be phone numbers or email addresses
- Phone numbers MUST be in E.164 format (starting with +)
- Phone format: `+[country code][subscriber number]`
- Example phone: `+12223334444` (US), `+442071234567` (UK), `+81312345678` (Japan)
- Example email: `user@example.com`
- No spaces, dashes, or parentheses in phone numbers


### Available Operations

* [createChat](#createchat) - Create a new chat
* [listChats](#listchats) - List all chats
* [getChat](#getchat) - Get a chat by ID
* [updateChat](#updatechat) - Update a chat
* [addParticipant](#addparticipant) - Add a participant to a chat
* [removeParticipant](#removeparticipant) - Remove a participant from a chat
* [startTyping](#starttyping) - Start typing indicator
* [stopTyping](#stoptyping) - Stop typing indicator
* [markChatAsRead](#markchatasread) - Mark chat as read
* [shareContactWithChat](#sharecontactwithchat) - Share your contact card with a chat

## createChat

Create a new chat with specified participants and send an initial message.
The initial message is required when creating a chat.

## Message Effects

You can add iMessage effects to make your messages more expressive. Effects are
optional and can be either screen effects (full-screen animations) or bubble effects
(message bubble animations).

**Screen Effects:** `confetti`, `fireworks`, `lasers`, `sparkles`, `celebration`,
`hearts`, `love`, `balloons`, `happy_birthday`, `echo`, `spotlight`

**Bubble Effects:** `slam`, `loud`, `gentle`, `invisible`

Only one effect type can be applied per message.


### Example Usage: chatWithConfettiEffect

<!-- UsageSnippet language="typescript" operationID="createChat" method="post" path="/v3/chats" example="chatWithConfettiEffect" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.chats.createChat({
    from: "+12052535597",
    to: [
      "+12052532136",
    ],
    message: {
      parts: [
        {
          type: "text",
          value: "Welcome aboard! 🎉",
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
import { chatsCreateChat } from "@linqapp/sdk/funcs/chats-create-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsCreateChat(linq, {
    from: "+12052535597",
    to: [
      "+12052532136",
    ],
    message: {
      parts: [
        {
          type: "text",
          value: "Welcome aboard! 🎉",
        },
      ],
      effect: {},
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatsCreateChat failed:", res.error);
  }
}

run();
```
### Example Usage: chatWithInvisibleInk

<!-- UsageSnippet language="typescript" operationID="createChat" method="post" path="/v3/chats" example="chatWithInvisibleInk" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.chats.createChat({
    from: "+12052535597",
    to: [
      "+12052532136",
    ],
    message: {
      parts: [
        {
          type: "text",
          value: "Here's a secret code: ABC123",
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
import { chatsCreateChat } from "@linqapp/sdk/funcs/chats-create-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsCreateChat(linq, {
    from: "+12052535597",
    to: [
      "+12052532136",
    ],
    message: {
      parts: [
        {
          type: "text",
          value: "Here's a secret code: ABC123",
        },
      ],
      effect: {},
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatsCreateChat failed:", res.error);
  }
}

run();
```
### Example Usage: chatWithMediaUrl

<!-- UsageSnippet language="typescript" operationID="createChat" method="post" path="/v3/chats" example="chatWithMediaUrl" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.chats.createChat({
    from: "+12052535597",
    to: [
      "+12052532136",
    ],
    message: {
      parts: [
        {
          type: "text",
          value: "Check out this image!",
        },
        {
          type: "media",
          url: "https://images.dog.ceo/breeds/terrier-cairn/n02096177_13328.jpg",
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
import { chatsCreateChat } from "@linqapp/sdk/funcs/chats-create-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsCreateChat(linq, {
    from: "+12052535597",
    to: [
      "+12052532136",
    ],
    message: {
      parts: [
        {
          type: "text",
          value: "Check out this image!",
        },
        {
          type: "media",
          url: "https://images.dog.ceo/breeds/terrier-cairn/n02096177_13328.jpg",
        },
      ],
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatsCreateChat failed:", res.error);
  }
}

run();
```
### Example Usage: chatWithPreuploadedMedia

<!-- UsageSnippet language="typescript" operationID="createChat" method="post" path="/v3/chats" example="chatWithPreuploadedMedia" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.chats.createChat({
    from: "+12052535597",
    to: [
      "+12052532136",
    ],
    message: {
      parts: [
        {
          type: "media",
          attachmentId: "550e8400-e29b-41d4-a716-446655440000",
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
import { chatsCreateChat } from "@linqapp/sdk/funcs/chats-create-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsCreateChat(linq, {
    from: "+12052535597",
    to: [
      "+12052532136",
    ],
    message: {
      parts: [
        {
          type: "media",
          attachmentId: "550e8400-e29b-41d4-a716-446655440000",
        },
      ],
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatsCreateChat failed:", res.error);
  }
}

run();
```
### Example Usage: chatWithTextMessage

<!-- UsageSnippet language="typescript" operationID="createChat" method="post" path="/v3/chats" example="chatWithTextMessage" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.chats.createChat({
    from: "+12052535597",
    to: [
      "+12052532136",
    ],
    message: {
      parts: [
        {
          type: "text",
          value: "Hello! How can I help you today?",
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
import { chatsCreateChat } from "@linqapp/sdk/funcs/chats-create-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsCreateChat(linq, {
    from: "+12052535597",
    to: [
      "+12052532136",
    ],
    message: {
      parts: [
        {
          type: "text",
          value: "Hello! How can I help you today?",
        },
      ],
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatsCreateChat failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [components.CreateChatRequest](../../models/components/create-chat-request.md)                                                                                                 | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.CreateChatResult](../../models/components/create-chat-result.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 400, 401                | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## listChats

Retrieves a paginated list of chats for the authenticated partner filtered by phone number.
Returns all chats involving the specified phone number with their participants and recent activity.

**Pagination:**
- Use `limit` to control page size (default: 20, max: 100)
- The response includes `next_cursor` for fetching the next page
- When `next_cursor` is `null`, there are no more results to fetch
- Pass the `next_cursor` value as the `cursor` parameter for the next request

**Example pagination flow:**
1. First request: `GET /v3/chats?from=%2B12223334444&limit=20`
2. Response includes `next_cursor: "20"` (more results exist)
3. Next request: `GET /v3/chats?from=%2B12223334444&limit=20&cursor=20`
4. Response includes `next_cursor: null` (no more results)


### Example Usage

<!-- UsageSnippet language="typescript" operationID="listChats" method="get" path="/v3/chats" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.chats.listChats("%2B13343284472", 20, "20");

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { chatsListChats } from "@linqapp/sdk/funcs/chats-list-chats.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsListChats(linq, "%2B13343284472", 20, "20");
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatsListChats failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `from`                                                                                                                                                                         | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Phone number to filter chats by. Returns all chats made from this phone number.<br/>Must be in E.164 format with the `+` sign URL-encoded as `%2B` (e.g., `%2B13343284472`).<br/> | %2B13343284472                                                                                                                                                                 |
| `limit`                                                                                                                                                                        | *number*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | Maximum number of chats to return per page                                                                                                                                     | 20                                                                                                                                                                             |
| `cursor`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | Pagination cursor from the previous response's `next_cursor` field.<br/>Omit this parameter for the first page of results.<br/>                                                | 20                                                                                                                                                                             |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[components.ListChatsResult](../../models/components/list-chats-result.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401                     | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## getChat

Retrieve a chat by its unique identifier.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="getChat" method="get" path="/v3/chats/{chatId}" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.chats.getChat("550e8400-e29b-41d4-a716-446655440000");

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { chatsGetChat } from "@linqapp/sdk/funcs/chats-get-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsGetChat(linq, "550e8400-e29b-41d4-a716-446655440000");
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatsGetChat failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chatId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the chat                                                                                                                                                  | 550e8400-e29b-41d4-a716-446655440000                                                                                                                                           |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[components.Chat](../../models/components/chat.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401, 404                | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## updateChat

Update chat properties such as display name and group chat icon.


### Example Usage: updateBoth

<!-- UsageSnippet language="typescript" operationID="updateChat" method="put" path="/v3/chats/{chatId}" example="updateBoth" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.chats.updateChat("550e8400-e29b-41d4-a716-446655440000", {
    displayName: "Team Discussion",
    groupChatIcon: "https://example.com/group-icon.png",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { chatsUpdateChat } from "@linqapp/sdk/funcs/chats-update-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsUpdateChat(linq, "550e8400-e29b-41d4-a716-446655440000", {
    displayName: "Team Discussion",
    groupChatIcon: "https://example.com/group-icon.png",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatsUpdateChat failed:", res.error);
  }
}

run();
```
### Example Usage: updateIcon

<!-- UsageSnippet language="typescript" operationID="updateChat" method="put" path="/v3/chats/{chatId}" example="updateIcon" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.chats.updateChat("550e8400-e29b-41d4-a716-446655440000", {
    groupChatIcon: "https://example.com/group-icon.png",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { chatsUpdateChat } from "@linqapp/sdk/funcs/chats-update-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsUpdateChat(linq, "550e8400-e29b-41d4-a716-446655440000", {
    groupChatIcon: "https://example.com/group-icon.png",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatsUpdateChat failed:", res.error);
  }
}

run();
```
### Example Usage: updateName

<!-- UsageSnippet language="typescript" operationID="updateChat" method="put" path="/v3/chats/{chatId}" example="updateName" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.chats.updateChat("550e8400-e29b-41d4-a716-446655440000", {
    displayName: "Team Discussion",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { chatsUpdateChat } from "@linqapp/sdk/funcs/chats-update-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsUpdateChat(linq, "550e8400-e29b-41d4-a716-446655440000", {
    displayName: "Team Discussion",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatsUpdateChat failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chatId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the chat                                                                                                                                                  | 550e8400-e29b-41d4-a716-446655440000                                                                                                                                           |
| `body`                                                                                                                                                                         | [components.UpdateChatRequest](../../models/components/update-chat-request.md)                                                                                                 | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |                                                                                                                                                                                |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[components.Chat](../../models/components/chat.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 400, 401, 404           | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## addParticipant

Add a new participant to an existing group chat.

**Requirements:**
- Group chats only (3+ existing participants)
- New participant must support the same messaging service as the group
- Cross-service additions not allowed (e.g., can't add RCS-only user to iMessage group)
- For cross-service scenarios, create a new chat instead


### Example Usage

<!-- UsageSnippet language="typescript" operationID="addParticipant" method="post" path="/v3/chats/{chatId}/participants" example="addUser" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.chats.addParticipant("550e8400-e29b-41d4-a716-446655440000", {
    handle: "+12052499136",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { chatsAddParticipant } from "@linqapp/sdk/funcs/chats-add-participant.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsAddParticipant(linq, "550e8400-e29b-41d4-a716-446655440000", {
    handle: "+12052499136",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatsAddParticipant failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chatId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the chat                                                                                                                                                  | 550e8400-e29b-41d4-a716-446655440000                                                                                                                                           |
| `body`                                                                                                                                                                         | [components.AddParticipantRequest](../../models/components/add-participant-request.md)                                                                                         | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |                                                                                                                                                                                |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[operations.AddParticipantResponse](../../models/operations/add-participant-response.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 400, 401, 404           | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## removeParticipant

Remove a participant from an existing group chat.

**Requirements:**
- Group chats only
- Must have 3+ participants after removal


### Example Usage

<!-- UsageSnippet language="typescript" operationID="removeParticipant" method="delete" path="/v3/chats/{chatId}/participants" example="removeUser" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.chats.removeParticipant("550e8400-e29b-41d4-a716-446655440000", {
    handle: "+12052499136",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { chatsRemoveParticipant } from "@linqapp/sdk/funcs/chats-remove-participant.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsRemoveParticipant(linq, "550e8400-e29b-41d4-a716-446655440000", {
    handle: "+12052499136",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatsRemoveParticipant failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chatId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the chat                                                                                                                                                  | 550e8400-e29b-41d4-a716-446655440000                                                                                                                                           |
| `body`                                                                                                                                                                         | [components.RemoveParticipantRequest](../../models/components/remove-participant-request.md)                                                                                   | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |                                                                                                                                                                                |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[operations.RemoveParticipantResponse](../../models/operations/remove-participant-response.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 400, 401, 404           | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## startTyping

Send a typing indicator to show that someone is typing in the chat.

**Note:** Group chat typing indicators are not currently supported.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="startTyping" method="post" path="/v3/chats/{chatId}/typing" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  await linq.chats.startTyping("550e8400-e29b-41d4-a716-446655440000");


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { chatsStartTyping } from "@linqapp/sdk/funcs/chats-start-typing.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsStartTyping(linq, "550e8400-e29b-41d4-a716-446655440000");
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("chatsStartTyping failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chatId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the chat                                                                                                                                                  | 550e8400-e29b-41d4-a716-446655440000                                                                                                                                           |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<void\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401, 404                | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## stopTyping

Stop the typing indicator for the chat.

**Note:** Typing indicators are automatically stopped when a message is sent,
so calling this endpoint after sending a message is unnecessary.

**Note:** Group chat typing indicators are not currently supported.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="stopTyping" method="delete" path="/v3/chats/{chatId}/typing" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  await linq.chats.stopTyping("550e8400-e29b-41d4-a716-446655440000");


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { chatsStopTyping } from "@linqapp/sdk/funcs/chats-stop-typing.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsStopTyping(linq, "550e8400-e29b-41d4-a716-446655440000");
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("chatsStopTyping failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chatId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the chat                                                                                                                                                  | 550e8400-e29b-41d4-a716-446655440000                                                                                                                                           |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<void\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401, 404                | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## markChatAsRead

Mark all messages in a chat as read.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="markChatAsRead" method="post" path="/v3/chats/{chatId}/read" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  await linq.chats.markChatAsRead("a6dc4555-eac0-4e05-99ad-918e915f18a3");


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { chatsMarkChatAsRead } from "@linqapp/sdk/funcs/chats-mark-chat-as-read.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsMarkChatAsRead(linq, "a6dc4555-eac0-4e05-99ad-918e915f18a3");
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("chatsMarkChatAsRead failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chatId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the chat                                                                                                                                                  |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401, 404                | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## shareContactWithChat

Share your contact information (Name and Photo Sharing) with a chat.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="shareContactWithChat" method="post" path="/v3/chats/{chatId}/share_contact_card" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  await linq.chats.shareContactWithChat("ac71239d-af51-4229-bada-9a772641a88c");


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { chatsShareContactWithChat } from "@linqapp/sdk/funcs/chats-share-contact-with-chat.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await chatsShareContactWithChat(linq, "ac71239d-af51-4229-bada-9a772641a88c");
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("chatsShareContactWithChat failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chatId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the chat                                                                                                                                                  |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401, 404                | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |