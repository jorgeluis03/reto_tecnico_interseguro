package clients

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type matricesPayload struct {
	Q [][]float64 `json:"Q"`
	R [][]float64 `json:"R"`
}

var httpClient = &http.Client{Timeout: 10 * time.Second}

func FetchStatistics(Q, R [][]float64) (map[string]interface{}, error) {
	nodeURL := os.Getenv("NODE_API_URL")
	if nodeURL == "" {
		nodeURL = "http://localhost:3000"
	}

	payload := matricesPayload{Q: Q, R: R}
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal payload: %w", err)
	}

	resp, err := httpClient.Post(nodeURL+"/statistics", "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to reach Node.js API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		raw, readErr := io.ReadAll(resp.Body)
		if readErr != nil {
			return nil, fmt.Errorf("Node.js API returned status %d (body unreadable: %w)", resp.StatusCode, readErr)
		}
		return nil, fmt.Errorf("Node.js API returned status %d: %s", resp.StatusCode, string(raw))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode Node.js API response: %w", err)
	}

	return result, nil
}
