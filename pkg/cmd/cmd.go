// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

package cmd

import (
	"compress/gzip"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/linq-team/linq-cli/internal/autocomplete"
	docs "github.com/urfave/cli-docs/v3"
	"github.com/urfave/cli/v3"
)

var (
	Command *cli.Command
)

func init() {
	Command = &cli.Command{
		Name:    "linq-api-v3",
		Usage:   "CLI for the linq-api-v3 API",
		Suggest: true,
		Version: Version,
		Flags: []cli.Flag{
			&cli.BoolFlag{
				Name:  "debug",
				Usage: "Enable debug logging",
			},
			&cli.StringFlag{
				Name:        "base-url",
				DefaultText: "url",
				Usage:       "Override the base URL for API requests",
			},
			&cli.StringFlag{
				Name:  "format",
				Usage: "The format for displaying response data (one of: " + strings.Join(OutputFormats, ", ") + ")",
				Value: "auto",
				Validator: func(format string) error {
					if !slices.Contains(OutputFormats, strings.ToLower(format)) {
						return fmt.Errorf("format must be one of: %s", strings.Join(OutputFormats, ", "))
					}
					return nil
				},
			},
			&cli.StringFlag{
				Name:  "format-error",
				Usage: "The format for displaying error data (one of: " + strings.Join(OutputFormats, ", ") + ")",
				Value: "auto",
				Validator: func(format string) error {
					if !slices.Contains(OutputFormats, strings.ToLower(format)) {
						return fmt.Errorf("format must be one of: %s", strings.Join(OutputFormats, ", "))
					}
					return nil
				},
			},
			&cli.StringFlag{
				Name:  "transform",
				Usage: "The GJSON transformation for data output.",
			},
			&cli.StringFlag{
				Name:  "transform-error",
				Usage: "The GJSON transformation for errors.",
			},
		},
		Commands: []*cli.Command{
			{
				Name:     "chats",
				Category: "API RESOURCE",
				Suggest:  true,
				Commands: []*cli.Command{
					&chatsCreate,
					&chatsRetrieve,
					&chatsUpdate,
					&chatsList,
					&chatsMarkAsRead,
					&chatsSendVoicememo,
					&chatsShareContactCard,
				},
			},
			{
				Name:     "chats:participants",
				Category: "API RESOURCE",
				Suggest:  true,
				Commands: []*cli.Command{
					&chatsParticipantsAdd,
					&chatsParticipantsRemove,
				},
			},
			{
				Name:     "chats:typing",
				Category: "API RESOURCE",
				Suggest:  true,
				Commands: []*cli.Command{
					&chatsTypingStart,
					&chatsTypingStop,
				},
			},
			{
				Name:     "chats:messages",
				Category: "API RESOURCE",
				Suggest:  true,
				Commands: []*cli.Command{
					&chatsMessagesList,
					&chatsMessagesSend,
				},
			},
			{
				Name:     "messages",
				Category: "API RESOURCE",
				Suggest:  true,
				Commands: []*cli.Command{
					&messagesRetrieve,
					&messagesDelete,
					&messagesAddReaction,
					&messagesRetrieveThread,
				},
			},
			{
				Name:     "attachments",
				Category: "API RESOURCE",
				Suggest:  true,
				Commands: []*cli.Command{
					&attachmentsCreate,
					&attachmentsRetrieve,
				},
			},
			{
				Name:     "phonenumbers",
				Category: "API RESOURCE",
				Suggest:  true,
				Commands: []*cli.Command{
					&phonenumbersList,
				},
			},
			{
				Name:     "phone-numbers",
				Category: "API RESOURCE",
				Suggest:  true,
				Commands: []*cli.Command{
					&phoneNumbersList,
				},
			},
			{
				Name:     "webhook-events",
				Category: "API RESOURCE",
				Suggest:  true,
				Commands: []*cli.Command{
					&webhookEventsList,
				},
			},
			{
				Name:     "webhook-subscriptions",
				Category: "API RESOURCE",
				Suggest:  true,
				Commands: []*cli.Command{
					&webhookSubscriptionsCreate,
					&webhookSubscriptionsRetrieve,
					&webhookSubscriptionsUpdate,
					&webhookSubscriptionsList,
					&webhookSubscriptionsDelete,
				},
			},
			{
				Name:            "@manpages",
				Usage:           "Generate documentation for 'man'",
				UsageText:       "linq-api-v3 @manpages [-o linq-api-v3.1] [--gzip]",
				Hidden:          true,
				Action:          generateManpages,
				HideHelpCommand: true,
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:    "output",
						Aliases: []string{"o"},
						Usage:   "write manpages to the given folder",
						Value:   "man",
					},
					&cli.BoolFlag{
						Name:    "gzip",
						Aliases: []string{"z"},
						Usage:   "output gzipped manpage files to .gz",
						Value:   true,
					},
					&cli.BoolFlag{
						Name:    "text",
						Aliases: []string{"z"},
						Usage:   "output uncompressed text files",
						Value:   false,
					},
				},
			},
			{
				Name:            "__complete",
				Hidden:          true,
				HideHelpCommand: true,
				Action:          autocomplete.ExecuteShellCompletion,
			},
			{
				Name:            "@completion",
				Hidden:          true,
				HideHelpCommand: true,
				Action:          autocomplete.OutputCompletionScript,
			},
		},
		HideHelpCommand: true,
	}
}

func generateManpages(ctx context.Context, c *cli.Command) error {
	manpage, err := docs.ToManWithSection(Command, 1)
	if err != nil {
		return err
	}
	dir := c.String("output")
	err = os.MkdirAll(filepath.Join(dir, "man1"), 0755)
	if err != nil {
		// handle error
	}
	if c.Bool("text") {
		file, err := os.Create(filepath.Join(dir, "man1", "linq-api-v3.1"))
		if err != nil {
			return err
		}
		defer file.Close()
		if _, err := file.WriteString(manpage); err != nil {
			return err
		}
	}
	if c.Bool("gzip") {
		file, err := os.Create(filepath.Join(dir, "man1", "linq-api-v3.1.gz"))
		if err != nil {
			return err
		}
		defer file.Close()
		gzWriter := gzip.NewWriter(file)
		defer gzWriter.Close()
		_, err = gzWriter.Write([]byte(manpage))
		if err != nil {
			return err
		}
	}
	fmt.Printf("Wrote manpages to %s\n", dir)
	return nil
}
