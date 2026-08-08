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

func (h *PageHandler) ShowLoginPage(c *gin.Context) {
	c.HTML(http.StatusOK, "login.html", gin.H{})
}

func (h *PageHandler) ShowSignupPage(c *gin.Context) {
	c.HTML(http.StatusOK, "signup.html", gin.H{})
}
