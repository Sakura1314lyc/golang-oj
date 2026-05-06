package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"golang-oj/database"
	"golang-oj/judge"
	"golang-oj/middleware"
	"golang-oj/models"
)

type SubmissionHandler struct {
	judgeService *judge.Service
}

func NewSubmissionHandler(judgeService *judge.Service) *SubmissionHandler {
	return &SubmissionHandler{judgeService: judgeService}
}

type submitReq struct {
	ProblemID uint   `json:"problem_id"`
	Language  string `json:"language"`
	Code      string `json:"code"`
}

func (h *SubmissionHandler) Submit(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(uint)
	username, _ := r.Context().Value(middleware.UsernameKey).(string)

	var req submitReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "无效的请求格式")
		return
	}
	if req.ProblemID == 0 || strings.TrimSpace(req.Code) == "" {
		writeError(w, http.StatusBadRequest, "题目 ID 和代码不能为空")
		return
	}

	var problem models.Problem
	if database.DB.First(&problem, req.ProblemID).Error != nil {
		writeError(w, http.StatusNotFound, "题目不存在")
		return
	}

	lang := normalizeLang(req.Language)
	var testCases []models.TestCase
	database.DB.Where("problem_id = ?", req.ProblemID).Find(&testCases)

	sub := models.Submission{
		UserID:      userID,
		Username:    username,
		ProblemID:   problem.ID,
		ProblemName: problem.Title,
		Language:    lang,
		Code:        req.Code,
		Status:      models.StatusPending,
		Runtime:     "--",
		Detail:      "等待进入判题队列",
		Score:       0,
		CreatedAt:   time.Now(),
	}

	database.DB.Create(&sub)

	database.DB.Model(&models.User{}).Where("id = ?", userID).
		UpdateColumn("submit_count", database.DB.Raw("submit_count + 1"))

	go h.judgeService.Judge(&sub, &problem, testCases)

	writeJSON(w, http.StatusOK, map[string]any{
		"id":     sub.ID,
		"status": sub.Status,
		"detail": sub.Detail,
	})
}

func (h *SubmissionHandler) Status(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/status/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "无效的提交 ID")
		return
	}

	var sub models.Submission
	if database.DB.First(&sub, id).Error != nil {
		writeError(w, http.StatusNotFound, "提交记录不存在")
		return
	}

	sub.Code = ""
	writeJSON(w, http.StatusOK, &sub)
}

func (h *SubmissionHandler) List(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePagination(r)

	query := database.DB.Model(&models.Submission{})
	selectFields := "id, user_id, username, problem_id, problem_name, language, status, runtime, memory, score, created_at"

	// Filter by problem
	if pid := r.URL.Query().Get("problem_id"); pid != "" {
		query = query.Where("problem_id = ?", pid)
	}
	// Filter by user
	if uid := r.URL.Query().Get("user_id"); uid != "" {
		query = query.Where("user_id = ?", uid)
	}
	// Filter by status
	if status := r.URL.Query().Get("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Select(selectFields).Count(&total)

	var subs []models.Submission
	query.Select(selectFields).
		Order("created_at desc").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&subs)

	writePaginated(w, subs, page, pageSize, total)
}

func (h *SubmissionHandler) UserSubmissions(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(uint)
	page, pageSize := parsePagination(r)

	var total int64
	database.DB.Model(&models.Submission{}).Where("user_id = ?", userID).Count(&total)

	var subs []models.Submission
	database.DB.Select("id, user_id, username, problem_id, problem_name, language, status, runtime, memory, score, created_at").
		Where("user_id = ?", userID).
		Order("created_at desc").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&subs)

	for i := range subs {
		subs[i].Code = ""
	}

	writePaginated(w, subs, page, pageSize, total)
}

func normalizeLang(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	switch s {
	case "c++", "cpp", "cxx":
		return "cpp"
	case "golang", "go":
		return "go"
	case "python", "py", "python3":
		return "python"
	case "java":
		return "java"
	case "javascript", "js", "node":
		return "javascript"
	default:
		return s
	}
}
