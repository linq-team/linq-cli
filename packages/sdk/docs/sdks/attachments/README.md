# Attachments

## Overview

Send files (images, videos, documents, audio) with messages by providing a URL in a media part.
Pre-uploading via `POST /v3/attachments` is **optional** and only needed for specific optimization scenarios.

## Sending Media via URL (up to 10MB)

Provide a publicly accessible HTTPS URL with a [supported media type](#supported-file-types) in the `url` field of a media part.

```json
{
  "parts": [
    { "type": "media", "url": "https://your-cdn.com/images/photo.jpg" }
  ]
}
```

This works with any URL you already host — no pre-upload step required. **Maximum file size: 10MB.**

## Pre-Upload (required for files over 10MB)

Use `POST /v3/attachments` when you want to:
- **Send files larger than 10MB** (up to 100MB) — URL-based downloads are limited to 10MB
- **Send the same file to many recipients** — upload once, reuse the `attachment_id` without re-downloading each time
- **Reduce message send latency** — the file is already stored, so sending is faster

**How it works:**
1. `POST /v3/attachments` with file metadata → returns a presigned `upload_url` (valid for **15 minutes**) and a permanent `attachment_id`
2. PUT the raw file bytes to the `upload_url` with the `required_headers` (no JSON or multipart — just the binary content)
3. Reference the `attachment_id` in your media part when sending messages (no expiration)

**Key difference:** When you provide an external `url`, we download and process the file on every send.
When you use a pre-uploaded `attachment_id`, the file is already stored — so repeated sends skip the download step entirely.

## Supported File Types

- **Images:** JPEG, PNG, GIF, HEIC, HEIF, TIFF, BMP
- **Videos:** MP4, MOV, M4V
- **Audio:** M4A, AAC, MP3, WAV, AIFF, CAF, AMR
- **Documents:** PDF, TXT, RTF, CSV, Office formats, ZIP
- **Contact & Calendar:** VCF, ICS

## File Size Limits

- **URL-based (`url` field):** 10MB maximum
- **Pre-upload (`attachment_id`):** 100MB maximum


### Available Operations

* [requestUpload](#requestupload) - Pre-upload a file
* [getAttachment](#getattachment) - Get attachment metadata

## requestUpload

**This endpoint is optional.** You can send media by simply providing a URL in your
message's media part — no pre-upload required. Use this endpoint only when you want
to upload a file ahead of time for reuse or latency optimization.

Returns a presigned upload URL and a permanent `attachment_id` you can reference
in future messages.

## Step 1: Request an upload URL

Call this endpoint with file metadata:

```json
POST /v3/attachments
{
  "filename": "photo.jpg",
  "content_type": "image/jpeg",
  "size_bytes": 1024000
}
```

The response includes an `upload_url` (valid for 15 minutes) and a permanent `attachment_id`.

## Step 2: Upload the file

Make a PUT request to the `upload_url` with the raw file bytes as the request body.. Include the headers from `required_headers`.
The request body is the binary file content — **not** JSON, **not** multipart form data.

```bash
curl -X PUT "<upload_url from step 1>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @filebytes
```

## Step 3: Send a message with the attachment

Reference the `attachment_id` in a media part. The ID never expires — use it in as many messages as you want.

```json
POST /v3/messages
{
  "to": ["+15551234567"],
  "from": "+15559876543",
  "parts": [
    { "type": "media", "attachment_id": "<attachment_id from step 1>" }
  ]
}
```

## When to use this instead of a URL in the media part

- Sending the same file to multiple recipients (avoids re-downloading each time)
- Large files where you want to separate upload from message send
- Latency-sensitive sends where the file should already be stored

If you just need to send a file once, skip all of this and pass a `url` directly in the media part instead.

**File Size Limit:** 100MB

**Unsupported Types:** WebP, SVG, FLAC, OGG, and executable files are explicitly rejected.


### Example Usage: imageUpload

<!-- UsageSnippet language="typescript" operationID="requestUpload" method="post" path="/v3/attachments" example="imageUpload" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.attachments.requestUpload({
    filename: "photo.jpg",
    contentType: "image/jpeg",
    sizeBytes: 1024000,
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { attachmentsRequestUpload } from "@linqapp/sdk/funcs/attachments-request-upload.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await attachmentsRequestUpload(linq, {
    filename: "photo.jpg",
    contentType: "image/jpeg",
    sizeBytes: 1024000,
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("attachmentsRequestUpload failed:", res.error);
  }
}

run();
```
### Example Usage: presignedUrlResponse

<!-- UsageSnippet language="typescript" operationID="requestUpload" method="post" path="/v3/attachments" example="presignedUrlResponse" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.attachments.requestUpload({
    filename: "photo.jpg",
    contentType: "image/jpeg",
    sizeBytes: 1024000,
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { attachmentsRequestUpload } from "@linqapp/sdk/funcs/attachments-request-upload.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await attachmentsRequestUpload(linq, {
    filename: "photo.jpg",
    contentType: "image/jpeg",
    sizeBytes: 1024000,
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("attachmentsRequestUpload failed:", res.error);
  }
}

run();
```
### Example Usage: videoUpload

<!-- UsageSnippet language="typescript" operationID="requestUpload" method="post" path="/v3/attachments" example="videoUpload" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.attachments.requestUpload({
    filename: "video.mp4",
    contentType: "video/mp4",
    sizeBytes: 50000000,
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { attachmentsRequestUpload } from "@linqapp/sdk/funcs/attachments-request-upload.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await attachmentsRequestUpload(linq, {
    filename: "video.mp4",
    contentType: "video/mp4",
    sizeBytes: 50000000,
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("attachmentsRequestUpload failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [components.RequestUploadRequest](../../models/components/request-upload-request.md)                                                                                           | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.RequestUploadResult](../../models/components/request-upload-result.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 400, 401                | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |

## getAttachment

Retrieve metadata for a specific attachment including its status,
file information, and URLs for downloading.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="getAttachment" method="get" path="/v3/attachments/{attachmentId}" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.attachments.getAttachment("abc12345-1234-5678-9abc-def012345678");

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { attachmentsGetAttachment } from "@linqapp/sdk/funcs/attachments-get-attachment.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await attachmentsGetAttachment(linq, "abc12345-1234-5678-9abc-def012345678");
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("attachmentsGetAttachment failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    | Example                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `attachmentId`                                                                                                                                                                 | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | Unique identifier of the attachment                                                                                                                                            | abc12345-1234-5678-9abc-def012345678                                                                                                                                           |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |                                                                                                                                                                                |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |                                                                                                                                                                                |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |                                                                                                                                                                                |

### Response

**Promise\<[components.Attachment](../../models/components/attachment.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401, 404                | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |