package main

import (
	"gacha/db"
	_ "gacha/docs"
	"gacha/internal/handler"
	"gacha/internal/route"
	"gacha/internal/service"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// @title Project Gacha
// @version 1.0
// @host localhost:8080
// @BasePath /api/v1
func main() {
	// 환경설정 로드
	if err := godotenv.Load(".env.dev"); err != nil {
		log.Printf("No .env.dev file found, using existing environment variables")
	}

	// 로그설정
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// DB 연결
	db.Connect()
	defer db.Close()

	pageHandler := handler.NewPageHandler()

	authService := service.NewAuthService(db.Queries)
	authHandler := handler.NewAuthHandler(authService)

	r := gin.Default()
	route.SetupRoutes(r, pageHandler, authHandler)

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
