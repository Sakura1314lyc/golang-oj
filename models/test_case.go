package models

type TestCase struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	ProblemID uint   `gorm:"index" json:"problem_id"`
	Input     string `gorm:"type:text" json:"input"`
	Output    string `gorm:"type:text" json:"output"`
	IsSample  bool   `json:"is_sample"`
}
