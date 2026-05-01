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
	var users []models.User
	database.DB.Select("id, username, rating, solved_count, submit_count, accepted_count").
		Order("rating desc").Limit(50).Find(&users)

	type item struct {
		Rank        int    `json:"rank"`
		Username    string `json:"username"`
		Score       int    `json:"score"`
		SolvedCount int    `json:"solved_count"`
	}

	result := make([]item, 0, len(users))
	for i, u := range users {
		result = append(result, item{
			Rank:        i + 1,
			Username:    u.Username,
			Score:       u.Rating,
			SolvedCount: u.SolvedCount,
		})
	}

	writeJSON(w, http.StatusOK, result)
}
