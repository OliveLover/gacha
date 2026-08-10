package service

import (
	"context"
	"gacha/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type AvatarService struct {
	queries sqlc.Querier
}

func NewAvatarService(queries sqlc.Querier) *AvatarService {
	return &AvatarService{queries: queries}
}

func (s *AvatarService) ListActiveAvatars(ctx context.Context) ([]sqlc.Avatar, error) {
	avatars, err := s.queries.ListActiveAvatars(ctx)
	if err != nil {
		return nil, err
	}

	return avatars, nil
}

func (s *AvatarService) GetAvatarByID(ctx context.Context, avatarID pgtype.UUID) (sqlc.Avatar, error) {
	avatar, err := s.queries.GetAvatarByID(ctx, avatarID)
	if err != nil {
		return sqlc.Avatar{}, err
	}

	return avatar, nil
}
