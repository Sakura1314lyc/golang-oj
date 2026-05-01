package handlers

import (
	"net/http"
	"strconv"
	"strings"

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
		var pids []int
		if c.ProblemIDs != "" {
			parts := strings.Split(c.ProblemIDs, ",")
			for _, p := range parts {
				if id, err := strconv.Atoi(strings.TrimSpace(p)); err == nil {
					pids = append(pids, id)
				}
			}
		}
		result = append(result, contestItem{
			ID:         c.ID,
			Title:      c.Title,
			StartAt:    c.StartAt.Format("2006-01-02T15:04:05Z07:00"),
			EndAt:      c.EndAt.Format("2006-01-02T15:04:05Z07:00"),
			Status:     c.Status,
			ProblemIDs: pids,
		})
	}

	writeJSON(w, http.StatusOK, result)
}
