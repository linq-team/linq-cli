package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "linq",
	Short: "Linq CLI - messaging from your terminal",
	Long:  `The Linq CLI lets you send and receive messages using Linq's infrastructure, directly from your terminal.`,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().String("token", "", "API token (or set LINQ_TOKEN env var)")
}
