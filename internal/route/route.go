package route

import (
	"gacha/internal/handler"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, authHandler *handler.AuthHandler) {
	r.LoadHTMLGlob("templates/*")

	v1 := r.Group("/api/v1")
	{
		v1.POST("/signup", authHandler.Signup)
	}

}
