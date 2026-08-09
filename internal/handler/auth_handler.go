package handler

import (
	"gacha/internal/dto"
	"gacha/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// SignUp godoc
// @Summary		회원가입
// @Description	이메일/이름/닉네임/비밀번호로 새 계정을 생성합니다.
// @Tags		users
// @Accept		json
// @Produce		json
// @Param		request	body		dto.SignUpRequest	true	"회원가입 정보"
// @Success		201		{object}	object{message=sqlc.User}
// @Failure		400		{object}	dto.ErrorResponse
// @Failure		500		{object}	dto.ErrorResponse
// @Router		/signup	[post]
func (h *AuthHandler) Signup(c *gin.Context) {
	var req dto.SignUpRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.authService.CreateUser(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": user})
}
