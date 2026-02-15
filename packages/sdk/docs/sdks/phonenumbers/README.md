# PhoneNumbers

## Overview

Phone Numbers represent the phone numbers assigned to your partner account.

Use the list phone numbers endpoint to discover which phone numbers are available
for sending messages. Each phone number has capabilities (SMS, MMS, voice) and
a status indicating whether it's ready for use.

When creating chats or sending messages, use one of your assigned phone numbers
in the `from` field.


### Available Operations

* [listPhoneNumbers](#listphonenumbers) - List phone numbers

## listPhoneNumbers

Returns all phone numbers assigned to the authenticated partner.
Use this endpoint to discover which phone numbers are available for
sending messages via the `from` field in create chat and send message requests.


### Example Usage

<!-- UsageSnippet language="typescript" operationID="listPhoneNumbers" method="get" path="/v3/phonenumbers" -->
```typescript
import { Linq } from "@linqapp/sdk";

const linq = new Linq({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await linq.phoneNumbers.listPhoneNumbers();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { LinqCore } from "@linqapp/sdk/core.js";
import { phoneNumbersListPhoneNumbers } from "@linqapp/sdk/funcs/phone-numbers-list-phone-numbers.js";

// Use `LinqCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const linq = new LinqCore({
  bearerAuth: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const res = await phoneNumbersListPhoneNumbers(linq);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("phoneNumbersListPhoneNumbers failed:", res.error);
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

**Promise\<[components.ListPhoneNumbersResult](../../models/components/list-phone-numbers-result.md)\>**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| errors.ErrorResponse    | 401                     | application/json        |
| errors.ErrorResponse    | 500                     | application/json        |
| errors.LinqDefaultError | 4XX, 5XX                | \*/\*                   |