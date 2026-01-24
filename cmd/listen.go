package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/linq-team/linq-cli/internal/config"
	"github.com/linq-team/linq-cli/internal/apiv3"
	"github.com/spf13/cobra"
)

var listenCmd = &cobra.Command{
	Use:   "listen",
	Short: "Listen for incoming messages",
	Long: `Start a local server that receives webhook events from Linq.
Automatically registers a webhook subscription and streams events to stdout.`,
	Example: `  linq listen
  linq listen --port 4567
  linq listen --events message.received,message.delivered
  linq listen --json`,
	RunE: func(cmd *cobra.Command, args []string) error {
		port, _ := cmd.Flags().GetInt("port")
		jsonOutput, _ := cmd.Flags().GetBool("json")

		cfg, err := config.Load()
		if err != nil {
			return fmt.Errorf("not authenticated. Run 'linq login' first")
		}

		token := resolveToken(cmd, cfg)
		if token == "" {
			return fmt.Errorf("no token found. Run 'linq login' or pass --token")
		}

		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		go func() {
			<-sigCh
			fmt.Fprintln(os.Stderr, "\nShutting down...")
			cancel()
		}()

		eventCh := make(chan json.RawMessage, 100)
		srv := startWebhookServer(port, eventCh)

		fmt.Fprintf(os.Stderr, "Listening for events on :%d\n", port)
		fmt.Fprintf(os.Stderr, "Press Ctrl+C to stop\n\n")

		go func() {
			for raw := range eventCh {
				if jsonOutput {
					fmt.Println(string(raw))
				} else {
					printEvent(raw)
				}
			}
		}()

		<-ctx.Done()

		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer shutdownCancel()
		srv.Shutdown(shutdownCtx)

		return nil
	},
}

func startWebhookServer(port int, eventCh chan<- json.RawMessage) *http.Server {
	mux := http.NewServeMux()
	mux.HandleFunc("/webhook", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "failed to read body", http.StatusBadRequest)
			return
		}

		eventCh <- json.RawMessage(body)
		w.WriteHeader(http.StatusOK)
	})

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: mux,
	}

	go srv.ListenAndServe()
	return srv
}

func printEvent(raw json.RawMessage) {
	var peek struct {
		EventType string `json:"event_type"`
	}
	if err := json.Unmarshal(raw, &peek); err != nil {
		fmt.Fprintf(os.Stderr, "failed to parse event: %v\n", err)
		return
	}

	switch peek.EventType {
	case "message.received":
		var wh apiv3.MessageReceivedWebhook
		if err := json.Unmarshal(raw, &wh); err == nil {
			from := ""
			if wh.Data.From != nil {
				from = *wh.Data.From
			}
			msg := extractPayloadText(wh.Data.Message)
			fmt.Printf("[%s] << %s: %s\n", wh.CreatedAt.Format(time.RFC3339), from, msg)
		}

	case "message.sent":
		var wh apiv3.MessageSentWebhook
		if err := json.Unmarshal(raw, &wh); err == nil {
			msg := extractPayloadText(wh.Data.Message)
			fmt.Printf("[%s] >> sent: %s\n", wh.CreatedAt.Format(time.RFC3339), msg)
		}

	case "message.delivered":
		var wh apiv3.MessageDeliveredWebhook
		if err := json.Unmarshal(raw, &wh); err == nil {
			msgID := "unknown"
			if wh.Data.MessageId != nil {
				msgID = *wh.Data.MessageId
			}
			fmt.Printf("[%s] -- delivered (message: %s)\n", wh.CreatedAt.Format(time.RFC3339), msgID)
		}

	case "message.read":
		var wh apiv3.MessageReadWebhook
		if err := json.Unmarshal(raw, &wh); err == nil {
			msgID := "unknown"
			if wh.Data.MessageId != nil {
				msgID = *wh.Data.MessageId
			}
			fmt.Printf("[%s] -- read (message: %s)\n", wh.CreatedAt.Format(time.RFC3339), msgID)
		}

	case "message.failed":
		var wh apiv3.MessageFailedWebhook
		if err := json.Unmarshal(raw, &wh); err == nil {
			msgID := "unknown"
			if wh.Data.MessageId != nil {
				msgID = *wh.Data.MessageId
			}
			fmt.Printf("[%s] !! failed (message: %s, code: %d)\n", wh.CreatedAt.Format(time.RFC3339), msgID, wh.Data.Code)
		}

	default:
		fmt.Printf("[%s] %s\n", time.Now().Format(time.RFC3339), peek.EventType)
	}
}

func extractPayloadText(msg *apiv3.MessagePayload) string {
	if msg == nil || msg.Parts == nil {
		return ""
	}
	for _, part := range *msg.Parts {
		textPart, err := part.AsSchemasTextPartResponse()
		if err == nil && textPart.Value != "" {
			return textPart.Value
		}
	}
	return "(media)"
}

func init() {
	listenCmd.Flags().Int("port", 4040, "Local port to listen on")
	listenCmd.Flags().Bool("json", false, "Output events as JSON lines")
	listenCmd.Flags().StringSlice("events", nil, "Event types to subscribe to")
	rootCmd.AddCommand(listenCmd)
}
