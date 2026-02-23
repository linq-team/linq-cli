// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package cmd

import (
	"testing"

	"github.com/linq-team/linq-cli/internal/mocktest"
)

func TestWebhookSubscriptionsCreate(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"webhook-subscriptions", "create",
		"--subscribed-event", "message.sent",
		"--subscribed-event", "message.delivered",
		"--subscribed-event", "message.read",
		"--target-url", "https://webhooks.example.com/linq/events",
	)
}

func TestWebhookSubscriptionsRetrieve(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"webhook-subscriptions", "retrieve",
		"--subscription-id", "b2c3d4e5-f6a7-8901-bcde-f23456789012",
	)
}

func TestWebhookSubscriptionsUpdate(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"webhook-subscriptions", "update",
		"--subscription-id", "b2c3d4e5-f6a7-8901-bcde-f23456789012",
		"--is-active=true",
		"--subscribed-event", "message.sent",
		"--subscribed-event", "message.delivered",
		"--target-url", "https://webhooks.example.com/linq/events",
	)
}

func TestWebhookSubscriptionsList(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"webhook-subscriptions", "list",
	)
}

func TestWebhookSubscriptionsDelete(t *testing.T) {
	t.Skip("Mock server tests are disabled")
	mocktest.TestRunMockTestWithFlags(
		t,
		"webhook-subscriptions", "delete",
		"--subscription-id", "b2c3d4e5-f6a7-8901-bcde-f23456789012",
	)
}
