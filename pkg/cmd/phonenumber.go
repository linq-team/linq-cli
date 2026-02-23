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

var phoneNumbersList = cli.Command{
	Name:            "list",
	Usage:           "Returns all phone numbers assigned to the authenticated partner. Use this\nendpoint to discover which phone numbers are available for use as the `from`\nfield when creating a chat, listing chats, or sending a voice memo.",
	Suggest:         true,
	Flags:           []cli.Flag{},
	Action:          handlePhoneNumbersList,
	HideHelpCommand: true,
}

func handlePhoneNumbersList(ctx context.Context, cmd *cli.Command) error {
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
	_, err = client.PhoneNumbers.List(ctx, options...)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "phone-numbers list", obj, format, transform)
}
