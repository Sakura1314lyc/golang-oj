package models

import "time"

type Submission struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"index" json:"user_id"`
	Username    string    `gorm:"size:64" json:"username"`
	ProblemID   uint      `gorm:"index" json:"problem_id"`
	ProblemName string    `gorm:"size:256" json:"problem_name"`
	Language    string    `gorm:"size:32" json:"language"`
	Code        string    `gorm:"type:mediumtext" json:"code,omitempty"`
	Status      string    `gorm:"size:32;default:Pending" json:"status"`
	Runtime     string    `gorm:"size:32;default:'--'" json:"runtime"`
	Memory      string    `gorm:"size:32;default:'--'" json:"memory"`
	Detail      string    `gorm:"type:text" json:"detail"`
	CreatedAt   time.Time `json:"created_at"`
}
