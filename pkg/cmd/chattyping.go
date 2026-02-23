// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package cmd

import (
	"context"
	"fmt"

	"github.com/linq-team/linq-cli/internal/apiquery"
	"github.com/linq-team/linq-cli/internal/requestflag"
	"github.com/stainless-sdks/linq-api-v3-go"
	"github.com/urfave/cli/v3"
)

var chatsTypingStart = cli.Command{
	Name:    "start",
	Usage:   "Send a typing indicator to show that someone is typing in the chat.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "chat-id",
			Required: true,
		},
	},
	Action:          handleChatsTypingStart,
	HideHelpCommand: true,
}

var chatsTypingStop = cli.Command{
	Name:    "stop",
	Usage:   "Stop the typing indicator for the chat.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "chat-id",
			Required: true,
		},
	},
	Action:          handleChatsTypingStop,
	HideHelpCommand: true,
}

func handleChatsTypingStart(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("chat-id") && len(unusedArgs) > 0 {
		cmd.Set("chat-id", unusedArgs[0])
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

	return client.Chats.Typing.Start(ctx, cmd.Value("chat-id").(string), options...)
}

func handleChatsTypingStop(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("chat-id") && len(unusedArgs) > 0 {
		cmd.Set("chat-id", unusedArgs[0])
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

	return client.Chats.Typing.Stop(ctx, cmd.Value("chat-id").(string), options...)
}
