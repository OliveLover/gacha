package service

import (
	"context"
	"gacha/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type UserService struct {
	queries sqlc.Querier
}

func NewUserService(queries sqlc.Querier) *UserService {
	return &UserService{queries: queries}
}

func (s *UserService) UpdateUserAvatar(ctx context.Context, userID pgtype.UUID, avatarID pgtype.UUID) (sqlc.User, error) {
	return s.queries.UpdateUserAvatar(ctx, sqlc.UpdateUserAvatarParams{
		ID:       userID,
		AvatarID: avatarID,
	})
}
