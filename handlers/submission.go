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
		Status:      "Pending",
		Runtime:     "--",
		Detail:      "等待进入判题队列",
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
	var subs []models.Submission
	database.DB.Select("id, user_id, username, problem_id, problem_name, language, status, runtime, memory, detail, created_at").
		Order("created_at desc").Limit(50).Find(&subs)

	writeJSON(w, http.StatusOK, subs)
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
	default:
		return s
	}
}
