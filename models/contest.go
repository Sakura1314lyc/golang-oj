package models

import (
	"strconv"
	"strings"
	"time"
)

type Contest struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Title      string    `gorm:"size:256" json:"title"`
	StartAt    time.Time `json:"start_at"`
	EndAt      time.Time `json:"end_at"`
	Status     string    `gorm:"size:32" json:"status"`
	ProblemIDs string    `gorm:"size:512" json:"problem_ids"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (c *Contest) ProblemIDList() []int {
	if c.ProblemIDs == "" {
		return nil
	}
	parts := strings.Split(c.ProblemIDs, ",")
	ids := make([]int, 0, len(parts))
	for _, p := range parts {
		if id, err := strconv.Atoi(strings.TrimSpace(p)); err == nil {
			ids = append(ids, id)
		}
	}
	return ids
}
