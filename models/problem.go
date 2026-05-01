package models

import "time"

type Problem struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"size:256" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	InputDesc   string    `gorm:"type:text" json:"input_desc"`
	OutputDesc  string    `gorm:"type:text" json:"output_desc"`
	Tags        string    `gorm:"size:512" json:"tags"`
	Difficulty  string    `gorm:"size:32" json:"difficulty"`
	TimeLimitMS int       `gorm:"default:1000" json:"time_limit_ms"`
	MemoryLimit int       `gorm:"default:128" json:"memory_limit_mb"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	TestCases   []TestCase `gorm:"foreignKey:ProblemID" json:"samples,omitempty"`
}

func (p *Problem) TagList() []string {
	if p.Tags == "" {
		return nil
	}
	// Simple comma split
	var tags []string
	start := 0
	for i := 0; i <= len(p.Tags); i++ {
		if i == len(p.Tags) || p.Tags[i] == ',' {
			if tag := p.Tags[start:i]; tag != "" {
				tags = append(tags, tag)
			}
			start = i + 1
		}
	}
	return tags
}
