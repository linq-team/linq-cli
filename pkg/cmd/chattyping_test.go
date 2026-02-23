// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package cmd

import (
	"testing"

	"github.com/stainless-sdks/linq-api-v3-cli/internal/mocktest"
)

func TestChatsTypingStart(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats:typing", "start",
		"--chat-id", "550e8400-e29b-41d4-a716-446655440000",
	)
}

func TestChatsTypingStop(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats:typing", "stop",
		"--chat-id", "550e8400-e29b-41d4-a716-446655440000",
	)
}
