package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"golang-oj/database"
	"golang-oj/judge"
	"golang-oj/models"
)

type AdminHandler struct {
	judgeService *judge.Service
}

func NewAdminHandler(judgeService *judge.Service) *AdminHandler {
	return &AdminHandler{judgeService: judgeService}
}

// ProblemStats returns statistics for a specific problem or all problems
func (h *AdminHandler) ProblemStats(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/admin/stats/problems/")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		// Aggregate stats for all problems
		type problemStat struct {
			ProblemID      uint   `json:"problem_id"`
			ProblemTitle   string `json:"problem_title"`
			TotalSubs      int64  `json:"total_submissions"`
			AcceptedSubs   int64  `json:"accepted_submissions"`
			AcceptRate     string `json:"accept_rate"`
		}
		var stats []problemStat
		rows, err := database.DB.Table("submissions").
			Select("problem_id, problem_name as problem_title, COUNT(*) as total_subs, SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) as accepted_subs").
			Group("problem_id, problem_name").
			Order("problem_id asc").
			Rows()
		if err != nil {
			writeError(w, http.StatusInternalServerError, "获取统计数据失败")
			return
		}
		defer rows.Close()
		for rows.Next() {
			var s problemStat
			rows.Scan(&s.ProblemID, &s.ProblemTitle, &s.TotalSubs, &s.AcceptedSubs)
			if s.TotalSubs > 0 {
				rate := float64(s.AcceptedSubs) / float64(s.TotalSubs) * 100
				s.AcceptRate = strconv.FormatFloat(rate, 'f', 1, 64) + "%"
			} else {
				s.AcceptRate = "0.0%"
			}
			stats = append(stats, s)
		}
		if stats == nil {
			stats = []problemStat{}
		}
		writeJSON(w, http.StatusOK, stats)
		return
	}

	// Stats for a specific problem
	var total int64
	var accepted int64
	database.DB.Model(&models.Submission{}).Where("problem_id = ?", id).Count(&total)
	database.DB.Model(&models.Submission{}).Where("problem_id = ? AND status = ?", id, models.StatusAccepted).Count(&accepted)

	var problem models.Problem
	database.DB.Select("id, title").First(&problem, id)

	rate := "0.0%"
	if total > 0 {
		rate = strconv.FormatFloat(float64(accepted)/float64(total)*100, 'f', 1, 64) + "%"
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"problem_id":           id,
		"problem_title":        problem.Title,
		"total_submissions":    total,
		"accepted_submissions": accepted,
		"accept_rate":          rate,
	})
}

// Rejudge resets a submission to Pending and re-runs judgment
func (h *AdminHandler) Rejudge(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/admin/rejudge/")
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

	var problem models.Problem
	if database.DB.First(&problem, sub.ProblemID).Error != nil {
		writeError(w, http.StatusNotFound, "题目不存在")
		return
	}

	var testCases []models.TestCase
	database.DB.Where("problem_id = ?", sub.ProblemID).Find(&testCases)

	sub.Status = models.StatusPending
	sub.Detail = "等待重新判题"
	sub.Runtime = "--"
	sub.Memory = "--"
	database.DB.Save(&sub)

	go h.judgeService.Judge(&sub, &problem, testCases)

	writeJSON(w, http.StatusOK, map[string]any{
		"id":     sub.ID,
		"status": "Rejudge queued",
	})
}

// ==================== Announcements ====================

func (h *AdminHandler) ListAnnouncements(w http.ResponseWriter, r *http.Request) {
	var announcements []models.Announcement
	database.DB.Where("active = ?", true).Order("priority desc, created_at desc").Find(&announcements)
	if announcements == nil {
		announcements = []models.Announcement{}
	}
	writeJSON(w, http.StatusOK, announcements)
}

func (h *AdminHandler) CreateAnnouncement(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title    string `json:"title"`
		Content  string `json:"content"`
		Priority int    `json:"priority"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "无效的请求格式")
		return
	}
	if req.Title == "" {
		writeError(w, http.StatusBadRequest, "标题不能为空")
		return
	}
	ann := models.Announcement{
		Title:    req.Title,
		Content:  req.Content,
		Priority: req.Priority,
		Active:   true,
	}
	database.DB.Create(&ann)
	writeJSON(w, http.StatusCreated, ann)
}

func (h *AdminHandler) DeleteAnnouncement(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/admin/announcements/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "无效的公告 ID")
		return
	}
	result := database.DB.Delete(&models.Announcement{}, id)
	if result.RowsAffected == 0 {
		writeError(w, http.StatusNotFound, "公告不存在")
		return
	}
	writeMsg(w, http.StatusOK, "公告已删除")
}

// ==================== Public announcements ====================

func ListActiveAnnouncements(w http.ResponseWriter, r *http.Request) {
	var announcements []models.Announcement
	database.DB.Where("active = ?", true).Order("priority desc, created_at desc").Limit(5).Find(&announcements)
	if announcements == nil {
		announcements = []models.Announcement{}
	}
	writeJSON(w, http.StatusOK, announcements)
}
