package service

import (
	"context"

	"gacha/db/sqlc"
	"gacha/internal/dto"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	queries sqlc.Querier
}

func NewAuthService(queries sqlc.Querier) *AuthService {
	return &AuthService{queries: queries}
}

func (s *AuthService) CreateUser(ctx context.Context, req dto.SignUpRequest) (sqlc.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return sqlc.User{}, err
	}

	return s.queries.CreateUser(ctx, sqlc.CreateUserParams{
		Email:        req.Email,
		Nickname:     req.Nickname,
		PasswordHash: string(hash),
	})
}
