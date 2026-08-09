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
