package handler

import (
	"gacha/internal/dto"
	"gacha/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AvatarHandler struct {
	avatarService *service.AvatarService
}

func NewAvatarHandler(avatarService *service.AvatarService) *AvatarHandler {
	return &AvatarHandler{avatarService: avatarService}
}

// ListAvatars godoc
// @Summary		아바타 목록 조회
// @Description	활성화된 아바타 목록을 정렬 순서대로 조회합니다.
// @Tags		avatars
// @Produce		json
// @Success		200	{array}		dto.AvatarResponse
// @Failure		500	{object}	dto.ErrorResponse
// @Router		/avatars	[get]
func (h *AvatarHandler) ListAvatars(c *gin.Context) {
	avatars, err := h.avatarService.ListActiveAvatars(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var res []dto.AvatarResponse
	for _, avatar := range avatars {
		res = append(res, dto.AvatarResponse{
			ID:        avatar.ID,
			Name:      avatar.Name,
			Key:       avatar.Key,
			IsActive:  avatar.IsActive,
			SortOrder: avatar.SortOrder,
		})
	}

	c.JSON(http.StatusOK, res)
}
