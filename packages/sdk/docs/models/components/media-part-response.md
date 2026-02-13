# MediaPartResponse

A media attachment part

## Example Usage

```typescript
import { MediaPartResponse } from "@linqapp/sdk/models/components";

let value: MediaPartResponse = {
  type: "media",
  id: "abc12345-1234-5678-9abc-def012345678",
  url: "https://cdn.linqapp.com/attachments/abc12345/photo.jpg?signature=...",
  filename: "photo.jpg",
  mimeType: "image/jpeg",
  sizeBytes: 245678,
  reactions: null,
};
```

## Fields

| Field                                                                | Type                                                                 | Required                                                             | Description                                                          | Example                                                              |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `type`                                                               | *"media"*                                                            | :heavy_check_mark:                                                   | Indicates this is a media attachment part                            |                                                                      |
| `id`                                                                 | *string*                                                             | :heavy_check_mark:                                                   | Unique attachment identifier                                         | abc12345-1234-5678-9abc-def012345678                                 |
| `url`                                                                | *string*                                                             | :heavy_check_mark:                                                   | Presigned URL for downloading the attachment (expires in 1 hour).<br/> | https://cdn.linqapp.com/attachments/550e8400/photo.jpg?signature=... |
| `filename`                                                           | *string*                                                             | :heavy_check_mark:                                                   | Original filename                                                    | photo.jpg                                                            |
| `mimeType`                                                           | *string*                                                             | :heavy_check_mark:                                                   | MIME type of the file                                                | image/jpeg                                                           |
| `sizeBytes`                                                          | *number*                                                             | :heavy_check_mark:                                                   | File size in bytes                                                   | 245678                                                               |
| `reactions`                                                          | [components.Reaction](../../models/components/reaction.md)[]         | :heavy_check_mark:                                                   | Reactions on this message part                                       |                                                                      |