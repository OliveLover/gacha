package route

import (
	"gacha/internal/handler"
	"gacha/internal/middleware"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Handlers struct {
	Page   *handler.PageHandler
	Auth   *handler.AuthHandler
	Avatar *handler.AvatarHandler
	User   *handler.UserHandler
}

func SetupRoutes(r *gin.Engine, h Handlers) {
	r.LoadHTMLGlob("templates/*")
	r.Static("/static", "./static")

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.GET("/", h.Page.ShowIndexPage)
	r.GET("/login", h.Page.ShowLoginPage)
	r.GET("/signup", h.Page.ShowSignupPage)

	v1 := r.Group("/api/v1")
	{
		v1.POST("/signup", h.Auth.Signup)
		v1.POST("/login", h.Auth.Login)

		v1.GET("/avatars", h.Avatar.ListAvatars)
		v1.GET("/avatars/:avatarID", h.Avatar.GetAvatar)

		v1.PUT("/users/avatar", middleware.AuthMiddleware(), h.User.UpdateUserAvatar)
	}

}
