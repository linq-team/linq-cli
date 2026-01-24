package cmd

import (
	"context"
	"fmt"
	"net/http"

	"github.com/linq-team/linq-cli/internal/apiv3"
	"github.com/linq-team/linq-cli/internal/config"
	"github.com/spf13/cobra"
)

var numbersCmd = &cobra.Command{
	Use:   "numbers",
	Short: "Manage phone numbers",
	Long:  `List and manage your Linq phone numbers.`,
}

var numbersListCmd = &cobra.Command{
	Use:   "list",
	Short: "List your available phone numbers",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := config.Load()
		if err != nil {
			return fmt.Errorf("not authenticated. Run 'linq login' first")
		}

		token := resolveToken(cmd, cfg)
		if token == "" {
			return fmt.Errorf("no token found. Run 'linq login' or pass --token")
		}

		client, err := apiv3.NewClientWithResponses(cfg.BaseURL(), apiv3.WithRequestEditorFn(func(ctx context.Context, req *http.Request) error {
			req.Header.Set("Authorization", "Bearer "+token)
			return nil
		}))
		if err != nil {
			return fmt.Errorf("failed to create client: %w", err)
		}

		resp, err := client.ListPhoneNumbersWithResponse(context.Background())
		if err != nil {
			return fmt.Errorf("failed to list numbers: %w", err)
		}

		if resp.JSON200 == nil {
			return fmt.Errorf("failed to list numbers: %s", resp.Status())
		}

		numbers := resp.JSON200.PhoneNumbers
		if len(numbers) == 0 {
			fmt.Println("No phone numbers available. Contact Linq to provision numbers for your account.")
			return nil
		}

		fmt.Printf("%-18s %-10s %-5s\n", "NUMBER", "TYPE", "SMS")
		fmt.Printf("%-18s %-10s %-5s\n", "------", "----", "---")
		for _, n := range numbers {
			sms := "no"
			if n.Capabilities.Sms {
				sms = "yes"
			}
			fmt.Printf("%-18s %-10s %-5s\n", n.PhoneNumber, string(n.Type), sms)
		}

		return nil
	},
}

func init() {
	numbersCmd.AddCommand(numbersListCmd)
	rootCmd.AddCommand(numbersCmd)
}
