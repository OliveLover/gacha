package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type PageHandler struct {
}

func NewPageHandler() *PageHandler {
	return &PageHandler{}
}

func (h *PageHandler) ShowIndexPage(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", gin.H{})
}
