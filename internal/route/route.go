package route

import (
	"gacha/internal/handler"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRoutes(r *gin.Engine, pageHandler *handler.PageHandler, authHandler *handler.AuthHandler) {
	r.LoadHTMLGlob("templates/*")
	r.Static("/static", "./static")

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.GET("/", pageHandler.ShowIndexPage)
	r.GET("/login", pageHandler.ShowLoginPage)
	r.GET("/signup", pageHandler.ShowSignupPage)

	v1 := r.Group("/api/v1")
	{
		v1.POST("/signup", authHandler.Signup)
		v1.POST("/login", authHandler.Login)
	}

}
