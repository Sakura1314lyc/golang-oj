package handlers

import (
	"encoding/json"
	"net/http"
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func writePaginated(w http.ResponseWriter, data any, page, pageSize int, total int64) {
	writeJSON(w, http.StatusOK, PaginatedResponse{
		Data:       data,
		Pagination: newPagination(page, pageSize, total),
	})
}

func writeMsg(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"message": msg})
}
