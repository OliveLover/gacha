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
// @Success		201		{object}	dto.UserResponse
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

	res := dto.UserResponse{
		ID:       user.ID,
		Email:    user.Email,
		Nickname: user.Nickname,
		AvatarID: user.AvatarID,
	}

	c.JSON(http.StatusCreated, res)
}

// Login godoc
// @Summary		로그인
// @Description	이메일/비밀번호로 사용자를 인증하고 JWT를 발급합니다.
// @Tags		users
// @Accept		json
// @Produce		json
// @Param		request	body		dto.LoginRequest	true	"로그인 정보"
// @Success		200		{object}	dto.LoginResponse
// @Failure		400		{object}	dto.ErrorResponse
// @Failure		500		{object}	dto.ErrorResponse
// @Router		/login	[post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, user, err := h.authService.Authenticate(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := dto.LoginResponse{
		Token: token,
		User: dto.UserResponse{
			ID:       user.ID,
			Email:    user.Email,
			Nickname: user.Nickname,
		},
	}

	c.JSON(http.StatusOK, res)
}
