package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"golang-oj/database"
	"golang-oj/middleware"
	"golang-oj/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	jwtSecret string
}

func NewAuthHandler(jwtSecret string) *AuthHandler {
	return &AuthHandler{jwtSecret: jwtSecret}
}

type registerReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type loginReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type authResp struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "无效的请求格式")
		return
	}
	if len(req.Username) < 2 || len(req.Username) > 32 {
		writeError(w, http.StatusBadRequest, "用户名长度需在 2-32 之间")
		return
	}
	if len(req.Password) < 4 {
		writeError(w, http.StatusBadRequest, "密码至少需要 4 位")
		return
	}

	var existing models.User
	if database.DB.Where("username = ?", req.Username).First(&existing).Error == nil {
		writeError(w, http.StatusConflict, "用户名已存在")
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "注册失败")
		return
	}

	user := models.User{
		Username: req.Username,
		Password: string(hashed),
		Rating:   1200,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "注册失败")
		return
	}

	token, err := h.generateToken(user.ID, user.Username)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "生成令牌失败")
		return
	}

	writeJSON(w, http.StatusCreated, authResp{Token: token, User: &user})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "无效的请求格式")
		return
	}

	var user models.User
	if database.DB.Where("username = ?", req.Username).First(&user).Error != nil {
		writeError(w, http.StatusUnauthorized, "用户名或密码错误")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		writeError(w, http.StatusUnauthorized, "用户名或密码错误")
		return
	}

	token, err := h.generateToken(user.ID, user.Username)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "生成令牌失败")
		return
	}

	writeJSON(w, http.StatusOK, authResp{Token: token, User: &user})
}

func (h *AuthHandler) Profile(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(uint)
	var user models.User
	if database.DB.First(&user, userID).Error != nil {
		writeError(w, http.StatusNotFound, "用户不存在")
		return
	}
	writeJSON(w, http.StatusOK, &user)
}

func (h *AuthHandler) generateToken(userID uint, username string) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"exp":      time.Now().Add(72 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.jwtSecret))
}
