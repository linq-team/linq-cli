// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package cmd

import (
	"testing"

	"github.com/linq-team/linq-cli/internal/mocktest"
)

func TestMessagesRetrieve(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"messages", "retrieve",
		"--message-id", "69a37c7d-af4f-4b5e-af42-e28e98ce873a",
	)
}

func TestMessagesDelete(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"messages", "delete",
		"--message-id", "69a37c7d-af4f-4b5e-af42-e28e98ce873a",
		"--chat-id", "94c6bf33-31d9-40e3-a0e9-f94250ecedb9",
	)
}

func TestMessagesAddReaction(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"messages", "add-reaction",
		"--message-id", "69a37c7d-af4f-4b5e-af42-e28e98ce873a",
		"--operation", "add",
		"--type", "love",
		"--custom-emoji", "😍",
		"--part-index", "1",
	)
}

func TestMessagesRetrieveThread(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"messages", "retrieve-thread",
		"--message-id", "69a37c7d-af4f-4b5e-af42-e28e98ce873a",
		"--cursor", "cursor",
		"--limit", "1",
		"--order", "asc",
	)
}
