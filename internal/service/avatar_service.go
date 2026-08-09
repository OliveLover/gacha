package service

import (
	"context"
	"gacha/db/sqlc"
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
