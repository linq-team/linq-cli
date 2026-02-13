# SupportedContentType

Supported MIME types for file attachments and media URLs.

**Images:** image/jpeg, image/png, image/gif, image/heic, image/heif, image/tiff, image/bmp

**Videos:** video/mp4, video/quicktime, video/mpeg, video/3gpp

**Audio:** audio/mpeg, audio/mp4, audio/x-m4a, audio/x-caf, audio/wav, audio/aiff, audio/aac, audio/amr

**Documents:** application/pdf, text/plain, text/vcard, text/rtf, text/csv, text/html, text/calendar, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.apple.pages, application/vnd.apple.numbers, application/vnd.apple.keynote, application/epub+zip, application/zip

**Unsupported:** WebP, SVG, FLAC, OGG, and executable files are explicitly rejected.


## Example Usage

```typescript
import { SupportedContentType } from "@linqapp/sdk/models/components";

let value: SupportedContentType = "image/jpeg";
```

## Values

This is an open enum. Unrecognized values will be captured as the `Unrecognized<string>` branded type.

```typescript
"image/jpeg" | "image/jpg" | "image/png" | "image/gif" | "image/heic" | "image/heif" | "image/tiff" | "image/bmp" | "image/x-ms-bmp" | "video/mp4" | "video/quicktime" | "video/mpeg" | "video/x-m4v" | "video/3gpp" | "audio/mpeg" | "audio/mp3" | "audio/mp4" | "audio/x-m4a" | "audio/m4a" | "audio/x-caf" | "audio/wav" | "audio/x-wav" | "audio/aiff" | "audio/x-aiff" | "audio/aac" | "audio/x-aac" | "audio/amr" | "application/pdf" | "text/plain" | "text/vcard" | "text/x-vcard" | "text/rtf" | "application/rtf" | "text/csv" | "text/html" | "text/calendar" | "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.ms-excel" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" | "application/vnd.ms-powerpoint" | "application/vnd.openxmlformats-officedocument.presentationml.presentation" | "application/vnd.apple.pages" | "application/x-iwork-pages-sffpages" | "application/vnd.apple.numbers" | "application/x-iwork-numbers-sffnumbers" | "application/vnd.apple.keynote" | "application/x-iwork-keynote-sffkey" | "application/epub+zip" | "application/zip" | "application/x-zip-compressed" | Unrecognized<string>
```