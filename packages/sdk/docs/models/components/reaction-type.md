# ReactionType

Type of reaction. Standard iMessage tapbacks are love, like, dislike, laugh, emphasize, question.
Custom emoji reactions have type "custom" with the actual emoji in the custom_emoji field.


## Example Usage

```typescript
import { ReactionType } from "@linqapp/sdk/models/components";

let value: ReactionType = "love";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"love" | "like" | "dislike" | "laugh" | "emphasize" | "question" | "custom" | Unrecognized<string>
```