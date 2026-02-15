# @linqapp/sdk

Developer-friendly & type-safe Typescript SDK specifically catered to leverage *@linqapp/sdk* API.

[![Built by Speakeasy](https://img.shields.io/badge/Built_by-SPEAKEASY-374151?style=for-the-badge&labelColor=f3f4f6)](https://www.speakeasy.com/?utm_source=@linqapp/sdk&utm_campaign=typescript)
[![License: MIT](https://img.shields.io/badge/LICENSE_//_MIT-3b5bdb?style=for-the-badge&labelColor=eff6ff)](https://opensource.org/licenses/MIT)


<br /><br />
> [!IMPORTANT]
> This SDK is not yet ready for production use. To complete setup please follow the steps outlined in your [workspace](https://app.speakeasy.com/org/linq/linq-sdk). Delete this section before > publishing to a package manager.

<!-- Start Summary [summary] -->
## Summary

Linq Partner API: The Linq Partner API enables you to send and receive iMessages programmatically at scale. Build powerful messaging experiences, automate conversations, and integrate iMessage infrastructure directly into your applications.

Messages are sent through Apple's iMessage protocol using real devices, ensuring full compatibility with all iMessage features including read receipts, typing indicators, reactions, and rich media attachments.

## Getting Started

All API requests require authentication via the `Authorization: Bearer` header. Your bearer token determines which phone numbers you can send from and which data you can access.

```bash
curl https://api.linqapp.com/api/partner/v3/chats \
  -H "Authorization: Bearer your_token_here"
```

## Key Concepts

- **Chats**: Conversation threads with one or more participants
- **Messages**: Individual messages within a chat, supporting text, attachments, effects, and reactions
- **Participants**: Phone numbers or email addresses involved in a conversation
- **Attachments**: Files (images, videos, documents, audio) sent with messages
- **Webhooks**: Real-time notifications for incoming messages, reactions, and events

## Trace Context (OpenTelemetry)

The Linq API supports [W3C Trace Context](https://www.w3.org/TR/trace-context/) for distributed tracing. All API responses include a `trace_id` field that can be used for debugging and support requests.

Linq generates a new trace context for each incoming request. Any standardized `traceparent` or `tracestate` headers you provide will be ignored and replaced with a server-generated trace ID. This is by design per the W3C specification's security recommendations for public APIs acting as trust boundaries.
If you need to correlate multiple API requests on your end, we recommend:
  - Using our `trace_id` returned in each API response
  - Maintaining your own correlation ID and storing a mapping to our trace IDs
  - Add your own custom headers as needed
<!-- End Summary [summary] -->

<!-- Start Table of Contents [toc] -->
## Table of Contents
<!-- $toc-max-depth=2 -->
* [@linqapp/sdk](#linqappsdk)
  * [Getting Started](#getting-started)
  * [Key Concepts](#key-concepts)
  * [Trace Context (OpenTelemetry)](#trace-context-opentelemetry)
  * [SDK Installation](#sdk-installation)
  * [Requirements](#requirements)
  * [SDK Example Usage](#sdk-example-usage)
  * [Authentication](#authentication)
  * [Available Resources and Operations](#available-resources-and-operations)
  * [Standalone functions](#standalone-functions)
  * [Retries](#retries)
  * [Error Handling](#error-handling)
  * [Server Selection](#server-selection)
  * [Custom HTTP Client](#custom-http-client)
  * [Debugging](#debugging)
* [Development](#development)
  * [Maturity](#maturity)
  * [Contributions](#contributions)

<!-- End Table of Contents [toc] -->

<!-- Start SDK Installation [installation] -->
## SDK Installation

> [!TIP]
> To finish publishing your SDK to npm and others you must [run your first generation action](https://www.speakeasy.com/docs/github-setup#step-by-step-guide).


The SDK can be installed with either [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [bun](https://bun.sh/) or [yarn](https://classic.yarnpkg.com/en/) package managers.

### NPM

```bash
npm add <UNSET>
```

### PNPM

```bash
pnpm add <UNSET>
```

### Bun

```bash
bun add <UNSET>
```

### Yarn

```bash
yarn add <UNSET>
```

> [!NOTE]
> This package is published as an ES Module (ESM) only. For applications using
> CommonJS, use `await import()` to import and use this package.
<!-- End SDK Installation [installation] -->

<!-- Start Requirements [requirements] -->
## Requirements

For supported JavaScript runtimes, please consult [RUNTIMES.md](RUNTIMES.md).
<!-- End Requirements [requirements] -->

<!-- Start SDK Example Usage [usage] -->
## SDK Example Usage

### Example

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
<!-- End SDK Example Usage [usage] -->

<!-- Start Authentication [security] -->
## Authentication

### Per-Client Security Schemes

This SDK supports the following security scheme globally:

| Name         | Type | Scheme      |
| ------------ | ---- | ----------- |
| `bearerAuth` | http | HTTP Bearer |

To authenticate with the API the `bearerAuth` parameter must be set when initializing the SDK client instance. For example:
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
<!-- End Authentication [security] -->

<!-- Start Available Resources and Operations [operations] -->
## Available Resources and Operations

<details open>
<summary>Available methods</summary>

### [Attachments](docs/sdks/attachments/README.md)

* [requestUpload](docs/sdks/attachments/README.md#requestupload) - Pre-upload a file
* [getAttachment](docs/sdks/attachments/README.md#getattachment) - Get attachment metadata

### [Chats](docs/sdks/chats/README.md)

* [createChat](docs/sdks/chats/README.md#createchat) - Create a new chat
* [listChats](docs/sdks/chats/README.md#listchats) - List all chats
* [getChat](docs/sdks/chats/README.md#getchat) - Get a chat by ID
* [updateChat](docs/sdks/chats/README.md#updatechat) - Update a chat
* [addParticipant](docs/sdks/chats/README.md#addparticipant) - Add a participant to a chat
* [removeParticipant](docs/sdks/chats/README.md#removeparticipant) - Remove a participant from a chat
* [startTyping](docs/sdks/chats/README.md#starttyping) - Start typing indicator
* [stopTyping](docs/sdks/chats/README.md#stoptyping) - Stop typing indicator
* [markChatAsRead](docs/sdks/chats/README.md#markchatasread) - Mark chat as read
* [shareContactWithChat](docs/sdks/chats/README.md#sharecontactwithchat) - Share your contact card with a chat

### [Messages](docs/sdks/messages/README.md)

* [sendMessageToChat](docs/sdks/messages/README.md#sendmessagetochat) - Send a message to an existing chat
* [getMessages](docs/sdks/messages/README.md#getmessages) - Get messages from a chat
* [getMessageThread](docs/sdks/messages/README.md#getmessagethread) - Get all messages in a thread
* [sendVoiceMemoToChat](docs/sdks/messages/README.md#sendvoicememotochat) - Send a voice memo to a chat
* [getMessage](docs/sdks/messages/README.md#getmessage) - Get a message by ID
* [deleteMessage](docs/sdks/messages/README.md#deletemessage) - Delete a message from system
* [sendReaction](docs/sdks/messages/README.md#sendreaction) - Add or remove a reaction to a message

### [PhoneNumbers](docs/sdks/phonenumbers/README.md)

* [listPhoneNumbers](docs/sdks/phonenumbers/README.md#listphonenumbers) - List phone numbers

### [Webhooks](docs/sdks/webhooks/README.md)

* [listWebhookEvents](docs/sdks/webhooks/README.md#listwebhookevents) - List available webhook event types
* [createWebhookSubscription](docs/sdks/webhooks/README.md#createwebhooksubscription) - Create a new webhook subscription
* [listWebhookSubscriptions](docs/sdks/webhooks/README.md#listwebhooksubscriptions) - List all webhook subscriptions
* [getWebhookSubscription](docs/sdks/webhooks/README.md#getwebhooksubscription) - Get a webhook subscription by ID
* [updateWebhookSubscription](docs/sdks/webhooks/README.md#updatewebhooksubscription) - Update a webhook subscription
* [deleteWebhookSubscription](docs/sdks/webhooks/README.md#deletewebhooksubscription) - Delete a webhook subscription

</details>
<!-- End Available Resources and Operations [operations] -->

<!-- Start Standalone functions [standalone-funcs] -->
## Standalone functions

All the methods listed above are available as standalone functions. These
functions are ideal for use in applications running in the browser, serverless
runtimes or other environments where application bundle size is a primary
concern. When using a bundler to build your application, all unused
functionality will be either excluded from the final bundle or tree-shaken away.

To read more about standalone functions, check [FUNCTIONS.md](./FUNCTIONS.md).

<details>

<summary>Available standalone functions</summary>

- [`attachmentsGetAttachment`](docs/sdks/attachments/README.md#getattachment) - Get attachment metadata
- [`attachmentsRequestUpload`](docs/sdks/attachments/README.md#requestupload) - Pre-upload a file
- [`chatsAddParticipant`](docs/sdks/chats/README.md#addparticipant) - Add a participant to a chat
- [`chatsCreateChat`](docs/sdks/chats/README.md#createchat) - Create a new chat
- [`chatsGetChat`](docs/sdks/chats/README.md#getchat) - Get a chat by ID
- [`chatsListChats`](docs/sdks/chats/README.md#listchats) - List all chats
- [`chatsMarkChatAsRead`](docs/sdks/chats/README.md#markchatasread) - Mark chat as read
- [`chatsRemoveParticipant`](docs/sdks/chats/README.md#removeparticipant) - Remove a participant from a chat
- [`chatsShareContactWithChat`](docs/sdks/chats/README.md#sharecontactwithchat) - Share your contact card with a chat
- [`chatsStartTyping`](docs/sdks/chats/README.md#starttyping) - Start typing indicator
- [`chatsStopTyping`](docs/sdks/chats/README.md#stoptyping) - Stop typing indicator
- [`chatsUpdateChat`](docs/sdks/chats/README.md#updatechat) - Update a chat
- [`messagesDeleteMessage`](docs/sdks/messages/README.md#deletemessage) - Delete a message from system
- [`messagesGetMessage`](docs/sdks/messages/README.md#getmessage) - Get a message by ID
- [`messagesGetMessages`](docs/sdks/messages/README.md#getmessages) - Get messages from a chat
- [`messagesGetMessageThread`](docs/sdks/messages/README.md#getmessagethread) - Get all messages in a thread
- [`messagesSendMessageToChat`](docs/sdks/messages/README.md#sendmessagetochat) - Send a message to an existing chat
- [`messagesSendReaction`](docs/sdks/messages/README.md#sendreaction) - Add or remove a reaction to a message
- [`messagesSendVoiceMemoToChat`](docs/sdks/messages/README.md#sendvoicememotochat) - Send a voice memo to a chat
- [`phoneNumbersListPhoneNumbers`](docs/sdks/phonenumbers/README.md#listphonenumbers) - List phone numbers
- [`webhooksCreateWebhookSubscription`](docs/sdks/webhooks/README.md#createwebhooksubscription) - Create a new webhook subscription
- [`webhooksDeleteWebhookSubscription`](docs/sdks/webhooks/README.md#deletewebhooksubscription) - Delete a webhook subscription
- [`webhooksGetWebhookSubscription`](docs/sdks/webhooks/README.md#getwebhooksubscription) - Get a webhook subscription by ID
- [`webhooksListWebhookEvents`](docs/sdks/webhooks/README.md#listwebhookevents) - List available webhook event types
- [`webhooksListWebhookSubscriptions`](docs/sdks/webhooks/README.md#listwebhooksubscriptions) - List all webhook subscriptions
- [`webhooksUpdateWebhookSubscription`](docs/sdks/webhooks/README.md#updatewebhooksubscription) - Update a webhook subscription

</details>
<!-- End Standalone functions [standalone-funcs] -->

<!-- Start Retries [retries] -->
## Retries

Some of the endpoints in this SDK support retries.  If you use the SDK without any configuration, it will fall back to the default retry strategy provided by the API.  However, the default retry strategy can be overridden on a per-operation basis, or across the entire SDK.

To change the default retry strategy for a single API call, simply provide a retryConfig object to the call:
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
  }, {
    retries: {
      strategy: "backoff",
      backoff: {
        initialInterval: 1,
        maxInterval: 50,
        exponent: 1.1,
        maxElapsedTime: 100,
      },
      retryConnectionErrors: false,
    },
  });

  console.log(result);
}

run();

```

If you'd like to override the default retry strategy for all operations that support retries, you can provide a retryConfig at SDK initialization:
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  retryConfig: {
    strategy: "backoff",
    backoff: {
      initialInterval: 1,
      maxInterval: 50,
      exponent: 1.1,
      maxElapsedTime: 100,
    },
    retryConnectionErrors: false,
  },
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
<!-- End Retries [retries] -->

<!-- Start Error Handling [errors] -->
## Error Handling

[`LinqError`](./src/models/errors/linq-error.ts) is the base class for all HTTP error responses. It has the following properties:

| Property            | Type       | Description                                                                             |
| ------------------- | ---------- | --------------------------------------------------------------------------------------- |
| `error.message`     | `string`   | Error message                                                                           |
| `error.statusCode`  | `number`   | HTTP response status code eg `404`                                                      |
| `error.headers`     | `Headers`  | HTTP response headers                                                                   |
| `error.body`        | `string`   | HTTP body. Can be empty string if no body is returned.                                  |
| `error.rawResponse` | `Response` | Raw HTTP response                                                                       |
| `error.data$`       |            | Optional. Some errors may contain structured data. [See Error Classes](#error-classes). |

### Example
```typescript
import { Linq } from "@linqapp/sdk";
import * as errors from "@linqapp/sdk/models/errors";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  try {
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
  } catch (error) {
    // The base class for HTTP error responses
    if (error instanceof errors.LinqError) {
      console.log(error.message);
      console.log(error.statusCode);
      console.log(error.body);
      console.log(error.headers);

      // Depending on the method different errors may be thrown
      if (error instanceof errors.ErrorResponse) {
        console.log(error.data$.error); // components.ErrorDetail
        console.log(error.data$.success); // boolean
        console.log(error.data$.traceId); // string
      }
    }
  }
}

run();

```

### Error Classes
**Primary errors:**
* [`LinqError`](./src/models/errors/linq-error.ts): The base class for HTTP error responses.
  * [`ErrorResponse`](./src/models/errors/error-response.ts): Invalid request - validation error.

<details><summary>Less common errors (6)</summary>

<br />

**Network errors:**
* [`ConnectionError`](./src/models/errors/http-client-errors.ts): HTTP client was unable to make a request to a server.
* [`RequestTimeoutError`](./src/models/errors/http-client-errors.ts): HTTP request timed out due to an AbortSignal signal.
* [`RequestAbortedError`](./src/models/errors/http-client-errors.ts): HTTP request was aborted by the client.
* [`InvalidRequestError`](./src/models/errors/http-client-errors.ts): Any input used to create a request is invalid.
* [`UnexpectedClientError`](./src/models/errors/http-client-errors.ts): Unrecognised or unexpected error.


**Inherit from [`LinqError`](./src/models/errors/linq-error.ts)**:
* [`ResponseValidationError`](./src/models/errors/response-validation-error.ts): Type mismatch between the data returned from the server and the structure expected by the SDK. See `error.rawValue` for the raw value and `error.pretty()` for a nicely formatted multi-line string.

</details>
<!-- End Error Handling [errors] -->

<!-- Start Server Selection [server] -->
## Server Selection

### Override Server URL Per-Client

The default server can be overridden globally by passing a URL to the `serverURL: string` optional parameter when initializing the SDK client instance. For example:
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  serverURL: "https://api.linqapp.com/api/partner",
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
<!-- End Server Selection [server] -->

<!-- Start Custom HTTP Client [http-client] -->
## Custom HTTP Client

The TypeScript SDK makes API calls using an `HTTPClient` that wraps the native
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). This
client is a thin wrapper around `fetch` and provides the ability to attach hooks
around the request lifecycle that can be used to modify the request or handle
errors and response.

The `HTTPClient` constructor takes an optional `fetcher` argument that can be
used to integrate a third-party HTTP client or when writing tests to mock out
the HTTP client and feed in fixtures.

The following example shows how to:
- route requests through a proxy server using [undici](https://www.npmjs.com/package/undici)'s ProxyAgent
- use the `"beforeRequest"` hook to add a custom header and a timeout to requests
- use the `"requestError"` hook to log errors

```typescript
import { Linq } from "@linqapp/sdk";
import { ProxyAgent } from "undici";
import { HTTPClient } from "@linqapp/sdk/lib/http";

const dispatcher = new ProxyAgent("http://proxy.example.com:8080");

const httpClient = new HTTPClient({
  // 'fetcher' takes a function that has the same signature as native 'fetch'.
  fetcher: (input, init) =>
    // 'dispatcher' is specific to undici and not part of the standard Fetch API.
    fetch(input, { ...init, dispatcher } as RequestInit),
});

httpClient.addHook("beforeRequest", (request) => {
  const nextRequest = new Request(request, {
    signal: request.signal || AbortSignal.timeout(5000)
  });

  nextRequest.headers.set("x-custom-header", "custom value");

  return nextRequest;
});

httpClient.addHook("requestError", (error, request) => {
  console.group("Request Error");
  console.log("Reason:", `${error}`);
  console.log("Endpoint:", `${request.method} ${request.url}`);
  console.groupEnd();
});

const sdk = new Linq({ httpClient: httpClient });
```
<!-- End Custom HTTP Client [http-client] -->

<!-- Start Debugging [debug] -->
## Debugging

You can setup your SDK to emit debug logs for SDK requests and responses.

You can pass a logger that matches `console`'s interface as an SDK option.

> [!WARNING]
> Beware that debug logging will reveal secrets, like API tokens in headers, in log messages printed to a console or files. It's recommended to use this feature only during local development and not in production.

```typescript
import { Linq } from "@linqapp/sdk";

const sdk = new Linq({ debugLogger: console });
```
<!-- End Debugging [debug] -->

<!-- Placeholder for Future Speakeasy SDK Sections -->

# Development

## Maturity

This SDK is in beta, and there may be breaking changes between versions without a major version update. Therefore, we recommend pinning usage
to a specific package version. This way, you can install the same version each time without breaking changes unless you are intentionally
looking for the latest version.

## Contributions

While we value open-source contributions to this SDK, this library is generated programmatically. Any manual changes added to internal files will be overwritten on the next generation. 
We look forward to hearing your feedback. Feel free to open a PR or an issue with a proof of concept and we'll do our best to include it in a future release. 

### SDK Created by [Speakeasy](https://www.speakeasy.com/?utm_source=@linqapp/sdk&utm_campaign=typescript)
