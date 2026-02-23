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

var chatsCreate = requestflag.WithInnerFlags(cli.Command{
	Name:    "create",
	Usage:   "Create a new chat with specified participants and send an initial message. The\ninitial message is required when creating a chat.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "from",
			Usage:    "Sender phone number in E.164 format. Must be a phone number that the\nauthenticated partner has permission to send from.\n",
			Required: true,
			BodyPath: "from",
		},
		&requestflag.Flag[map[string]any]{
			Name:     "message",
			Usage:    "Message content container. Groups all message-related fields together,\nseparating the \"what\" (message content) from the \"where\" (routing fields like from/to).\n",
			Required: true,
			BodyPath: "message",
		},
		&requestflag.Flag[[]string]{
			Name:     "to",
			Usage:    "Array of recipient handles (phone numbers in E.164 format or email addresses).\nFor individual chats, provide one recipient. For group chats, provide multiple.\n",
			Required: true,
			BodyPath: "to",
		},
	},
	Action:          handleChatsCreate,
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

var chatsRetrieve = cli.Command{
	Name:    "retrieve",
	Usage:   "Retrieve a chat by its unique identifier.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "chat-id",
			Required: true,
		},
	},
	Action:          handleChatsRetrieve,
	HideHelpCommand: true,
}

var chatsUpdate = cli.Command{
	Name:    "update",
	Usage:   "Update chat properties such as display name and group chat icon.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "chat-id",
			Required: true,
		},
		&requestflag.Flag[string]{
			Name:     "display-name",
			Usage:    "New display name for the chat (group chats only)",
			BodyPath: "display_name",
		},
		&requestflag.Flag[string]{
			Name:     "group-chat-icon",
			Usage:    "URL of an image to set as the group chat icon (group chats only)",
			BodyPath: "group_chat_icon",
		},
	},
	Action:          handleChatsUpdate,
	HideHelpCommand: true,
}

var chatsList = cli.Command{
	Name:    "list",
	Usage:   "Retrieves a paginated list of chats for the authenticated partner filtered by\nphone number. Returns all chats involving the specified phone number with their\nparticipants and recent activity.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:      "from",
			Usage:     "Phone number to filter chats by. Returns all chats made from this phone number.\nMust be in E.164 format (e.g., `+13343284472`). The `+` is automatically URL-encoded by HTTP clients.\n",
			Required:  true,
			QueryPath: "from",
		},
		&requestflag.Flag[string]{
			Name:      "cursor",
			Usage:     "Pagination cursor from the previous response's `next_cursor` field.\nOmit this parameter for the first page of results.\n",
			QueryPath: "cursor",
		},
		&requestflag.Flag[int64]{
			Name:      "limit",
			Usage:     "Maximum number of chats to return per page",
			Default:   20,
			QueryPath: "limit",
		},
	},
	Action:          handleChatsList,
	HideHelpCommand: true,
}

var chatsMarkAsRead = cli.Command{
	Name:    "mark-as-read",
	Usage:   "Mark all messages in a chat as read.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "chat-id",
			Required: true,
		},
	},
	Action:          handleChatsMarkAsRead,
	HideHelpCommand: true,
}

var chatsSendVoicememo = cli.Command{
	Name:    "send-voicememo",
	Usage:   "Send an audio file as an **iMessage voice memo bubble** to all participants in a\nchat. Voice memos appear with iMessage's native inline playback UI, unlike\nregular audio attachments sent via media parts which appear as downloadable\nfiles.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "chat-id",
			Required: true,
		},
		&requestflag.Flag[string]{
			Name:     "from",
			Usage:    "Sender phone number in E.164 format",
			Required: true,
			BodyPath: "from",
		},
		&requestflag.Flag[string]{
			Name:     "voice-memo-url",
			Usage:    "URL of the voice memo audio file. Must be a publicly accessible HTTPS URL.",
			Required: true,
			BodyPath: "voice_memo_url",
		},
	},
	Action:          handleChatsSendVoicememo,
	HideHelpCommand: true,
}

var chatsShareContactCard = cli.Command{
	Name:    "share-contact-card",
	Usage:   "Share your contact information (Name and Photo Sharing) with a chat.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "chat-id",
			Required: true,
		},
	},
	Action:          handleChatsShareContactCard,
	HideHelpCommand: true,
}

func handleChatsCreate(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()

	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.ChatNewParams{}

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
	_, err = client.Chats.New(ctx, params, options...)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "chats create", obj, format, transform)
}

func handleChatsRetrieve(ctx context.Context, cmd *cli.Command) error {
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

	var res []byte
	options = append(options, option.WithResponseBodyInto(&res))
	_, err = client.Chats.Get(ctx, cmd.Value("chat-id").(string), options...)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "chats retrieve", obj, format, transform)
}

func handleChatsUpdate(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("chat-id") && len(unusedArgs) > 0 {
		cmd.Set("chat-id", unusedArgs[0])
		unusedArgs = unusedArgs[1:]
	}
	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.ChatUpdateParams{}

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
	_, err = client.Chats.Update(
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
	return ShowJSON(os.Stdout, "chats update", obj, format, transform)
}

func handleChatsList(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()

	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.ChatListParams{}

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
	_, err = client.Chats.List(ctx, params, options...)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "chats list", obj, format, transform)
}

func handleChatsMarkAsRead(ctx context.Context, cmd *cli.Command) error {
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

	return client.Chats.MarkAsRead(ctx, cmd.Value("chat-id").(string), options...)
}

func handleChatsSendVoicememo(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("chat-id") && len(unusedArgs) > 0 {
		cmd.Set("chat-id", unusedArgs[0])
		unusedArgs = unusedArgs[1:]
	}
	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.ChatSendVoicememoParams{}

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
	_, err = client.Chats.SendVoicememo(
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
	return ShowJSON(os.Stdout, "chats send-voicememo", obj, format, transform)
}

func handleChatsShareContactCard(ctx context.Context, cmd *cli.Command) error {
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

	return client.Chats.ShareContactCard(ctx, cmd.Value("chat-id").(string), options...)
}
