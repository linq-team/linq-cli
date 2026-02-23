// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package cmd

import (
	"context"
	"fmt"
	"os"

	"github.com/linq-team/linq-cli/internal/apiquery"
	"github.com/linq-team/linq-cli/internal/requestflag"
	"github.com/stainless-sdks/linq-api-v3-go"
	"github.com/stainless-sdks/linq-api-v3-go/option"
	"github.com/tidwall/gjson"
	"github.com/urfave/cli/v3"
)

var chatsParticipantsAdd = cli.Command{
	Name:    "add",
	Usage:   "Add a new participant to an existing group chat.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "chat-id",
			Required: true,
		},
		&requestflag.Flag[string]{
			Name:     "handle",
			Usage:    "Phone number (E.164 format) or email address of the participant to add",
			Required: true,
			BodyPath: "handle",
		},
	},
	Action:          handleChatsParticipantsAdd,
	HideHelpCommand: true,
}

var chatsParticipantsRemove = cli.Command{
	Name:    "remove",
	Usage:   "Remove a participant from an existing group chat.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "chat-id",
			Required: true,
		},
		&requestflag.Flag[string]{
			Name:     "handle",
			Usage:    "Phone number (E.164 format) or email address of the participant to remove",
			Required: true,
			BodyPath: "handle",
		},
	},
	Action:          handleChatsParticipantsRemove,
	HideHelpCommand: true,
}

func handleChatsParticipantsAdd(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("chat-id") && len(unusedArgs) > 0 {
		cmd.Set("chat-id", unusedArgs[0])
		unusedArgs = unusedArgs[1:]
	}
	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.ChatParticipantAddParams{}

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
	_, err = client.Chats.Participants.Add(
		ctx,
		cmd.Value("chat-id").(string),
		params,
		options...,
	)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "chats:participants add", obj, format, transform)
}

func handleChatsParticipantsRemove(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("chat-id") && len(unusedArgs) > 0 {
		cmd.Set("chat-id", unusedArgs[0])
		unusedArgs = unusedArgs[1:]
	}
	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.ChatParticipantRemoveParams{}

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
	_, err = client.Chats.Participants.Remove(
		ctx,
		cmd.Value("chat-id").(string),
		params,
		options...,
	)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "chats:participants remove", obj, format, transform)
}
