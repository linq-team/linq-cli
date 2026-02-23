// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package cmd

import (
	"context"
	"fmt"
	"os"

	"github.com/linq-team/linq-cli/internal/apiquery"
	"github.com/stainless-sdks/linq-api-v3-go"
	"github.com/stainless-sdks/linq-api-v3-go/option"
	"github.com/tidwall/gjson"
	"github.com/urfave/cli/v3"
)

var webhookEventsList = cli.Command{
	Name:            "list",
	Usage:           "Returns all available webhook event types that can be subscribed to. Use this\nendpoint to discover valid values for the `subscribed_events` field when\ncreating or updating webhook subscriptions.",
	Suggest:         true,
	Flags:           []cli.Flag{},
	Action:          handleWebhookEventsList,
	HideHelpCommand: true,
}

func handleWebhookEventsList(ctx context.Context, cmd *cli.Command) error {
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
	_, err = client.WebhookEvents.List(ctx, options...)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "webhook-events list", obj, format, transform)
}
