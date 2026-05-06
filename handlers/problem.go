package handlers

import (
	"encoding/json"
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
	page, pageSize := parsePagination(r)
	search := strings.TrimSpace(r.URL.Query().Get("q"))
	difficulty := strings.TrimSpace(r.URL.Query().Get("difficulty"))
	tag := strings.TrimSpace(r.URL.Query().Get("tag"))

	query := database.DB.Model(&models.Problem{})
	selectFields := "id, title, tags, difficulty, time_limit_ms, memory_limit"

	if search != "" {
		like := "%" + search + "%"
		query = query.Where("title LIKE ? OR description LIKE ?", like, like)
	}
	if difficulty != "" {
		query = query.Where("difficulty = ?", difficulty)
	}
	if tag != "" {
		query = query.Where("tags LIKE ?", "%"+tag+"%")
	}

	var total int64
	query.Select(selectFields).Count(&total)

	var problems []models.Problem
	query.Select(selectFields).
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Order("id asc").
		Find(&problems)

	type problemItem struct {
		ID          uint     `json:"id"`
		Title       string   `json:"title"`
		Tags        []string `json:"tags"`
		Difficulty  string   `json:"difficulty"`
		TimeLimitMS int      `json:"time_limit_ms"`
		MemoryLimit int      `json:"memory_limit_mb"`
	}

	result := make([]problemItem, 0, len(problems))
	for _, p := range problems {
		result = append(result, problemItem{
			ID:          p.ID,
			Title:       p.Title,
			Tags:        p.TagList(),
			Difficulty:  p.Difficulty,
			TimeLimitMS: p.TimeLimitMS,
			MemoryLimit: p.MemoryLimit,
		})
	}

	writePaginated(w, result, page, pageSize, total)
}

func (h *ProblemHandler) Detail(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/problems/")
	if idx := strings.Index(idStr, "/"); idx > 0 {
		idStr = idStr[:idx]
	}

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

	writeJSON(w, http.StatusOK, map[string]any{
		"id":              problem.ID,
		"title":           problem.Title,
		"description":     problem.Description,
		"input_desc":      problem.InputDesc,
		"output_desc":     problem.OutputDesc,
		"tags":            problem.TagList(),
		"difficulty":      problem.Difficulty,
		"source":          problem.Source,
		"time_limit_ms":   problem.TimeLimitMS,
		"memory_limit_mb": problem.MemoryLimit,
		"samples":         samples,
	})
}

// Admin: create problem
func (h *ProblemHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		InputDesc   string `json:"input_desc"`
		OutputDesc  string `json:"output_desc"`
		Tags        string `json:"tags"`
		Difficulty  string `json:"difficulty"`
		Source      string `json:"source"`
		Solution    string `json:"solution"`
		TimeLimitMS int    `json:"time_limit_ms"`
		MemoryLimit int    `json:"memory_limit_mb"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "无效的请求格式")
		return
	}
	if req.Title == "" {
		writeError(w, http.StatusBadRequest, "题目名称不能为空")
		return
	}
	problem := models.Problem{
		Title:       req.Title,
		Description: req.Description,
		InputDesc:   req.InputDesc,
		OutputDesc:  req.OutputDesc,
		Tags:        req.Tags,
		Difficulty:  req.Difficulty,
		Source:      req.Source,
		Solution:    req.Solution,
		TimeLimitMS: req.TimeLimitMS,
		MemoryLimit: req.MemoryLimit,
	}
	if problem.TimeLimitMS <= 0 {
		problem.TimeLimitMS = 1000
	}
	if problem.MemoryLimit <= 0 {
		problem.MemoryLimit = 128
	}
	if problem.Difficulty == "" {
		problem.Difficulty = "Easy"
	}
	database.DB.Create(&problem)
	writeJSON(w, http.StatusCreated, problem)
}

// Admin: update problem
func (h *ProblemHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/admin/problems/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "无效的题目 ID")
		return
	}

	var problem models.Problem
	if database.DB.First(&problem, id).Error != nil {
		writeError(w, http.StatusNotFound, "题目不存在")
		return
	}

	var req map[string]any
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "无效的请求格式")
		return
	}

	allowed := map[string]bool{
		"title": true, "description": true, "input_desc": true, "output_desc": true,
		"tags": true, "difficulty": true, "source": true, "solution": true,
		"time_limit_ms": true, "memory_limit_mb": true,
	}
	updates := map[string]any{}
	for k, v := range req {
		if allowed[k] {
			updates[k] = v
		}
	}

	if len(updates) > 0 {
		database.DB.Model(&problem).Updates(updates)
	}
	database.DB.First(&problem, id)
	writeJSON(w, http.StatusOK, problem)
}

// Admin: delete problem
func (h *ProblemHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/admin/problems/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "无效的题目 ID")
		return
	}

	result := database.DB.Delete(&models.Problem{}, id)
	if result.RowsAffected == 0 {
		writeError(w, http.StatusNotFound, "题目不存在")
		return
	}
	database.DB.Where("problem_id = ?", id).Delete(&models.TestCase{})
	writeMsg(w, http.StatusOK, "题目已删除")
}
