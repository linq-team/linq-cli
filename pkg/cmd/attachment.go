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

var attachmentsCreate = cli.Command{
	Name:    "create",
	Usage:   "**This endpoint is optional.** You can send media by simply providing a URL in\nyour message's media part — no pre-upload required. Use this endpoint only when\nyou want to upload a file ahead of time for reuse or latency optimization.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "content-type",
			Usage:    "Supported MIME types for file attachments and media URLs.\n\n**Images:** image/jpeg, image/png, image/gif, image/heic, image/heif, image/tiff, image/bmp\n\n**Videos:** video/mp4, video/quicktime, video/mpeg, video/3gpp\n\n**Audio:** audio/mpeg, audio/mp4, audio/x-m4a, audio/x-caf, audio/wav, audio/aiff, audio/aac, audio/amr\n\n**Documents:** application/pdf, text/plain, text/markdown, text/vcard, text/rtf, text/csv, text/html, text/calendar, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.apple.pages, application/vnd.apple.numbers, application/vnd.apple.keynote, application/epub+zip, application/zip\n\n**Unsupported:** WebP, SVG, FLAC, OGG, and executable files are explicitly rejected.\n",
			Required: true,
			BodyPath: "content_type",
		},
		&requestflag.Flag[string]{
			Name:     "filename",
			Usage:    "Name of the file to upload",
			Required: true,
			BodyPath: "filename",
		},
		&requestflag.Flag[int64]{
			Name:     "size-bytes",
			Usage:    "Size of the file in bytes (max 100MB)",
			Required: true,
			BodyPath: "size_bytes",
		},
	},
	Action:          handleAttachmentsCreate,
	HideHelpCommand: true,
}

var attachmentsRetrieve = cli.Command{
	Name:    "retrieve",
	Usage:   "Retrieve metadata for a specific attachment including its status, file\ninformation, and URLs for downloading.",
	Suggest: true,
	Flags: []cli.Flag{
		&requestflag.Flag[string]{
			Name:     "attachment-id",
			Required: true,
		},
	},
	Action:          handleAttachmentsRetrieve,
	HideHelpCommand: true,
}

func handleAttachmentsCreate(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()

	if len(unusedArgs) > 0 {
		return fmt.Errorf("Unexpected extra arguments: %v", unusedArgs)
	}

	params := linqapiv3.AttachmentNewParams{}

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
	_, err = client.Attachments.New(ctx, params, options...)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "attachments create", obj, format, transform)
}

func handleAttachmentsRetrieve(ctx context.Context, cmd *cli.Command) error {
	client := linqapiv3.NewClient(getDefaultRequestOptions(cmd)...)
	unusedArgs := cmd.Args().Slice()
	if !cmd.IsSet("attachment-id") && len(unusedArgs) > 0 {
		cmd.Set("attachment-id", unusedArgs[0])
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
	_, err = client.Attachments.Get(ctx, cmd.Value("attachment-id").(string), options...)
	if err != nil {
		return err
	}

	obj := gjson.ParseBytes(res)
	format := cmd.Root().String("format")
	transform := cmd.Root().String("transform")
	return ShowJSON(os.Stdout, "attachments retrieve", obj, format, transform)
}
