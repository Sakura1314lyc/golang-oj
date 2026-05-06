package handlers

import (
	"net/http"

	"golang-oj/database"
	"golang-oj/models"
)

type LeaderboardHandler struct{}

func NewLeaderboardHandler() *LeaderboardHandler {
	return &LeaderboardHandler{}
}

func (h *LeaderboardHandler) List(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePagination(r)
	sortBy := r.URL.Query().Get("sort")

	order := "rating desc"
	switch sortBy {
	case "solved":
		order = "solved_count desc"
	case "accepted":
		order = "accepted_count desc"
	case "rating":
		order = "rating desc"
	}

	var total int64
	database.DB.Model(&models.User{}).Count(&total)

	var users []models.User
	database.DB.Select("id, username, email, avatar, rating, solved_count, submit_count, accepted_count").
		Order(order).
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&users)

	type item struct {
		Rank          int    `json:"rank"`
		Username      string `json:"username"`
		Avatar        string `json:"avatar,omitempty"`
		Score         int    `json:"score"`
		SolvedCount   int    `json:"solved_count"`
		SubmitCount   int    `json:"submit_count"`
		AcceptedCount int    `json:"accepted_count"`
	}

	result := make([]item, 0, len(users))
	for i, u := range users {
		result = append(result, item{
			Rank:          (page-1)*pageSize + i + 1,
			Username:      u.Username,
			Avatar:        u.Avatar,
			Score:         u.Rating,
			SolvedCount:   u.SolvedCount,
			SubmitCount:   u.SubmitCount,
			AcceptedCount: u.AcceptedCount,
		})
	}

	writePaginated(w, result, page, pageSize, total)
}
