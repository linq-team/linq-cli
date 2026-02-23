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

var chatsMessagesList = cli.Command{
	Name:    "list",
	Usage:   "Retrieve messages from a specific chat with pagination support.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "chat-id",
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
	},
	Action:          handleChatsMessagesList,
	HideHelpCommand: true,
}

var chatsMessagesSend = requestflag.WithInnerFlags(cli.Command{
	Name:    "send",
	Usage:   "Send a message to an existing chat. Use this endpoint when you already have a\nchat ID and want to send additional messages to it.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "chat-id",
			Required: true,
		},
		&requestflag.Flag[map[string]any]{
			Name:     "message",
			Usage:    "Message content container. Groups all message-related fields together,\nseparating the \"what\" (message content) from the \"where\" (routing fields like from/to).\n",
			Required: true,
			BodyPath: "message",
		},
	},
	Action:          handleChatsMessagesSend,
	HideHelpCommand: true,
}, map[string][]requestflag.HasOuterFlag{
	"message": {
		&requestflag.InnerFlag[[]map[string]any]{
			Name:       "message.parts",
			Usage:      "Array of message parts. Each part can be either text or media.\nParts are displayed in order. Text and media can be mixed.\n\n**Supported Media:**\n- Images: .jpg, .jpeg, .png, .gif, .heic, .heif, .tif, .tiff, .bmp\n- Videos: .mp4, .mov, .m4v, .mpeg, .mpg, .3gp\n- Audio: .m4a, .mp3, .aac, .caf, .wav, .aiff, .amr\n- Documents: .pdf, .txt, .rtf, .csv, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pages, .numbers, .key, .epub, .zip, .html, .htm\n- Contact & Calendar: .vcf, .ics\n\n**Audio:**\n- Audio files (.m4a, .mp3, .aac, .caf, .wav, .aiff, .amr) are fully supported as media parts\n- To send audio as an **iMessage voice memo bubble** (inline playback UI), use the dedicated\n  `/v3/chats/{chatId}/voicememo` endpoint instead\n\n**Validation Rule:** Consecutive text parts are not allowed. Text parts must\nbe separated by media parts. For example, [text, text] is invalid, but\n[text, media, text] is valid.\n",
			InnerField: "parts",
		},
		&requestflag.InnerFlag[map[string]any]{
			Name:       "message.effect",
			Usage:      "iMessage effect applied to a message (screen or bubble effect)",
			InnerField: "effect",
		},
		&requestflag.InnerFlag[string]{
			Name:       "message.idempotency-key",
			Usage:      "Optional idempotency key for this message.\nUse this to prevent duplicate sends of the same message.\n",
			InnerField: "idempotency_key",
		},
		&requestflag.InnerFlag[string]{
			Name:       "message.preferred-service",
			Usage:      "Preferred messaging service to use for this message.\nIf not specified, uses default fallback chain: iMessage → RCS → SMS.\n- iMessage: Enforces iMessage without fallback to RCS or SMS. Message fails if recipient doesn't support iMessage.\n- RCS: Enforces RCS or SMS (no iMessage). Uses RCS if recipient supports it, otherwise falls back to SMS.\n- SMS: Enforces SMS (no iMessage). Uses RCS if recipient supports it, otherwise falls back to SMS.\n",
			InnerField: "preferred_service",
		},
		&requestflag.InnerFlag[map[string]any]{
			Name:       "message.reply-to",
			Usage:      "Indicates this message is a threaded reply to another message",
			InnerField: "reply_to",
		},
	},
})

func handleChatsMessagesList(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("chat-id") && len(unusedArgs) > 0 {
		cmd.Set("chat-id", unusedArgs[0])
		unusedArgs = unusedArgs[1:]
	}
	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.ChatMessageListParams{}

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
	_, err = client.Chats.Messages.List(
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
	return ShowJSON(os.Stdout, "chats:messages list", obj, format, transform)
}

func handleChatsMessagesSend(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("chat-id") && len(unusedArgs) > 0 {
		cmd.Set("chat-id", unusedArgs[0])
		unusedArgs = unusedArgs[1:]
	}
	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.ChatMessageSendParams{}

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
	_, err = client.Chats.Messages.Send(
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
	return ShowJSON(os.Stdout, "chats:messages send", obj, format, transform)
}
