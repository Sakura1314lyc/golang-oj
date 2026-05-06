package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sort"
	"strings"
	"time"

	"golang-oj/config"
	"golang-oj/database"
	"golang-oj/models"
)

type cfProblem struct {
	ContestID int      `json:"contestId"`
	Index     string   `json:"index"`
	Name      string   `json:"name"`
	Rating    int      `json:"rating"`
	Tags      []string `json:"tags"`
}

type cfResponse struct {
	Status string `json:"status"`
	Result struct {
		Problems []cfProblem `json:"problems"`
	} `json:"result"`
}

func cfRatingToDifficulty(rating int) string {
	switch {
	case rating <= 1200:
		return "Easy"
	case rating <= 1600:
		return "Medium"
	default:
		return "Hard"
	}
}

func main() {
	cfg := config.Load()
	database.Init(cfg)
	database.Migrate()

	var maxID uint
	database.DB.Raw("SELECT COALESCE(MAX(id), 1000) FROM problems").Scan(&maxID)
	nextID := maxID + 1
	fmt.Printf("Next available problem ID: %d\n", nextID)

	fmt.Println("\n=== Loading Codeforces problems from local file ===")

	data, err := os.ReadFile("tools/fetch_problems/cf_problems.json")
	if err != nil {
		log.Fatalf("Failed to read cf_problems.json: %v", err)
	}
	var cfResp cfResponse
	if err := json.Unmarshal(data, &cfResp); err != nil {
		log.Fatalf("CF API parse error: %v", err)
	}
	if cfResp.Status != "OK" {
		log.Fatalf("CF API status not OK: %s", cfResp.Status)
	}

	fmt.Printf("Loaded %d problems from cf_problems.json\n", len(cfResp.Result.Problems))

	// Deduplicate by (contestId, index)
	seen := make(map[string]bool)
	var pool []cfProblem
	for _, p := range cfResp.Result.Problems {
		key := fmt.Sprintf("%d|%s", p.ContestID, p.Index)
		if !seen[key] {
			seen[key] = true
			pool = append(pool, p)
		}
	}

	// Filter by rating 800-2000
	var filtered []cfProblem
	for _, p := range pool {
		if p.Rating >= 800 && p.Rating <= 2000 {
			filtered = append(filtered, p)
		}
	}

	// Sort: rating ASC, then contestId ASC
	sort.Slice(filtered, func(i, j int) bool {
		if filtered[i].Rating != filtered[j].Rating {
			return filtered[i].Rating < filtered[j].Rating
		}
		return filtered[i].ContestID < filtered[j].ContestID
	})

	// Limit to 120 problems
	const maxCount = 120
	if len(filtered) > maxCount {
		filtered = filtered[:maxCount]
	}

	fmt.Printf("Importing %d problems (rating 800-2000)\n", len(filtered))

	// Dedup by source
	existing := make(map[string]bool)
	var existingProblems []models.Problem
	database.DB.Where("source LIKE 'Codeforces%'").Find(&existingProblems)
	for _, p := range existingProblems {
		existing[p.Source] = true
	}

	var count int
	for i, p := range filtered {
		sourceKey := fmt.Sprintf("Codeforces %d%s", p.ContestID, p.Index)
		if existing[sourceKey] {
			continue
		}

		id := nextID + uint(count)
		url := fmt.Sprintf("https://codeforces.com/problemset/problem/%d/%s", p.ContestID, p.Index)

		title := fmt.Sprintf("%s. %s", p.Index, p.Name)
		desc := fmt.Sprintf(
			"从 Codeforces 导入的题目（Contest #%d, Problem %s）。\n\n"+
				"**题目：** [%s](%s)\n\n"+
				"本题原始描述请参见 Codeforces 页面。\n\n"+
				"**原题连接：** %s",
			p.ContestID, p.Index, p.Name, url, url,
		)

		problem := models.Problem{
			ID:          id,
			Title:       title,
			Description: desc,
			InputDesc:   fmt.Sprintf("参见原题（%s）", url),
			OutputDesc:  "参见原题（同上）",
			Tags:        strings.Join(p.Tags, ","),
			Difficulty:  cfRatingToDifficulty(p.Rating),
			Source:      sourceKey,
			TimeLimitMS: 1000,
			MemoryLimit: 256,
		}

		if err := database.DB.Create(&problem).Error; err != nil {
			log.Printf("Failed to create problem #%d: %v", id, err)
			continue
		}

		fmt.Printf("[%3d/%d] #%4d | %-30s | rating=%3d | %s\n",
			i+1, len(filtered), id, truncate(title, 28),
			p.Rating, cfRatingToDifficulty(p.Rating))

		count++
		time.Sleep(200 * time.Millisecond)
	}

	fmt.Printf("\n=== Complete: created %d new problems ===\n", count)
	os.Exit(0)
}

func truncate(s string, n int) string {
	runes := []rune(s)
	if len(runes) <= n {
		return s
	}
	return string(runes[:n-1]) + "…"
}

func init() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
}
