// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package cmd

import (
	"testing"

	"github.com/stainless-sdks/linq-api-v3-cli/internal/mocktest"
)

func TestAttachmentsCreate(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"attachments", "create",
		"--content-type", "image/jpeg",
		"--filename", "photo.jpg",
		"--size-bytes", "1024000",
	)
}

func TestAttachmentsRetrieve(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"attachments", "retrieve",
		"--attachment-id", "abc12345-1234-5678-9abc-def012345678",
	)
}
