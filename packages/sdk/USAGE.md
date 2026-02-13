<!-- Start SDK Example Usage [usage] -->
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