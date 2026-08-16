package dto

import "github.com/jackc/pgx/v5/pgtype"

type CreateCapsuleRequest struct {
	Message string `json:"message"`
}

type CapsuleResponse struct {
	ID       pgtype.UUID `json:"id"`
	Message  string      `json:"message"`
	Nickname string      `json:"nickname"`
}
