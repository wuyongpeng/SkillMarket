package model

import "time"

type MaturityLevel string

const (
	Foundational MaturityLevel = "Foundational"
	Mainstream   MaturityLevel = "Mainstream"
	Emerging     MaturityLevel = "Emerging"
	Speculative  MaturityLevel = "Speculative"
)

type Node struct {
	ID          string        `json:"id" db:"id"`
	Name        string        `json:"name" db:"name"`
	NameZH      string        `json:"name_zh" db:"name_zh"`
	Description string        `json:"description" db:"description"`
	Maturity    MaturityLevel `json:"maturity" db:"maturity"`
	IsLatest    bool          `json:"is_latest" db:"is_latest"`
	Year        int           `json:"year" db:"year"`
	Role        string        `json:"role" db:"role"`
	HandsOn     interface{}   `json:"hands_on,omitempty" db:"hands_on"`
	CreatedAt   time.Time     `json:"created_at" db:"created_at"`
	// Populated via JOIN
	Children []*Node `json:"children,omitempty" db:"-"`
}

type Lineage struct {
	ID           string `json:"id" db:"id"`
	ParentID     string `json:"parent_id" db:"parent_id"`
	ChildID      string `json:"child_id" db:"child_id"`
	RelationType string `json:"relation_type" db:"relation_type"`
}

type PathwayTree struct {
	Nodes    []*Node   `json:"nodes"`
	Lineages []*Lineage `json:"lineages"`
}
