package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/soar-ai/backend/internal/model"
	"github.com/soar-ai/backend/internal/repository"
)

type PathwayHandler struct {
	repo *repository.NodeRepo
}

func NewPathwayHandler(repo *repository.NodeRepo) *PathwayHandler {
	return &PathwayHandler{repo: repo}
}

func (h *PathwayHandler) GetPathway(c *gin.Context) {
	role := c.Query("role") // developer | architect | pm | all
	tree, err := h.repo.GetPathway(c.Request.Context(), role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tree)
}

func (h *PathwayHandler) CreateNode(c *gin.Context) {
	var n model.Node
	if err := c.ShouldBindJSON(&n); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.CreateNode(c.Request.Context(), &n); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, n)
}

func (h *PathwayHandler) CreateLineage(c *gin.Context) {
	var l model.Lineage
	if err := c.ShouldBindJSON(&l); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.CreateLineage(c.Request.Context(), &l); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, l)
}
