package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/soar-ai/backend/internal/model"
)

type NodeRepo struct {
	db *pgxpool.Pool
}

func NewNodeRepo(db *pgxpool.Pool) *NodeRepo {
	return &NodeRepo{db: db}
}

func (r *NodeRepo) GetPathway(ctx context.Context, role string) (*model.PathwayTree, error) {
	// Fetch nodes
	query := `SELECT id, name, name_zh, description, maturity, is_latest, year, role, created_at
	          FROM nodes`
	args := []interface{}{}
	if role != "" && role != "all" {
		query += ` WHERE role = $1 OR role = 'all'`
		args = append(args, role)
	}
	query += ` ORDER BY year ASC`

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nodes []*model.Node
	for rows.Next() {
		n := &model.Node{}
		if err := rows.Scan(&n.ID, &n.Name, &n.NameZH, &n.Description,
			&n.Maturity, &n.IsLatest, &n.Year, &n.Role, &n.CreatedAt); err != nil {
			return nil, err
		}
		nodes = append(nodes, n)
	}

	// Fetch lineages
	lineageRows, err := r.db.Query(ctx, `SELECT id, parent_id, child_id, relation_type FROM lineages`)
	if err != nil {
		return nil, err
	}
	defer lineageRows.Close()

	var lineages []*model.Lineage
	for lineageRows.Next() {
		l := &model.Lineage{}
		if err := lineageRows.Scan(&l.ID, &l.ParentID, &l.ChildID, &l.RelationType); err != nil {
			return nil, err
		}
		lineages = append(lineages, l)
	}

	return &model.PathwayTree{Nodes: nodes, Lineages: lineages}, nil
}

func (r *NodeRepo) CreateNode(ctx context.Context, n *model.Node) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO nodes (name, name_zh, description, maturity, is_latest, year, role)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		n.Name, n.NameZH, n.Description, n.Maturity, n.IsLatest, n.Year, n.Role,
	)
	return err
}

func (r *NodeRepo) CreateLineage(ctx context.Context, l *model.Lineage) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO lineages (parent_id, child_id, relation_type) VALUES ($1, $2, $3)`,
		l.ParentID, l.ChildID, l.RelationType,
	)
	return err
}
