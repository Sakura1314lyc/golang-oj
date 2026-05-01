package models

import "time"

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
