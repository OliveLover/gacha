package dto

import "github.com/jackc/pgx/v5/pgtype"

type AvatarResponse struct {
	ID        pgtype.UUID `json:"id"`
	Name      string      `json:"name"`
	Key       string      `json:"key"`
	IsActive  bool        `json:"is_active"`
	SortOrder int32       `json:"sort_order"`
}
