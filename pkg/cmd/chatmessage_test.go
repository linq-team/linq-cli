// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package cmd

import (
	"testing"

	"github.com/stainless-sdks/linq-api-v3-cli/internal/mocktest"
	"github.com/stainless-sdks/linq-api-v3-cli/internal/requestflag"
)

func TestChatsMessagesList(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats:messages", "list",
		"--chat-id", "550e8400-e29b-41d4-a716-446655440000",
		"--cursor", "cursor",
		"--limit", "1",
	)
}

func TestChatsMessagesSend(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats:messages", "send",
		"--chat-id", "550e8400-e29b-41d4-a716-446655440000",
		"--message", "{parts: [{type: text, value: 'Hello, world!', idempotency_key: text-part-abc123}], effect: {name: confetti, type: screen}, idempotency_key: msg-abc123xyz, preferred_service: iMessage, reply_to: {message_id: 550e8400-e29b-41d4-a716-446655440000, part_index: 0}}",
	)

	// Check that inner flags have been set up correctly
	requestflag.CheckInnerFlags(chatsMessagesSend)

	// Alternative argument passing style using inner flags
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats:messages", "send",
		"--chat-id", "550e8400-e29b-41d4-a716-446655440000",
		"--message.parts", "[{type: text, value: 'Hello, world!', idempotency_key: text-part-abc123}]",
		"--message.effect", "{name: confetti, type: screen}",
		"--message.idempotency-key", "msg-abc123xyz",
		"--message.preferred-service", "iMessage",
		"--message.reply-to", "{message_id: 550e8400-e29b-41d4-a716-446655440000, part_index: 0}",
	)
}
