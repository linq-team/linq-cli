# MessageEventV2Part


## Supported Types

### `components.SchemasTextPartResponse`

```typescript
const value: components.SchemasTextPartResponse = {
  type: "text",
  value: "Hello!",
};
```

### `components.SchemasMediaPartResponse`

```typescript
const value: components.SchemasMediaPartResponse = {
  type: "media",
  id: "abc12345-1234-5678-9abc-def012345678",
  url: "https://cdn.linqapp.com/attachments/abc12345/photo.jpg?signature=...",
  filename: "photo.jpg",
  mimeType: "image/jpeg",
  sizeBytes: 245678,
};
```

