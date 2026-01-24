package cmd

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/linq-team/linq-cli/internal/config"
	"github.com/spf13/cobra"
)

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Authenticate with Linq",
	Long:  `Store your API token for subsequent commands. Token is saved to ~/.linq/config.json.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		token, _ := cmd.Flags().GetString("token")

		if token == "" {
			fmt.Print("Enter your Linq API token: ")
			reader := bufio.NewReader(os.Stdin)
			input, err := reader.ReadString('\n')
			if err != nil {
				return fmt.Errorf("failed to read token: %w", err)
			}
			token = strings.TrimSpace(input)
		}

		if token == "" {
			return fmt.Errorf("token cannot be empty")
		}

		cfg, err := config.Load()
		if err != nil {
			cfg = &config.Config{}
		}

		cfg.Token = token

		if err := config.Save(cfg); err != nil {
			return fmt.Errorf("failed to save config: %w", err)
		}

		fmt.Println("Authenticated successfully. Token saved to ~/.linq/config.json")
		return nil
	},
}

func init() {
	loginCmd.Flags().String("token", "", "API token to store")
	rootCmd.AddCommand(loginCmd)
}
