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

var messagesRetrieve = cli.Command{
	Name:    "retrieve",
	Usage:   "Retrieve a specific message by its ID. This endpoint returns the full message\ndetails including text, attachments, reactions, and metadata.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "message-id",
			Required: true,
		},
	},
	Action:          handleMessagesRetrieve,
	HideHelpCommand: true,
}

var messagesDelete = cli.Command{
	Name:    "delete",
	Usage:   "Deletes a message from the Linq API only. This does NOT unsend or remove the\nmessage from the actual chat - recipients will still see the message.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "message-id",
			Required: true,
		},
		&requestflag.Flag[string]{
			Name:     "chat-id",
			Usage:    "ID of the chat containing the message to delete",
			Required: true,
			BodyPath: "chat_id",
		},
	},
	Action:          handleMessagesDelete,
	HideHelpCommand: true,
}

var messagesAddReaction = cli.Command{
	Name:    "add-reaction",
	Usage:   "Add or remove emoji reactions to messages. Reactions let users express their\nresponse to a message without sending a new message.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "message-id",
			Required: true,
		},
		&requestflag.Flag[string]{
			Name:     "operation",
			Usage:    "Whether to add or remove the reaction",
			Required: true,
			BodyPath: "operation",
		},
		&requestflag.Flag[string]{
			Name:     "type",
			Usage:    "Type of reaction. Standard iMessage tapbacks are love, like, dislike, laugh, emphasize, question.\nCustom emoji reactions have type \"custom\" with the actual emoji in the custom_emoji field.\n",
			Required: true,
			BodyPath: "type",
		},
		&requestflag.Flag[string]{
			Name:     "custom-emoji",
			Usage:    "Custom emoji string. Required when type is \"custom\".\n",
			BodyPath: "custom_emoji",
		},
		&requestflag.Flag[int64]{
			Name:     "part-index",
			Usage:    "Optional index of the message part to react to.\nIf not provided, reacts to the entire message (part 0).\n",
			BodyPath: "part_index",
		},
	},
	Action:          handleMessagesAddReaction,
	HideHelpCommand: true,
}

var messagesRetrieveThread = cli.Command{
	Name:    "retrieve-thread",
	Usage:   "Retrieve all messages in a conversation thread. Given any message ID in the\nthread, returns the originator message and all replies in chronological order.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "message-id",
			Required: true,
		},
		&requestflag.Flag[string]{
			Name:      "cursor",
			Usage:     "Pagination cursor from previous next_cursor response",
			QueryPath: "cursor",
		},
		&requestflag.Flag[int64]{
			Name:      "limit",
			Usage:     "Maximum number of messages to return",
			Default:   50,
			QueryPath: "limit",
		},
		&requestflag.Flag[string]{
			Name:      "order",
			Usage:     "Sort order for messages (asc = oldest first, desc = newest first)",
			Default:   "asc",
			QueryPath: "order",
		},
	},
	Action:          handleMessagesRetrieveThread,
	HideHelpCommand: true,
}

func handleMessagesRetrieve(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("message-id") && len(unusedArgs) > 0 {
		cmd.Set("message-id", unusedArgs[0])
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
	_, err = client.Messages.Get(ctx, cmd.Value("message-id").(string), options...)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "messages retrieve", obj, format, transform)
}

func handleMessagesDelete(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("message-id") && len(unusedArgs) > 0 {
		cmd.Set("message-id", unusedArgs[0])
		unusedArgs = unusedArgs[1:]
	}
	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.MessageDeleteParams{}

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

	return client.Messages.Delete(
		ctx,
		cmd.Value("message-id").(string),
		params,
		options...,
	)
}

func handleMessagesAddReaction(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("message-id") && len(unusedArgs) > 0 {
		cmd.Set("message-id", unusedArgs[0])
		unusedArgs = unusedArgs[1:]
	}
	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.MessageAddReactionParams{}

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
	_, err = client.Messages.AddReaction(
		ctx,
		cmd.Value("message-id").(string),
		params,
		options...,
	)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "messages add-reaction", obj, format, transform)
}

func handleMessagesRetrieveThread(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("message-id") && len(unusedArgs) > 0 {
		cmd.Set("message-id", unusedArgs[0])
		unusedArgs = unusedArgs[1:]
	}
	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.MessageGetThreadParams{}

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
	_, err = client.Messages.GetThread(
		ctx,
		cmd.Value("message-id").(string),
		params,
		options...,
	)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "messages retrieve-thread", obj, format, transform)
}
