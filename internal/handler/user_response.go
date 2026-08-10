package handler

import (
	"gacha/db/sqlc"
	"gacha/internal/dto"
	"gacha/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
)

// resolveAvatarKey는 avatar_id를 실제 이미지 경로(key)로 변환.
// 아바타가 없거나 조회에 실패하면 빈 문자열을 반환.
func resolveAvatarKey(c *gin.Context, avatarService *service.AvatarService, avatarID pgtype.UUID) string {
	if !avatarID.Valid {
		return ""
	}

	avatar, err := avatarService.GetAvatarByID(c.Request.Context(), avatarID)
	if err != nil {
		return ""
	}

	return avatar.Key
}

// buildUserResponse는 sqlc.User를 API 응답용 dto.UserResponse로 변환.
func buildUserResponse(c *gin.Context, avatarService *service.AvatarService, user sqlc.User) dto.UserResponse {
	return dto.UserResponse{
		ID:       user.ID,
		Email:    user.Email,
		Nickname: user.Nickname,
		Avatar:   resolveAvatarKey(c, avatarService, user.AvatarID),
	}
}
