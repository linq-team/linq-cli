// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package cmd

import (
	"testing"

	"github.com/linq-team/linq-cli/internal/mocktest"
)

func TestChatsParticipantsAdd(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats:participants", "add",
		"--chat-id", "550e8400-e29b-41d4-a716-446655440000",
		"--handle", "+12052499136",
	)
}

func TestChatsParticipantsRemove(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"chats:participants", "remove",
		"--chat-id", "550e8400-e29b-41d4-a716-446655440000",
		"--handle", "+12052499136",
	)
}
