package cmd

import (
	"context"
	"fmt"
	"net/http"

	"github.com/linq-team/linq-cli/internal/apiv3"
	"github.com/linq-team/linq-cli/internal/config"
	"github.com/spf13/cobra"
)

var sendCmd = &cobra.Command{
	Use:   "send",
	Short: "Send a message",
	Long:  `Send a text message to a phone number via Linq.`,
	Example: `  linq send --to +19876543210 --message "Hello from Linq"
  linq send --to +19876543210 --from +12025551234 --message "Hello"
  linq send --to +19876543210 --message "Party time" --effect confetti`,
	RunE: func(cmd *cobra.Command, args []string) error {
		to, _ := cmd.Flags().GetString("to")
		from, _ := cmd.Flags().GetString("from")
		message, _ := cmd.Flags().GetString("message")
		effect, _ := cmd.Flags().GetString("effect")

		if to == "" {
			return fmt.Errorf("--to flag is required (E.164 format, e.g. +12025551234)")
		}
		if message == "" {
			return fmt.Errorf("--message flag is required")
		}

		cfg, err := config.Load()
		if err != nil {
			return fmt.Errorf("not authenticated. Run 'linq login' first")
		}

		token := resolveToken(cmd, cfg)
		if token == "" {
			return fmt.Errorf("no token found. Run 'linq login' or pass --token")
		}

		if from == "" {
			from = cfg.DefaultFrom
		}
		if from == "" {
			return fmt.Errorf("--from flag required (or set default with 'linq config set default_from +1234567890')")
		}

		client, err := apiv3.NewClientWithResponses(cfg.BaseURL(), apiv3.WithRequestEditorFn(func(ctx context.Context, req *http.Request) error {
			req.Header.Set("Authorization", "Bearer "+token)
			return nil
		}))
		if err != nil {
			return fmt.Errorf("failed to create client: %w", err)
		}

		var textPart apiv3.MessagePart
		if err := textPart.FromTextPart(apiv3.TextPart{Value: message}); err != nil {
			return fmt.Errorf("failed to create message part: %w", err)
		}

		body := apiv3.CreateChatJSONRequestBody{
			From: from,
			To:   []string{to},
			Message: apiv3.MessageContent{
				Parts: []apiv3.MessagePart{textPart},
			},
		}

		if effect != "" {
			effectType := apiv3.MessageEffectTypeScreen
			body.Message.Effect = &apiv3.MessageEffect{
				Type: &effectType,
				Name: &effect,
			}
		}

		resp, err := client.CreateChatWithResponse(context.Background(), body)
		if err != nil {
			return fmt.Errorf("send failed: %w", err)
		}

		if resp.JSON201 == nil {
			return fmt.Errorf("send failed: %s", resp.Status())
		}

		result := resp.JSON201
		fmt.Printf("Message sent to %s (chat: %s, message: %s)\n", to, result.Chat.Id, result.Chat.Message.Id)
		return nil
	},
}

func resolveToken(cmd *cobra.Command, cfg *config.Config) string {
	if t, _ := cmd.Flags().GetString("token"); t != "" {
		return t
	}
	if t := cfg.Token; t != "" {
		return t
	}
	return ""
}

func init() {
	sendCmd.Flags().String("to", "", "Recipient phone number (E.164 format)")
	sendCmd.Flags().String("from", "", "Sender phone number (E.164 format)")
	sendCmd.Flags().StringP("message", "m", "", "Message text to send")
	sendCmd.Flags().String("effect", "", "iMessage effect (confetti, fireworks, lasers, etc.)")
	rootCmd.AddCommand(sendCmd)
}
