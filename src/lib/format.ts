import chalk from 'chalk';

// ── helpers ──────────────────────────────────────────────────────────

function pad(str: string, len: number): string {
  return str.length >= len ? str : str + ' '.repeat(len - str.length);
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 1) + '…';
}


function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '–';
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();

  // Relative time for recent timestamps
  if (diff >= 0 && diff < 60_000) return 'just now';
  if (diff >= 0 && diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff >= 0 && diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff >= 0 && diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;

  return d.toLocaleString();
}

function fmtDateAbsolute(iso: string | null | undefined): string {
  if (!iso) return '–';
  return new Date(iso).toLocaleString();
}

function fmtPhone(phone: string): string {
  // Format US numbers as +1 (XXX) XXX-XXXX
  const match = phone.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  if (match) return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
  return phone;
}

function statusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'delivered':
    case 'read':
    case 'active':
    case 'sent':
      return chalk.green(status);
    case 'pending':
    case 'sending':
      return chalk.yellow(status);
    case 'failed':
    case 'error':
    case 'inactive':
      return chalk.red(status);
    default:
      return status;
  }
}

function kvLine(key: string, value: string | undefined | null): string {
  return `  ${chalk.dim(key + ':')} ${value ?? '–'}`;
}


// ── phone numbers ────────────────────────────────────────────────────

interface PhoneNumberInfo {
  phone_number: string;
  type: string;
  capabilities: { sms: boolean; mms: boolean; voice: boolean };
}

export function formatPhoneNumbers(data: { phone_numbers: PhoneNumberInfo[] | null }): string {
  const phones = data.phone_numbers || [];
  if (phones.length === 0) return '\n  No phone numbers found.\n';

  const lines = ['\n  ' + chalk.bold('Your phone numbers') + '\n'];
  for (const p of phones) {
    lines.push(`  ${fmtPhone(p.phone_number)}`);
  }
  lines.push('');
  return lines.join('\n');
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

  const header = `${pad('ID', 38)} ${pad('PARTICIPANTS', 36)} ${pad('SERVICE', 12)} UPDATED`;
  const rows = chats.map((c) => {
    const participants = (c.handles || [])
      .filter((h) => !h.is_me)
      .map((h) => fmtPhone(h.handle))
      .join(', ');
    return `${pad(c.id, 38)} ${pad(truncate(c.display_name || participants, 34), 36)} ${pad(c.service || '–', 12)} ${fmtDate(c.updated_at ?? null)}`;
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
    .map((h) => fmtPhone(h.handle))
    .join(', ');
  return [
    chalk.green('✓') + ` Message sent${recipients ? ` to ${recipients}` : ''}`,
    kvLine('Chat ID', data.chat.id),
    kvLine('Message ID', data.chat.message.id),
  ].join('\n');
}

export function formatChatDetail(data: Chat): string {
  const participants = (data.handles || []).map((h) => {
    const me = h.is_me ? chalk.dim(' (you)') : '';
    return `    ${fmtPhone(h.handle)}${me}`;
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
  return [
    chalk.green('✓') + ' Message sent',
    kvLine('Message ID', data.message.id),
    kvLine('Chat ID', data.chat_id),
  ].join('\n');
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
  delivery_status?: string | null;
}

export function formatMessagesList(data: { messages: Message[]; next_cursor?: string | null }): string {
  const msgs = data.messages;
  if (msgs.length === 0) return 'No messages found.';

  const rows = msgs.map((m) => {
    const sender = m.from_handle?.handle
      ? fmtPhone(m.from_handle.handle)
      : m.from ? fmtPhone(m.from) : (m.is_from_me ? chalk.dim('you') : '?');
    const body = (m.parts || [])
      .map((p) => (p?.type === 'text' ? p.value : `[${p?.type || 'media'}]`))
      .join(' ')
      || '';
    const status = m.delivery_status || (m.is_read ? 'read' : m.is_delivered ? 'delivered' : 'sent');
    const direction = m.is_from_me ? chalk.dim('→') : chalk.green('←');
    return `${chalk.dim(fmtDate(m.created_at))}  ${direction} ${chalk.bold(sender)}  ${truncate(body, 50)}  ${statusColor(status)}`;
  });
  const lines = [...rows];
  if (data.next_cursor) {
    lines.push(chalk.dim(`\nMore results available. Use --cursor ${data.next_cursor}`));
  }
  return lines.join('\n');
}

export function formatMessageDetail(data: Message): string {
  const sender = data.from_handle?.handle
    ? fmtPhone(data.from_handle.handle)
    : data.from ? fmtPhone(data.from) : (data.is_from_me ? 'you' : '–');
  const body = (data.parts || [])
    .map((p) => (p?.type === 'text' ? p.value : `[${p?.type || 'media'}]`))
    .join(' ')
    || '–';
  const status = data.delivery_status || (data.is_read ? 'read' : data.is_delivered ? 'delivered' : 'sent');

  const lines = [
    kvLine('ID', data.id),
    kvLine('Chat', data.chat_id),
    kvLine('From', sender),
    kvLine('Direction', data.is_from_me ? 'outbound' : 'inbound'),
    kvLine('Service', data.service || '–'),
    kvLine('Status', statusColor(status)),
    kvLine('Body', body),
    kvLine('Sent', fmtDateAbsolute(data.sent_at)),
    kvLine('Delivered', data.is_delivered ? fmtDateAbsolute(data.delivered_at) : chalk.dim('–')),
    kvLine('Read', data.is_read ? fmtDateAbsolute(data.read_at) : chalk.dim('–')),
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
  return chalk.green('✓') + ` ${verb} ${type} reaction ${operation === 'add' ? 'to' : 'from'} ${messageId}`;
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

  const header = `${pad('ID', 38)} ${pad('URL', 40)} ${pad('EVENTS', 8)} ACTIVE`;
  const rows = subs.map(
    (s) =>
      `${pad(s.id, 38)} ${pad(truncate(s.target_url, 38), 40)} ${pad(String(s.subscribed_events.length), 8)} ${s.is_active ? chalk.green('active') : chalk.red('inactive')}`
  );
  return [chalk.dim(header), ...rows].join('\n');
}

export function formatWebhookDetail(data: WebhookSubscription): string {
  const lines = [
    kvLine('ID', data.id),
    kvLine('URL', data.target_url),
    kvLine('Active', data.is_active ? chalk.green('Yes') : chalk.red('No')),
    kvLine('Created', fmtDateAbsolute(data.created_at)),
    kvLine('Updated', fmtDateAbsolute(data.updated_at)),
    `  ${chalk.bold('Events:')}`,
    ...data.subscribed_events.map((e) => `    ${e}`),
  ];
  if (data.signing_secret) {
    lines.splice(3, 0, '');
    lines.splice(3, 0, `  ${chalk.yellow('⚠ Signing Secret (save this — it cannot be retrieved later):')}`);
    lines.splice(4, 0, `  ${chalk.bold(data.signing_secret)}`);
    lines.splice(5, 0, '');
  }
  return lines.join('\n');
}

export function formatWebhookCreated(data: WebhookSubscription): string {
  const lines = [
    chalk.green('✓') + ' Webhook subscription created',
    '',
    kvLine('ID', data.id),
    kvLine('URL', data.target_url),
    kvLine('Events', data.subscribed_events.join(', ')),
  ];
  if (data.signing_secret) {
    lines.push('');
    lines.push(`  ${chalk.yellow('⚠ Save your signing secret — it cannot be retrieved later:')}`);
    lines.push(`  ${chalk.bold(data.signing_secret)}`);
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
    kvLine('Size', formatBytes(data.size_bytes)),
    kvLine('Status', statusColor(data.status)),
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
