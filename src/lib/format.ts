import chalk from 'chalk';

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

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '–';
  const d = new Date(iso);
  return d.toLocaleString();
}

function kvLine(key: string, value: string | undefined | null): string {
  return `  ${chalk.bold(key + ':')} ${value ?? '–'}`;
}

// ── phone numbers ────────────────────────────────────────────────────

interface PhoneNumberInfo {
  phone_number: string;
  type: string;
  capabilities: { sms: boolean; mms: boolean; voice: boolean };
}

export function formatPhoneNumbers(data: { phone_numbers: PhoneNumberInfo[] }): string {
  const phones = data.phone_numbers;
  if (phones.length === 0) return 'No phone numbers found.';

  const header = `${pad('PHONE NUMBER', 18)} ${pad('TYPE', 12)} ${pad('SMS', 5)} ${pad('MMS', 5)} VOICE`;
  const rows = phones.map(
    (p) =>
      `${pad(p.phone_number, 18)} ${pad(p.type, 12)} ${pad(yn(p.capabilities.sms), 5)} ${pad(yn(p.capabilities.mms), 5)} ${yn(p.capabilities.voice)}`
  );
  return [chalk.dim(header), ...rows].join('\n');
}

// ── chats ────────────────────────────────────────────────────────────

interface ChatHandle {
  handle: string;
  is_me?: boolean | null;
}

interface Chat {
  id: string;
  display_name?: string | null;
  service?: string | null;
  handles?: ChatHandle[];
  updated_at?: string;
}

export function formatChatsList(data: { chats: Chat[]; next_cursor?: string | null }): string {
  const chats = data.chats;
  if (chats.length === 0) return 'No chats found.';

  const header = `${pad('ID', 10)} ${pad('PARTICIPANTS', 36)} ${pad('SERVICE', 12)} UPDATED`;
  const rows = chats.map((c) => {
    const participants = (c.handles || [])
      .filter((h) => !h.is_me)
      .map((h) => h.handle)
      .join(', ');
    return `${pad(shortId(c.id), 10)} ${pad(truncate(c.display_name || participants, 34), 36)} ${pad(c.service || '–', 12)} ${fmtDate(c.updated_at ?? null)}`;
  });
  const lines = [chalk.dim(header), ...rows];
  if (data.next_cursor) {
    lines.push(chalk.dim(`\nMore results available. Use --cursor ${data.next_cursor}`));
  }
  return lines.join('\n');
}

interface CreateChatResult {
  chat: {
    id: string;
    handles?: ChatHandle[];
    message: { id: string };
  };
}

export function formatChatCreated(data: CreateChatResult): string {
  const recipients = (data.chat.handles || [])
    .filter((h) => !h.is_me)
    .map((h) => h.handle)
    .join(', ');
  return chalk.green('✓') + ` Message sent${recipients ? ` to ${recipients}` : ''} (chat ${shortId(data.chat.id)})`;
}

export function formatChatDetail(data: Chat): string {
  const participants = (data.handles || []).map((h) => {
    const me = h.is_me ? chalk.dim(' (you)') : '';
    return `    ${h.handle}${me}`;
  });
  return [
    kvLine('ID', data.id),
    kvLine('Display Name', data.display_name || '–'),
    kvLine('Service', data.service || '–'),
    kvLine('Updated', fmtDate(data.updated_at ?? null)),
    `  ${chalk.bold('Participants:')}`,
    ...participants,
  ].join('\n');
}

// ── messages ─────────────────────────────────────────────────────────

interface SentMessage {
  id: string;
  parts?: { type: string; value?: string }[];
}

interface SendMessageResponse {
  chat_id: string;
  message: SentMessage;
}

export function formatMessageSent(data: SendMessageResponse): string {
  return chalk.green('✓') + ` Message sent (${shortId(data.message.id)}) to chat ${shortId(data.chat_id)}`;
}

interface Message {
  id: string;
  chat_id: string;
  from?: string | null;
  from_handle?: { handle: string } | null;
  is_from_me: boolean;
  parts?: ({ type: string; value?: string } | null)[] | null;
  created_at: string;
  sent_at?: string | null;
  delivered_at?: string | null;
  read_at?: string | null;
  is_delivered: boolean;
  is_read: boolean;
  service?: string | null;
  effect?: { type?: string; name?: string } | null;
}

export function formatMessagesList(data: { messages: Message[]; next_cursor?: string | null }): string {
  const msgs = data.messages;
  if (msgs.length === 0) return 'No messages found.';

  const rows = msgs.map((m) => {
    const sender = m.from_handle?.handle || m.from || (m.is_from_me ? 'you' : '?');
    const body = (m.parts || [])
      .map((p) => (p?.type === 'text' ? p.value : `[${p?.type || 'media'}]`))
      .join(' ')
      || '';
    return `${chalk.dim(fmtDate(m.created_at))}  ${chalk.bold(sender)}  ${truncate(body, 60)}`;
  });
  const lines = [...rows];
  if (data.next_cursor) {
    lines.push(chalk.dim(`\nMore results available. Use --cursor ${data.next_cursor}`));
  }
  return lines.join('\n');
}

export function formatMessageDetail(data: Message): string {
  const sender = data.from_handle?.handle || data.from || (data.is_from_me ? 'you' : '–');
  const body = (data.parts || [])
    .map((p) => (p?.type === 'text' ? p.value : `[${p?.type || 'media'}]`))
    .join(' ')
    || '–';

  const lines = [
    kvLine('ID', data.id),
    kvLine('Chat', data.chat_id),
    kvLine('From', sender),
    kvLine('Service', data.service || '–'),
    kvLine('Body', body),
    kvLine('Sent', fmtDate(data.sent_at)),
    kvLine('Delivered', data.is_delivered ? fmtDate(data.delivered_at) : 'No'),
    kvLine('Read', data.is_read ? fmtDate(data.read_at) : 'No'),
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

interface WebhookSubscription {
  id: string;
  target_url: string;
  subscribed_events: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  signing_secret?: string;
}

export function formatWebhooksList(data: { subscriptions: WebhookSubscription[] }): string {
  const subs = data.subscriptions;
  if (subs.length === 0) return 'No webhook subscriptions found.';

  const header = `${pad('ID', 10)} ${pad('URL', 40)} ${pad('EVENTS', 8)} ACTIVE`;
  const rows = subs.map(
    (s) =>
      `${pad(shortId(s.id), 10)} ${pad(truncate(s.target_url, 38), 40)} ${pad(String(s.subscribed_events.length), 8)} ${s.is_active ? chalk.green('✓') : chalk.red('✗')}`
  );
  return [chalk.dim(header), ...rows].join('\n');
}

export function formatWebhookDetail(data: WebhookSubscription): string {
  const lines = [
    kvLine('ID', data.id),
    kvLine('URL', data.target_url),
    kvLine('Active', data.is_active ? 'Yes' : 'No'),
    kvLine('Created', fmtDate(data.created_at)),
    kvLine('Updated', fmtDate(data.updated_at)),
    `  ${chalk.bold('Events:')}`,
    ...data.subscribed_events.map((e) => `    ${e}`),
  ];
  if (data.signing_secret) {
    lines.splice(3, 0, kvLine('Signing Secret', data.signing_secret));
  }
  return lines.join('\n');
}

// ── attachments ──────────────────────────────────────────────────────

interface Attachment {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  status: string;
  download_url?: string;
  created_at: string;
}

export function formatAttachmentMeta(data: Attachment): string {
  return [
    kvLine('ID', data.id),
    kvLine('Filename', data.filename),
    kvLine('Type', data.content_type),
    kvLine('Size', `${data.size_bytes} bytes`),
    kvLine('Status', data.status),
    kvLine('Download URL', data.download_url || '–'),
    kvLine('Created', fmtDate(data.created_at)),
  ].join('\n');
}

interface UploadResult {
  attachment_id: string;
  upload_url: string;
  download_url: string;
  http_method: string;
  expires_at: string;
  required_headers: Record<string, string>;
}

export function formatUploadUrl(data: UploadResult): string {
  const headerEntries = Object.entries(data.required_headers)
    .map(([k, v]) => `    ${k}: ${v}`)
    .join('\n');
  return [
    kvLine('Attachment ID', data.attachment_id),
    kvLine('Upload URL', data.upload_url),
    kvLine('Download URL', data.download_url),
    kvLine('Method', data.http_method),
    kvLine('Expires', fmtDate(data.expires_at)),
    `  ${chalk.bold('Required Headers:')}`,
    headerEntries,
  ].join('\n');
}
