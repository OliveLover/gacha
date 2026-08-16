package handler

import (
	"errors"
	"gacha/internal/dto"
	"gacha/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type CapsuleHandler struct {
	capsuleService *service.CapsuleService
	userService    *service.UserService
}

func NewCapsuleHandler(capsuleService *service.CapsuleService, userService *service.UserService) *CapsuleHandler {
	return &CapsuleHandler{capsuleService: capsuleService, userService: userService}
}

// CreateCapsule godoc
// @Summary		캡슐 메시지 1개 작성
// @Description	캡슐의 메시지를 작성합니다.
// @Tags		capsules
// @Produce		json
// @Success		201	{object}	dto.CapsuleResponse
// @Failure		400	{object}	dto.ErrorResponse
// @Failure		500	{object}	dto.ErrorResponse
// @Router		/capsules	[post]
func (h *CapsuleHandler) CreateCapsule(c *gin.Context) {
	var req dto.CreateCapsuleRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.MustGet("userID").(pgtype.UUID)

	capsule, err := h.capsuleService.CreateCapsule(c.Request.Context(), userID, req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userService.GetUserByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := dto.CapsuleResponse{
		ID:       capsule.ID,
		Nickname: user.Nickname,
		Message:  capsule.Message,
	}

	c.JSON(http.StatusCreated, res)
}

// DrawCapsule godoc
// @Summary		캡슐 1개 랜덤 뽑기
// @Description	아직 뽑히지 않은 캡슐 중 하나를 랜덤으로 뽑아 메시지와 작성자 닉네임을 반환합니다.
// @Tags		capsules
// @Produce		json
// @Success		200	{object}	dto.CapsuleResponse
// @Failure		404	{object}	dto.ErrorResponse
// @Failure		500	{object}	dto.ErrorResponse
// @Router		/capsules/draw	[post]
func (h *CapsuleHandler) DrawCapsule(c *gin.Context) {
	capsule, err := h.capsuleService.DrawCapsule(c.Request.Context())
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "뽑을 수 있는 캡슐이 없습니다."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userService.GetUserByUserID(c.Request.Context(), capsule.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := dto.CapsuleResponse{
		ID:       capsule.ID,
		Nickname: user.Nickname,
		Message:  capsule.Message,
	}

	c.JSON(http.StatusOK, res)
}
