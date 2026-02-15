# MessagePart1


## Supported Types

### `components.TextPartResponse`

```typescript
const value: components.TextPartResponse = {
  type: "text",
  value: "Hello!",
  reactions: [
    {
      isMe: false,
      handle: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        handle: "+15551234567",
        service: "iMessage",
        joinedAt: new Date("2025-05-21T15:30:00.000-05:00"),
        isMe: false,
      },
      type: "love",
      customEmoji: "🚀",
    },
  ],
};
```

### `components.MediaPartResponse`

```typescript
const value: components.MediaPartResponse = {
  type: "media",
  id: "abc12345-1234-5678-9abc-def012345678",
  url: "https://cdn.linqapp.com/attachments/abc12345/photo.jpg?signature=...",
  filename: "photo.jpg",
  mimeType: "image/jpeg",
  sizeBytes: 245678,
  reactions: [],
};
```

