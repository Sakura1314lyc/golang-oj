package middleware

import (
	"context"
	"net/http"
	"strings"

	"golang-oj/database"
	"golang-oj/models"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserIDKey contextKey = "user_id"
const UsernameKey contextKey = "username"
const UserRoleKey contextKey = "user_role"

func JWTAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			auth := r.Header.Get("Authorization")
			if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
				http.Error(w, `{"error":"missing authorization"}`, http.StatusUnauthorized)
				return
			}
			tokenStr := strings.TrimPrefix(auth, "Bearer ")

			token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
				return []byte(secret), nil
			})
			if err != nil || !token.Valid {
				http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				http.Error(w, `{"error":"invalid claims"}`, http.StatusUnauthorized)
				return
			}

			userID := uint(claims["user_id"].(float64))
			username := claims["username"].(string)

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			ctx = context.WithValue(ctx, UsernameKey, username)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// AdminOnly restricts access to admin users.
func AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(UserIDKey).(uint)
		if !ok {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}

		var user models.User
		if database.DB.First(&user, userID).Error != nil {
			http.Error(w, `{"error":"user not found"}`, http.StatusUnauthorized)
			return
		}

		if user.Role != models.RoleAdmin {
			http.Error(w, `{"error":"admin only"}`, http.StatusForbidden)
			return
		}

		ctx := context.WithValue(r.Context(), UserRoleKey, user.Role)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
