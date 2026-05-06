package models

import "time"

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

type User struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Username      string    `gorm:"uniqueIndex;size:64" json:"username"`
	Password      string    `gorm:"size:256" json:"-"`
	Email         string    `gorm:"size:128" json:"email,omitempty"`
	Avatar        string    `gorm:"size:512" json:"avatar,omitempty"`
	Bio           string    `gorm:"size:256" json:"bio,omitempty"`
	Role          Role      `gorm:"size:16;default:user" json:"role"`
	Rating        int       `gorm:"default:1200" json:"rating"`
	SolvedCount   int       `gorm:"default:0" json:"solved_count"`
	SubmitCount   int       `gorm:"default:0" json:"submit_count"`
	AcceptedCount int       `gorm:"default:0" json:"accepted_count"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
