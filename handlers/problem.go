package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"golang-oj/database"
	"golang-oj/models"
)

type ProblemHandler struct{}

func NewProblemHandler() *ProblemHandler {
	return &ProblemHandler{}
}

func (h *ProblemHandler) List(w http.ResponseWriter, r *http.Request) {
	var problems []models.Problem
	database.DB.Select("id, title, tags, difficulty, time_limit_ms, memory_limit").Find(&problems)

	type problemItem struct {
		ID          uint     `json:"id"`
		Title       string   `json:"title"`
		Description string   `json:"description"`
		Tags        []string `json:"tags"`
		Difficulty  string   `json:"difficulty"`
		TimeLimitMS int      `json:"time_limit_ms"`
		MemoryLimit int      `json:"memory_limit_mb"`
	}

	result := make([]problemItem, 0, len(problems))
	for _, p := range problems {
		tags := strings.Split(p.Tags, ",")
		// clean empty strings
		var cleanTags []string
		for _, t := range tags {
			if t != "" {
				cleanTags = append(cleanTags, t)
			}
		}

		result = append(result, problemItem{
			ID:          p.ID,
			Title:       p.Title,
			Description: p.Description,
			Tags:        cleanTags,
			Difficulty:  p.Difficulty,
			TimeLimitMS: p.TimeLimitMS,
			MemoryLimit: p.MemoryLimit,
		})
	}

	writeJSON(w, http.StatusOK, result)
}

func (h *ProblemHandler) Detail(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/problems/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "无效的题目 ID")
		return
	}

	var problem models.Problem
	if database.DB.Preload("TestCases", "is_sample = ?", true).First(&problem, id).Error != nil {
		writeError(w, http.StatusNotFound, "题目不存在")
		return
	}

	type sampleItem struct {
		Input  string `json:"input"`
		Output string `json:"output"`
	}
	samples := make([]sampleItem, 0)
	for _, tc := range problem.TestCases {
		samples = append(samples, sampleItem{Input: tc.Input, Output: tc.Output})
	}

	tags := strings.Split(problem.Tags, ",")
	var cleanTags []string
	for _, t := range tags {
		if t != "" {
			cleanTags = append(cleanTags, t)
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"id":              problem.ID,
		"title":           problem.Title,
		"description":     problem.Description,
		"input_desc":      problem.InputDesc,
		"output_desc":     problem.OutputDesc,
		"tags":            cleanTags,
		"difficulty":      problem.Difficulty,
		"time_limit_ms":   problem.TimeLimitMS,
		"memory_limit_mb": problem.MemoryLimit,
		"samples":         samples,
	})
}
