package dto

import "github.com/jackc/pgx/v5/pgtype"

type SignUpRequest struct {
	Email    string      `json:"email"`
	Nickname string      `json:"nickname"`
	Password string      `json:"password"`
	AvatarID pgtype.UUID `json:"avatar_id"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}
