package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"golang-oj/database"
	"golang-oj/models"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler {
	return &UserHandler{}
}

func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePagination(r)
	search := strings.TrimSpace(r.URL.Query().Get("q"))

	query := database.DB.Model(&models.User{})
	if search != "" {
		like := "%" + search + "%"
		query = query.Where("username LIKE ?", like)
	}

	var total int64
	query.Count(&total)

	var users []models.User
	query.Select("id, username, email, avatar, bio, role, rating, solved_count, submit_count, accepted_count, created_at").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Order("rating desc").
		Find(&users)

	writePaginated(w, users, page, pageSize, total)
}

func (h *UserHandler) PublicProfile(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/users/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "无效的用户 ID")
		return
	}

	var user models.User
	if database.DB.Select("id, username, email, avatar, bio, role, rating, solved_count, submit_count, accepted_count, created_at").
		First(&user, id).Error != nil {
		writeError(w, http.StatusNotFound, "用户不存在")
		return
	}

	writeJSON(w, http.StatusOK, &user)
}
