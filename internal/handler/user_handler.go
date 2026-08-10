package handler

import (
	"gacha/internal/dto"
	"gacha/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
)

type UserHandler struct {
	userService   *service.UserService
	avatarService *service.AvatarService
}

func NewUserHandler(userService *service.UserService, avatarService *service.AvatarService) *UserHandler {
	return &UserHandler{userService: userService, avatarService: avatarService}
}

func (h *UserHandler) UpdateUserAvatar(c *gin.Context) {
	var req dto.UpdateAvatarRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.MustGet("userID").(pgtype.UUID)

	user, err := h.userService.UpdateUserAvatar(c.Request.Context(), userID, req.AvatarID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := buildUserResponse(c, h.avatarService, user)

	c.JSON(http.StatusOK, res)
}
