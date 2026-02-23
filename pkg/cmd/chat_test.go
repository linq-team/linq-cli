// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package cmd

import (
	"testing"

	"github.com/linq-team/linq-cli/internal/mocktest"
	"github.com/linq-team/linq-cli/internal/requestflag"
)

func TestChatsCreate(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats", "create",
		"--from", "+12052535597",
		"--message", "{parts: [{type: text, value: Hello! How can I help you today?, idempotency_key: text-part-abc123}], effect: {name: confetti, type: screen}, idempotency_key: msg-abc123xyz, preferred_service: iMessage, reply_to: {message_id: 550e8400-e29b-41d4-a716-446655440000, part_index: 0}}",
		"--to", "+12052532136",
	)

	// Check that inner flags have been set up correctly
	requestflag.CheckInnerFlags(chatsCreate)

	// Alternative argument passing style using inner flags
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats", "create",
		"--from", "+12052535597",
		"--message.parts", "[{type: text, value: Hello! How can I help you today?, idempotency_key: text-part-abc123}]",
		"--message.effect", "{name: confetti, type: screen}",
		"--message.idempotency-key", "msg-abc123xyz",
		"--message.preferred-service", "iMessage",
		"--message.reply-to", "{message_id: 550e8400-e29b-41d4-a716-446655440000, part_index: 0}",
		"--to", "+12052532136",
	)
}

func TestChatsRetrieve(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats", "retrieve",
		"--chat-id", "550e8400-e29b-41d4-a716-446655440000",
	)
}

func TestChatsUpdate(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats", "update",
		"--chat-id", "550e8400-e29b-41d4-a716-446655440000",
		"--display-name", "Team Discussion",
		"--group-chat-icon", "https://example.com/icon.png",
	)
}

func TestChatsList(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats", "list",
		"--from", "+13343284472",
		"--cursor", "20",
		"--limit", "20",
	)
}

func TestChatsMarkAsRead(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats", "mark-as-read",
		"--chat-id", "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
	)
}

func TestChatsSendVoicememo(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats", "send-voicememo",
		"--chat-id", "f19ee7b8-8533-4c5c-83ec-4ef8d6d1ddbd",
		"--from", "+12052535597",
		"--voice-memo-url", "https://example.com/voice-memo.m4a",
	)
}

func TestChatsShareContactCard(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats", "share-contact-card",
		"--chat-id", "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
	)
}
