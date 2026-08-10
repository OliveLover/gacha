package handler

import (
	"gacha/internal/dto"
	"gacha/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
)

type AuthHandler struct {
	authService   *service.AuthService
	avatarService *service.AvatarService
}

func NewAuthHandler(authService *service.AuthService, avatarService *service.AvatarService) *AuthHandler {
	return &AuthHandler{authService: authService, avatarService: avatarService}
}

// resolveAvatarKey는 avatar_id를 실제 이미지 경로(key)로 변환.
// 아바타가 없거나 조회에 실패하면 빈 문자열을 반환.
func (h *AuthHandler) resolveAvatarKey(c *gin.Context, avatarID pgtype.UUID) string {
	if !avatarID.Valid {
		return ""
	}

	avatar, err := h.avatarService.GetAvatarByID(c.Request.Context(), avatarID)
	if err != nil {
		return ""
	}

	return avatar.Key
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
		Avatar:   h.resolveAvatarKey(c, user.AvatarID),
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
			Avatar:   h.resolveAvatarKey(c, user.AvatarID),
		},
	}

	c.JSON(http.StatusOK, res)
}
