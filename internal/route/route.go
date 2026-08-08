package route

import (
	"gacha/internal/handler"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, pageHandler *handler.PageHandler, authHandler *handler.AuthHandler) {
	r.LoadHTMLGlob("templates/*")

	r.GET("/", pageHandler.ShowIndexPage)

	v1 := r.Group("/api/v1")
	{
		v1.POST("/signup", authHandler.Signup)
	}

}
