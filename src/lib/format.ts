import chalk from 'chalk';
import type {
  Chat,
  ChatHandle,
  CreateChatResult,
  Message,
  SendMessageResponse,
  WebhookSubscriptionResponse,
  WebhookSubscriptionCreatedResponse,
  Attachment,
  RequestUploadResult,
  ListPhoneNumbersResult,
  ListChatsResult,
  GetMessagesResult,
  GetThreadResponse,
  ListWebhookSubscriptionsResult,
} from '@linqapp/sdk/models/components';

// ── helpers ──────────────────────────────────────────────────────────

function pad(str: string, len: number): string {
  return str.length >= len ? str : str + ' '.repeat(len - str.length);
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 1) + '…';
}

function yn(val: boolean | undefined | null): string {
  return val ? chalk.green('✓') : chalk.dim('–');
}

function shortId(id: string): string {
  return id.length > 12 ? id.slice(0, 8) + '…' : id;
}

function fmtDate(date: Date | string | null | undefined): string {
  if (!date) return '–';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString();
}

function kvLine(key: string, value: string | undefined | null): string {
  return `  ${chalk.bold(key + ':')} ${value ?? '–'}`;
}

// ── phone numbers ────────────────────────────────────────────────────

export function formatPhoneNumbers(data: ListPhoneNumbersResult): string {
  const phones = data.phoneNumbers;
  if (phones.length === 0) return 'No phone numbers found.';

  const header = `${pad('PHONE NUMBER', 18)} ${pad('TYPE', 12)} ${pad('SMS', 5)} ${pad('MMS', 5)} VOICE`;
  const rows = phones.map(
    (p) =>
      `${pad(p.phoneNumber, 18)} ${pad(p.type, 12)} ${pad(yn(p.capabilities.sms), 5)} ${pad(yn(p.capabilities.mms), 5)} ${yn(p.capabilities.voice)}`
  );
  return [chalk.dim(header), ...rows].join('\n');
}

// ── chats ────────────────────────────────────────────────────────────

export function formatChatsList(data: ListChatsResult): string {
  const chats = data.chats;
  if (chats.length === 0) return 'No chats found.';

  const header = `${pad('ID', 10)} ${pad('PARTICIPANTS', 36)} ${pad('SERVICE', 12)} UPDATED`;
  const rows = chats.map((c) => {
    const participants = (c.handles || [])
      .filter((h: ChatHandle) => !h.isMe)
      .map((h: ChatHandle) => h.handle)
      .join(', ');
    return `${pad(shortId(c.id), 10)} ${pad(truncate(c.displayName || participants, 34), 36)} ${pad((c.service as string) || '–', 12)} ${fmtDate(c.updatedAt)}`;
  });
  const lines = [chalk.dim(header), ...rows];
  if (data.nextCursor) {
    lines.push(chalk.dim(`\nMore results available. Use --cursor ${data.nextCursor}`));
  }
  return lines.join('\n');
}

export function formatChatCreated(data: CreateChatResult): string {
  const recipients = (data.chat.handles || [])
    .filter((h: ChatHandle) => !h.isMe)
    .map((h: ChatHandle) => h.handle)
    .join(', ');
  return chalk.green('✓') + ` Message sent${recipients ? ` to ${recipients}` : ''} (chat ${shortId(data.chat.id)})`;
}

export function formatChatDetail(data: Chat): string {
  const participants = (data.handles || []).map((h: ChatHandle) => {
    const me = h.isMe ? chalk.dim(' (you)') : '';
    return `    ${h.handle}${me}`;
  });
  return [
    kvLine('ID', data.id),
    kvLine('Display Name', data.displayName || '–'),
    kvLine('Service', (data.service as string) || '–'),
    kvLine('Updated', fmtDate(data.updatedAt)),
    `  ${chalk.bold('Participants:')}`,
    ...participants,
  ].join('\n');
}

// ── messages ─────────────────────────────────────────────────────────

export function formatMessageSent(data: SendMessageResponse): string {
  return chalk.green('✓') + ` Message sent (${shortId(data.message.id)}) to chat ${shortId(data.chatId)}`;
}

export function formatMessagesList(data: GetMessagesResult | GetThreadResponse): string {
  const msgs = data.messages;
  if (msgs.length === 0) return 'No messages found.';

  const rows = msgs.map((m: Message) => {
    const sender = m.fromHandle?.handle || m.from || (m.isFromMe ? 'you' : '?');
    const body = (m.parts || [])
      .map((p) => ('value' in p && p.type === 'text' ? (p as { value?: string }).value : `[${p?.type || 'media'}]`))
      .join(' ')
      || '';
    return `${chalk.dim(fmtDate(m.createdAt))}  ${chalk.bold(sender)}  ${truncate(body, 60)}`;
  });
  const lines = [...rows];
  if (data.nextCursor) {
    lines.push(chalk.dim(`\nMore results available. Use --cursor ${data.nextCursor}`));
  }
  return lines.join('\n');
}

export function formatMessageDetail(data: Message): string {
  const sender = data.fromHandle?.handle || data.from || (data.isFromMe ? 'you' : '–');
  const body = (data.parts || [])
    .map((p) => ('value' in p && p.type === 'text' ? (p as { value?: string }).value : `[${p?.type || 'media'}]`))
    .join(' ')
    || '–';

  const lines = [
    kvLine('ID', data.id),
    kvLine('Chat', data.chatId),
    kvLine('From', sender),
    kvLine('Service', (data.service as string) || '–'),
    kvLine('Body', body),
    kvLine('Sent', fmtDate(data.sentAt)),
    kvLine('Delivered', data.isDelivered ? fmtDate(data.deliveredAt) : 'No'),
    kvLine('Read', data.isRead ? fmtDate(data.readAt) : 'No'),
  ];
  if (data.effect) {
    lines.push(kvLine('Effect', `${data.effect.type}: ${data.effect.name}`));
  }
  return lines.join('\n');
}

export function formatDeleted(type: string, id: string): string {
  return chalk.green('✓') + ` ${type} ${id} deleted`;
}

export function formatReaction(operation: string, type: string, messageId: string): string {
  const verb = operation === 'add' ? 'Added' : 'Removed';
  return chalk.green('✓') + ` ${verb} ${type} reaction ${operation === 'add' ? 'to' : 'from'} ${shortId(messageId)}`;
}

// ── webhooks ─────────────────────────────────────────────────────────

export function formatWebhooksList(data: ListWebhookSubscriptionsResult): string {
  const subs = data.subscriptions;
  if (subs.length === 0) return 'No webhook subscriptions found.';

  const header = `${pad('ID', 10)} ${pad('URL', 40)} ${pad('EVENTS', 8)} ACTIVE`;
  const rows = subs.map(
    (s: WebhookSubscriptionResponse) =>
      `${pad(shortId(s.id), 10)} ${pad(truncate(s.targetUrl, 38), 40)} ${pad(String(s.subscribedEvents.length), 8)} ${s.isActive ? chalk.green('✓') : chalk.red('✗')}`
  );
  return [chalk.dim(header), ...rows].join('\n');
}

export function formatWebhookDetail(data: WebhookSubscriptionResponse | WebhookSubscriptionCreatedResponse): string {
  const lines = [
    kvLine('ID', data.id),
    kvLine('URL', data.targetUrl),
    kvLine('Active', data.isActive ? 'Yes' : 'No'),
    kvLine('Created', fmtDate(data.createdAt)),
    kvLine('Updated', fmtDate(data.updatedAt)),
    `  ${chalk.bold('Events:')}`,
    ...data.subscribedEvents.map((e: string) => `    ${e}`),
  ];
  if ('signingSecret' in data && data.signingSecret) {
    lines.splice(3, 0, kvLine('Signing Secret', data.signingSecret));
  }
  return lines.join('\n');
}

// ── attachments ──────────────────────────────────────────────────────

export function formatAttachmentMeta(data: Attachment): string {
  return [
    kvLine('ID', data.id),
    kvLine('Filename', data.filename),
    kvLine('Type', data.contentType),
    kvLine('Size', `${data.sizeBytes} bytes`),
    kvLine('Status', data.status),
    kvLine('Download URL', data.downloadUrl || '–'),
    kvLine('Created', fmtDate(data.createdAt)),
  ].join('\n');
}

export function formatUploadUrl(data: RequestUploadResult): string {
  const headerEntries = Object.entries(data.requiredHeaders)
    .map(([k, v]) => `    ${k}: ${v}`)
    .join('\n');
  return [
    kvLine('Attachment ID', data.attachmentId),
    kvLine('Upload URL', data.uploadUrl),
    kvLine('Download URL', data.downloadUrl),
    kvLine('Method', data.httpMethod),
    kvLine('Expires', fmtDate(data.expiresAt)),
    `  ${chalk.bold('Required Headers:')}`,
    headerEntries,
  ].join('\n');
}
