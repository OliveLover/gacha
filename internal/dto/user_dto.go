package dto

import "github.com/jackc/pgx/v5/pgtype"

type UserResponse struct {
	ID       pgtype.UUID `json:"id"`
	Email    string      `json:"email"`
	Nickname string      `json:"nickname"`
}
