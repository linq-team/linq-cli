package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

const (
	configDir  = ".linq"
	configFile = "config.json"

	LinqApiBaseUrl = "https://api.linqapp.com/api/partner"
)

type Config struct {
	Token       string `json:"token,omitempty"`
	DefaultFrom string `json:"default_from,omitempty"`
}

func (c *Config) BaseURL() string {
	return LinqApiBaseUrl
}

func configPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("cannot determine home directory: %w", err)
	}
	return filepath.Join(home, configDir, configFile), nil
}

func Load() (*Config, error) {
	path, err := configPath()
	if err != nil {
		return nil, err
	}

	// Also check LINQ_TOKEN env var
	cfg := &Config{}

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			// No config file, check env
			if token := os.Getenv("LINQ_TOKEN"); token != "" {
				cfg.Token = token
				return cfg, nil
			}
			return nil, fmt.Errorf("no config found at %s", path)
		}
		return nil, fmt.Errorf("failed to read config: %w", err)
	}

	if err := json.Unmarshal(data, cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	// Env var overrides file
	if token := os.Getenv("LINQ_TOKEN"); token != "" {
		cfg.Token = token
	}

	return cfg, nil
}

func Save(cfg *Config) error {
	path, err := configPath()
	if err != nil {
		return err
	}

	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	if err := os.WriteFile(path, data, 0600); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	return nil
}
