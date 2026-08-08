package db

import (
	"context"
	"gacha/db/sqlc"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool
var Queries *sqlc.Queries

func Connect() {
	dsn := os.Getenv("DB_URL")
	if dsn == "" {
		log.Fatal("DB_URL not set")
	}

	var err error
	Pool, err = pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatalf("DB connection failed: %v", err)
	}

	if err = Pool.Ping(context.Background()); err != nil {
		log.Fatalf("DB ping failed: %v", err)
	}

	Queries = sqlc.New(Pool)
	log.Println("DB connected")
}

func Close() {
	if Pool != nil {
		Pool.Close()
	}
}
