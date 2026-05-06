package handlers

import (
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"golang-oj/database"
	"golang-oj/models"
)

type ContestHandler struct{}

func NewContestHandler() *ContestHandler {
	return &ContestHandler{}
}

func (h *ContestHandler) List(w http.ResponseWriter, r *http.Request) {
	var contests []models.Contest
	database.DB.Order("start_at desc").Find(&contests)

	type contestItem struct {
		ID         uint   `json:"id"`
		Title      string `json:"title"`
		StartAt    string `json:"start_at"`
		EndAt      string `json:"end_at"`
		Status     string `json:"status"`
		ProblemIDs []int  `json:"problem_ids"`
	}

	result := make([]contestItem, 0, len(contests))
	for _, c := range contests {
		result = append(result, contestItem{
			ID:         c.ID,
			Title:      c.Title,
			StartAt:    c.StartAt.Format(time.RFC3339),
			EndAt:      c.EndAt.Format(time.RFC3339),
			Status:     c.Status,
			ProblemIDs: c.ProblemIDList(),
		})
	}

	writeJSON(w, http.StatusOK, result)
}

func (h *ContestHandler) Detail(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/contests/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "无效的竞赛 ID")
		return
	}

	var contest models.Contest
	if database.DB.First(&contest, id).Error != nil {
		writeError(w, http.StatusNotFound, "竞赛不存在")
		return
	}

	// Load problems for this contest
	problemIDs := contest.ProblemIDList()
	var problems []models.Problem
	if len(problemIDs) > 0 {
		database.DB.Select("id, title, difficulty, tags, time_limit_ms, memory_limit").
			Where("id IN ?", problemIDs).
			Find(&problems)
	}

	type problemItem struct {
		ID          uint     `json:"id"`
		Title       string   `json:"title"`
		Difficulty  string   `json:"difficulty"`
		Tags        []string `json:"tags"`
		TimeLimitMS int      `json:"time_limit_ms"`
		MemoryLimit int      `json:"memory_limit_mb"`
	}

	items := make([]problemItem, 0, len(problems))
	for _, p := range problems {
		items = append(items, problemItem{
			ID:          p.ID,
			Title:       p.Title,
			Difficulty:  p.Difficulty,
			Tags:        p.TagList(),
			TimeLimitMS: p.TimeLimitMS,
			MemoryLimit: p.MemoryLimit,
		})
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"id":         contest.ID,
		"title":      contest.Title,
		"start_at":   contest.StartAt.Format(time.RFC3339),
		"end_at":     contest.EndAt.Format(time.RFC3339),
		"status":     contest.Status,
		"problems":   items,
		"created_at": contest.CreatedAt,
	})
}

func (h *ContestHandler) Rank(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/contests/")
	if idx := strings.Index(idStr, "/"); idx > 0 {
		idStr = idStr[:idx]
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "无效的竞赛 ID")
		return
	}

	var contest models.Contest
	if database.DB.First(&contest, id).Error != nil {
		writeError(w, http.StatusNotFound, "竞赛不存在")
		return
	}

	problemIDs := contest.ProblemIDList()
	if len(problemIDs) == 0 {
		writeJSON(w, http.StatusOK, []any{})
		return
	}

	// Get accepted submissions for the contest problems, grouped by user
	type rankEntry struct {
		Username    string `json:"username"`
		Solved      int    `json:"solved"`
		Penalty     int64  `json:"penalty"`
		Submissions int    `json:"submissions"`
	}

	var submissions []models.Submission
	database.DB.Select("user_id, username, problem_id, status, created_at").
		Where("problem_id IN ? AND created_at BETWEEN ? AND ?", problemIDs, contest.StartAt, contest.EndAt).
		Find(&submissions)

	userMap := make(map[string]*rankEntry)
	userSolved := make(map[string]map[uint]bool) // username -> problemID -> solved

	for _, s := range submissions {
		if userMap[s.Username] == nil {
			userMap[s.Username] = &rankEntry{Username: s.Username}
			userSolved[s.Username] = make(map[uint]bool)
		}
		userMap[s.Username].Submissions++
		if s.Status == models.StatusAccepted && !userSolved[s.Username][s.ProblemID] {
			userSolved[s.Username][s.ProblemID] = true
			userMap[s.Username].Solved++
			userMap[s.Username].Penalty += s.CreatedAt.Unix() - contest.StartAt.Unix()
		}
	}

	rankings := make([]*rankEntry, 0, len(userMap))
	for _, v := range userMap {
		rankings = append(rankings, v)
	}

	sort.Slice(rankings, func(i, j int) bool {
		if rankings[i].Solved != rankings[j].Solved {
			return rankings[i].Solved > rankings[j].Solved
		}
		return rankings[i].Penalty < rankings[j].Penalty
	})

	writeJSON(w, http.StatusOK, rankings)
}
