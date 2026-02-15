# Webhooks

## Overview

Webhook Subscriptions allow you to receive real-time notifications when events
occur on your account.

Configure webhook endpoints to receive events such as messages sent/received,
delivery status changes, reactions, typing indicators, and more.

Failed deliveries (5xx, 429, network errors) are retried up to 6 times with
exponential backoff: 2s, 4s, 8s, 16s, 30s. Each event includes a unique ID
for deduplication.

## Webhook Headers

Each webhook request includes the following headers:

| Header | Description |
|--------|-------------|
| `X-Webhook-Event` | The event type (e.g., `message.sent`, `message.received`) |
| `X-Webhook-Subscription-ID` | Your webhook subscription ID |
| `X-Webhook-Timestamp` | Unix timestamp (seconds) when the webhook was sent |
| `X-Webhook-Signature` | HMAC-SHA256 signature for verification |

## Verifying Webhook Signatures

All webhooks are signed using HMAC-SHA256. You should always verify the signature
to ensure the webhook originated from Linq and hasn't been tampered with.

**Signature Construction:**

The signature is computed over a concatenation of the timestamp and payload:

```
{timestamp}.{payload}
```

Where:
- `timestamp` is the value from the `X-Webhook-Timestamp` header
- `payload` is the raw JSON request body (exact bytes, not re-serialized)

**Verification Steps:**

1. Extract the `X-Webhook-Timestamp` and `X-Webhook-Signature` headers
2. Get the raw request body bytes (do not parse and re-serialize)
3. Concatenate: `"{timestamp}.{payload}"`
4. Compute HMAC-SHA256 using your signing secret as the key
5. Hex-encode the result and compare with `X-Webhook-Signature`
6. Use constant-time comparison to prevent timing attacks

**Example (Python):**

```python
import hmac
import hashlib

def verify_webhook(signing_secret, payload, timestamp, signature):
    message = f"{timestamp}.{payload.decode('utf-8')}"
    expected = hmac.new(
        signing_secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

**Example (Node.js):**

```javascript
const crypto = require('crypto');

function verifyWebhook(signingSecret, payload, timestamp, signature) {
  const message = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac('sha256', signingSecret)
    .update(message)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}
```

**Security Best Practices:**

- Reject webhooks with timestamps older than 5 minutes to prevent replay attacks
- Always use constant-time comparison for signature verification
- Store your signing secret securely (e.g., environment variable, secrets manager)
- Return a 2xx status code quickly, then process the webhook asynchronously


### Available Operations

* [listWebhookEvents](#listwebhookevents) - List available webhook event types
* [createWebhookSubscription](#createwebhooksubscription) - Create a new webhook subscription
* [listWebhookSubscriptions](#listwebhooksubscriptions) - List all webhook subscriptions
* [getWebhookSubscription](#getwebhooksubscription) - Get a webhook subscription by ID
* [updateWebhookSubscription](#updatewebhooksubscription) - Update a webhook subscription
* [deleteWebhookSubscription](#deletewebhooksubscription) - Delete a webhook subscription

## listWebhookEvents

Returns all available webhook event types that can be subscribed to.
Use this endpoint to discover valid values for the `subscribed_events`
field when creating or updating webhook subscriptions.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="listWebhookEvents" method="get" path="/v3/webhook-events" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.webhooks.listWebhookEvents();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { webhooksListWebhookEvents } from "@linqapp/sdk/funcs/webhooks-list-webhook-events.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await webhooksListWebhookEvents(linq);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("webhooksListWebhookEvents failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.WebhookEventsResult](../../models/components/webhook-events-result.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401                     | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## createWebhookSubscription

Create a new webhook subscription to receive events at a target URL.
Upon creation, a signing secret is generated for verifying webhook
authenticity. **Store this secret securely — it cannot be retrieved later.**

**Webhook Delivery:**
- Events are sent via HTTP POST to the target URL
- Each request includes `X-Webhook-Signature` and `X-Webhook-Timestamp` headers
- Signature is HMAC-SHA256 over `{timestamp}.{payload}` — see [Webhook Events](/docs/webhook-events) for verification details
- Failed deliveries (5xx, 429, network errors) are retried up to 6 times with exponential backoff: 2s, 4s, 8s, 16s, 30s
- Client errors (4xx except 429) are not retried


### Example Usage: allEvents

<!-- UsageSnippet language="typescript" operationID="createWebhookSubscription" method="post" path="/v3/webhook-subscriptions" example="allEvents" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.webhooks.createWebhookSubscription({
    targetUrl: "https://webhooks.example.com/linq/events",
    subscribedEvents: [
      "message.sent",
      "message.delivered",
      "message.read",
      "message.failed",
      "message.received",
      "reaction.added",
      "reaction.removed",
      "participant.added",
      "participant.removed",
    ],
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { webhooksCreateWebhookSubscription } from "@linqapp/sdk/funcs/webhooks-create-webhook-subscription.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await webhooksCreateWebhookSubscription(linq, {
    targetUrl: "https://webhooks.example.com/linq/events",
    subscribedEvents: [
      "message.sent",
      "message.delivered",
      "message.read",
      "message.failed",
      "message.received",
      "reaction.added",
      "reaction.removed",
      "participant.added",
      "participant.removed",
    ],
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("webhooksCreateWebhookSubscription failed:", res.error);
  }
}

run();
```
### Example Usage: messageEvents

<!-- UsageSnippet language="typescript" operationID="createWebhookSubscription" method="post" path="/v3/webhook-subscriptions" example="messageEvents" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.webhooks.createWebhookSubscription({
    targetUrl: "https://webhooks.example.com/linq/events",
    subscribedEvents: [
      "message.sent",
      "message.delivered",
      "message.read",
    ],
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { webhooksCreateWebhookSubscription } from "@linqapp/sdk/funcs/webhooks-create-webhook-subscription.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await webhooksCreateWebhookSubscription(linq, {
    targetUrl: "https://webhooks.example.com/linq/events",
    subscribedEvents: [
      "message.sent",
      "message.delivered",
      "message.read",
    ],
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("webhooksCreateWebhookSubscription failed:", res.error);
  }
}

run();
```
### Example Usage: messageEventsWithVersion

<!-- UsageSnippet language="typescript" operationID="createWebhookSubscription" method="post" path="/v3/webhook-subscriptions" example="messageEventsWithVersion" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.webhooks.createWebhookSubscription({
    targetUrl: "https://webhooks.example.com/linq/events?version=2026-02-03",
    subscribedEvents: [
      "message.sent",
      "message.delivered",
      "message.read",
    ],
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { webhooksCreateWebhookSubscription } from "@linqapp/sdk/funcs/webhooks-create-webhook-subscription.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await webhooksCreateWebhookSubscription(linq, {
    targetUrl: "https://webhooks.example.com/linq/events?version=2026-02-03",
    subscribedEvents: [
      "message.sent",
      "message.delivered",
      "message.read",
    ],
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("webhooksCreateWebhookSubscription failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [components.CreateWebhookSubscriptionRequest](../../models/components/create-webhook-subscription-request.md)                                                                  | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.WebhookSubscriptionCreatedResponse](../../models/components/webhook-subscription-created-response.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 400, 401                | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## listWebhookSubscriptions

Retrieve all webhook subscriptions for the authenticated partner.
Returns a list of active and inactive subscriptions with their
configuration and status.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="listWebhookSubscriptions" method="get" path="/v3/webhook-subscriptions" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.webhooks.listWebhookSubscriptions();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { webhooksListWebhookSubscriptions } from "@linqapp/sdk/funcs/webhooks-list-webhook-subscriptions.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await webhooksListWebhookSubscriptions(linq);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("webhooksListWebhookSubscriptions failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.ListWebhookSubscriptionsResult](../../models/components/list-webhook-subscriptions-result.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401                     | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## getWebhookSubscription

Retrieve details for a specific webhook subscription including its
target URL, subscribed events, and current status.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="getWebhookSubscription" method="get" path="/v3/webhook-subscriptions/{subscriptionId}" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.webhooks.getWebhookSubscription("b2c3d4e5-f6a7-8901-bcde-f23456789012");

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { webhooksGetWebhookSubscription } from "@linqapp/sdk/funcs/webhooks-get-webhook-subscription.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await webhooksGetWebhookSubscription(linq, "b2c3d4e5-f6a7-8901-bcde-f23456789012");
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("webhooksGetWebhookSubscription failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `subscriptionId`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the webhook subscription                                                                                                                                  | b2c3d4e5-f6a7-8901-bcde-f23456789012                                                                                                                                           |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[components.WebhookSubscriptionResponse](../../models/components/webhook-subscription-response.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401, 403, 404           | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## updateWebhookSubscription

Update an existing webhook subscription. You can modify the target URL,
subscribed events, or activate/deactivate the subscription.

**Note:** The signing secret cannot be changed via this endpoint.


### Example Usage: deactivate

<!-- UsageSnippet language="typescript" operationID="updateWebhookSubscription" method="put" path="/v3/webhook-subscriptions/{subscriptionId}" example="deactivate" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.webhooks.updateWebhookSubscription("b2c3d4e5-f6a7-8901-bcde-f23456789012", {
    isActive: false,
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { webhooksUpdateWebhookSubscription } from "@linqapp/sdk/funcs/webhooks-update-webhook-subscription.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await webhooksUpdateWebhookSubscription(linq, "b2c3d4e5-f6a7-8901-bcde-f23456789012", {
    isActive: false,
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("webhooksUpdateWebhookSubscription failed:", res.error);
  }
}

run();
```
### Example Usage: updateEvents

<!-- UsageSnippet language="typescript" operationID="updateWebhookSubscription" method="put" path="/v3/webhook-subscriptions/{subscriptionId}" example="updateEvents" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.webhooks.updateWebhookSubscription("b2c3d4e5-f6a7-8901-bcde-f23456789012", {
    subscribedEvents: [
      "message.sent",
      "message.delivered",
    ],
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { webhooksUpdateWebhookSubscription } from "@linqapp/sdk/funcs/webhooks-update-webhook-subscription.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await webhooksUpdateWebhookSubscription(linq, "b2c3d4e5-f6a7-8901-bcde-f23456789012", {
    subscribedEvents: [
      "message.sent",
      "message.delivered",
    ],
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("webhooksUpdateWebhookSubscription failed:", res.error);
  }
}

run();
```
### Example Usage: updateURL

<!-- UsageSnippet language="typescript" operationID="updateWebhookSubscription" method="put" path="/v3/webhook-subscriptions/{subscriptionId}" example="updateURL" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.webhooks.updateWebhookSubscription("b2c3d4e5-f6a7-8901-bcde-f23456789012", {
    targetUrl: "https://webhooks.example.com/linq/events",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { webhooksUpdateWebhookSubscription } from "@linqapp/sdk/funcs/webhooks-update-webhook-subscription.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await webhooksUpdateWebhookSubscription(linq, "b2c3d4e5-f6a7-8901-bcde-f23456789012", {
    targetUrl: "https://webhooks.example.com/linq/events",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("webhooksUpdateWebhookSubscription failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `subscriptionId`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the webhook subscription                                                                                                                                  | b2c3d4e5-f6a7-8901-bcde-f23456789012                                                                                                                                           |
| `body`                                                                                                                                                                         | [components.UpdateWebhookSubscriptionRequest](../../models/components/update-webhook-subscription-request.md)                                                                  | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |                                                                                                                                                                                |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[components.WebhookSubscriptionResponse](../../models/components/webhook-subscription-response.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 400, 401, 403, 404      | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## deleteWebhookSubscription

Delete a webhook subscription.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="deleteWebhookSubscription" method="delete" path="/v3/webhook-subscriptions/{subscriptionId}" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  await linq.webhooks.deleteWebhookSubscription("b2c3d4e5-f6a7-8901-bcde-f23456789012");


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { webhooksDeleteWebhookSubscription } from "@linqapp/sdk/funcs/webhooks-delete-webhook-subscription.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await webhooksDeleteWebhookSubscription(linq, "b2c3d4e5-f6a7-8901-bcde-f23456789012");
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("webhooksDeleteWebhookSubscription failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `subscriptionId`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the webhook subscription                                                                                                                                  | b2c3d4e5-f6a7-8901-bcde-f23456789012                                                                                                                                           |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<void\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401, 403, 404           | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |