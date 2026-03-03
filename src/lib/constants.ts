import type Linq from '@linqapp/sdk';

export type WebhookEventType =
  Linq.Webhooks.SubscriptionCreateParams['subscribed_events'][number];

const _WEBHOOK_EVENT_TYPES = [
  'message.sent',
  'message.received',
  'message.read',
  'message.delivered',
  'message.failed',
  'reaction.added',
  'reaction.removed',
  'participant.added',
  'participant.removed',
  'chat.created',
  'chat.group_name_updated',
  'chat.group_icon_updated',
  'chat.group_name_update_failed',
  'chat.group_icon_update_failed',
  'chat.typing_indicator.started',
  'chat.typing_indicator.stopped',
  'phone_number.status_updated',
] as const satisfies readonly WebhookEventType[];

export const WEBHOOK_EVENT_TYPES = _WEBHOOK_EVENT_TYPES;

export const SCREEN_EFFECTS = [
  'confetti',
  'fireworks',
  'lasers',
  'sparkles',
  'celebration',
  'hearts',
  'love',
  'balloons',
  'happy_birthday',
  'echo',
  'spotlight',
] as const;

export const BUBBLE_EFFECTS = ['slam', 'loud', 'gentle', 'invisible'] as const;

export const ALL_EFFECTS = [...SCREEN_EFFECTS, ...BUBBLE_EFFECTS];

export interface MessageBody {
  parts: Array<{ type: 'text'; value: string }>;
  effect?: { type: 'screen' | 'bubble'; name: string };
  reply_to?: { message_id: string; part_index: number };
}

export function buildMessageBody(
  message: string,
  options?: {
    effectType?: string;
    effectName?: string;
    replyToMessageId?: string;
    replyToPartIndex?: number;
  },
): MessageBody {
  const body: MessageBody = {
    parts: [{ type: 'text', value: message }],
  };

  if (options?.effectType && options?.effectName) {
    body.effect = { type: options.effectType as 'screen' | 'bubble', name: options.effectName };
  }

  if (options?.replyToMessageId) {
    body.reply_to = {
      message_id: options.replyToMessageId,
      part_index: options.replyToPartIndex ?? 0,
    };
  }

  return body;
}

export function normalizePhoneNumber(phone: string): string {
  if (phone.startsWith('+')) return phone;
  const digits = phone.replace(/[\s()\-.]/g, '');
  if (/^\d{10}$/.test(digits)) return `+1${digits}`;
  if (/^1\d{10}$/.test(digits)) return `+${digits}`;
  return phone;
}

export function maskToken(token: string): string {
  if (token.length <= 8) {
    return '****';
  }
  return token.slice(0, 4) + '****' + token.slice(-4);
}
