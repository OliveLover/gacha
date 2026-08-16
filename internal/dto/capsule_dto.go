package dto

import "github.com/jackc/pgx/v5/pgtype"

type CreateCapsuleRequest struct {
	Message string `json:"message"`
}

type CapsuleCountResponse struct {
	Count int64 `json:"count"`
}

type CapsuleResponse struct {
	ID       pgtype.UUID `json:"id"`
	Message  string      `json:"message"`
	Nickname string      `json:"nickname"`
}
