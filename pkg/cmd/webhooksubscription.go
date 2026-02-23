// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package cmd

import (
	"context"
	"fmt"
	"os"

	"github.com/stainless-sdks/linq-api-v3-cli/internal/apiquery"
	"github.com/stainless-sdks/linq-api-v3-cli/internal/requestflag"
	"github.com/stainless-sdks/linq-api-v3-go"
	"github.com/stainless-sdks/linq-api-v3-go/option"
	"github.com/tidwall/gjson"
	"github.com/urfave/cli/v3"
)

var webhookSubscriptionsCreate = cli.Command{
	Name:    "create",
	Usage:   "Create a new webhook subscription to receive events at a target URL. Upon\ncreation, a signing secret is generated for verifying webhook authenticity.\n**Store this secret securely — it cannot be retrieved later.**",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[[]string]{
			Name:     "subscribed-event",
			Usage:    "List of event types to subscribe to",
			Required: true,
			BodyPath: "subscribed_events",
		},
		&requestflag.Flag[string]{
			Name:     "target-url",
			Usage:    "URL where webhook events will be sent. Must be HTTPS.",
			Required: true,
			BodyPath: "target_url",
		},
	},
	Action:          handleWebhookSubscriptionsCreate,
	HideHelpCommand: true,
}

var webhookSubscriptionsRetrieve = cli.Command{
	Name:    "retrieve",
	Usage:   "Retrieve details for a specific webhook subscription including its target URL,\nsubscribed events, and current status.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "subscription-id",
			Required: true,
		},
	},
	Action:          handleWebhookSubscriptionsRetrieve,
	HideHelpCommand: true,
}

var webhookSubscriptionsUpdate = cli.Command{
	Name:    "update",
	Usage:   "Update an existing webhook subscription. You can modify the target URL,\nsubscribed events, or activate/deactivate the subscription.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "subscription-id",
			Required: true,
		},
		&requestflag.Flag[bool]{
			Name:     "is-active",
			Usage:    "Activate or deactivate the subscription",
			BodyPath: "is_active",
		},
		&requestflag.Flag[[]string]{
			Name:     "subscribed-event",
			Usage:    "Updated list of event types to subscribe to",
			BodyPath: "subscribed_events",
		},
		&requestflag.Flag[string]{
			Name:     "target-url",
			Usage:    "New target URL for webhook events",
			BodyPath: "target_url",
		},
	},
	Action:          handleWebhookSubscriptionsUpdate,
	HideHelpCommand: true,
}

var webhookSubscriptionsList = cli.Command{
	Name:            "list",
	Usage:           "Retrieve all webhook subscriptions for the authenticated partner. Returns a list\nof active and inactive subscriptions with their configuration and status.",
	Suggest:         true,
	Flags:           []cli.Flag{},
	Action:          handleWebhookSubscriptionsList,
	HideHelpCommand: true,
}

var webhookSubscriptionsDelete = cli.Command{
	Name:    "delete",
	Usage:   "Delete a webhook subscription.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "subscription-id",
			Required: true,
		},
	},
	Action:          handleWebhookSubscriptionsDelete,
	HideHelpCommand: true,
}

func handleWebhookSubscriptionsCreate(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()

	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.WebhookSubscriptionNewParams{}

	options, err := flagOptions(
		cmd,
		apiquery.NestedQueryFormatBrackets,
		apiquery.ArrayQueryFormatComma,
		ApplicationJSON,
		false,
	)
	if err != nil {
		return err
	}

	var res []byte
	options = append(options, option.WithResponseBodyInto(&res))
	_, err = client.WebhookSubscriptions.New(ctx, params, options...)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "webhook-subscriptions create", obj, format, transform)
}

func handleWebhookSubscriptionsRetrieve(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("subscription-id") && len(unusedArgs) > 0 {
		cmd.Set("subscription-id", unusedArgs[0])
		unusedArgs = unusedArgs[1:]
	}
	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	options, err := flagOptions(
		cmd,
		apiquery.NestedQueryFormatBrackets,
		apiquery.ArrayQueryFormatComma,
		EmptyBody,
		false,
	)
	if err != nil {
		return err
	}

	var res []byte
	options = append(options, option.WithResponseBodyInto(&res))
	_, err = client.WebhookSubscriptions.Get(ctx, cmd.Value("subscription-id").(string), options...)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "webhook-subscriptions retrieve", obj, format, transform)
}

func handleWebhookSubscriptionsUpdate(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("subscription-id") && len(unusedArgs) > 0 {
		cmd.Set("subscription-id", unusedArgs[0])
		unusedArgs = unusedArgs[1:]
	}
	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.WebhookSubscriptionUpdateParams{}

	options, err := flagOptions(
		cmd,
		apiquery.NestedQueryFormatBrackets,
		apiquery.ArrayQueryFormatComma,
		ApplicationJSON,
		false,
	)
	if err != nil {
		return err
	}

	var res []byte
	options = append(options, option.WithResponseBodyInto(&res))
	_, err = client.WebhookSubscriptions.Update(
		ctx,
		cmd.Value("subscription-id").(string),
		params,
		options...,
	)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "webhook-subscriptions update", obj, format, transform)
}

func handleWebhookSubscriptionsList(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()

	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	options, err := flagOptions(
		cmd,
		apiquery.NestedQueryFormatBrackets,
		apiquery.ArrayQueryFormatComma,
		EmptyBody,
		false,
	)
	if err != nil {
		return err
	}

	var res []byte
	options = append(options, option.WithResponseBodyInto(&res))
	_, err = client.WebhookSubscriptions.List(ctx, options...)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "webhook-subscriptions list", obj, format, transform)
}

func handleWebhookSubscriptionsDelete(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("subscription-id") && len(unusedArgs) > 0 {
		cmd.Set("subscription-id", unusedArgs[0])
		unusedArgs = unusedArgs[1:]
	}
	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	options, err := flagOptions(
		cmd,
		apiquery.NestedQueryFormatBrackets,
		apiquery.ArrayQueryFormatComma,
		EmptyBody,
		false,
	)
	if err != nil {
		return err
	}

	return client.WebhookSubscriptions.Delete(ctx, cmd.Value("subscription-id").(string), options...)
}
