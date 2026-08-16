package service

import (
	"context"
	"gacha/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type CapsuleService struct {
	queries sqlc.Querier
}

func NewCapsuleService(queries sqlc.Querier) *CapsuleService {
	return &CapsuleService{queries: queries}
}

func (s *CapsuleService) CreateCapsule(ctx context.Context, userID pgtype.UUID, message string) (sqlc.Capsule, error) {
	capsule, err := s.queries.CreateCapsule(ctx, sqlc.CreateCapsuleParams{
		UserID:  userID,
		Message: message,
	})
	if err != nil {
		return sqlc.Capsule{}, err
	}

	return capsule, nil
}

func (s *CapsuleService) DrawCapsule(ctx context.Context) (sqlc.Capsule, error) {
	capsule, err := s.queries.DrawCapsule(ctx)
	if err != nil {
		return sqlc.Capsule{}, err
	}

	return capsule, nil
}
