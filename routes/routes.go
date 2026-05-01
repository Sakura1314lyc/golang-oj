package routes

import (
	"net/http"

	"golang-oj/config"
	"golang-oj/handlers"
	"golang-oj/judge"
	"golang-oj/middleware"
)

func Setup(cfg *config.Config) http.Handler {
	mux := http.NewServeMux()
	judgeService := judge.NewService()

	healthH := handlers.NewHealthHandler()
	authH := handlers.NewAuthHandler(cfg.JWTSecret)
	problemH := handlers.NewProblemHandler()
	submissionH := handlers.NewSubmissionHandler(judgeService)
	contestH := handlers.NewContestHandler()
	leaderboardH := handlers.NewLeaderboardHandler()

	// Public routes
	mux.HandleFunc("/api/health", healthH.Health)
	mux.HandleFunc("/api/auth/register", authH.Register)
	mux.HandleFunc("/api/auth/login", authH.Login)
	mux.HandleFunc("/api/problems", problemH.List)
	mux.HandleFunc("/api/problems/", problemH.Detail)
	mux.HandleFunc("/api/contests", contestH.List)
	mux.HandleFunc("/api/leaderboard", leaderboardH.List)
	mux.HandleFunc("/api/submissions", submissionH.List)
	mux.HandleFunc("/api/status/", submissionH.Status)

	// Protected routes
	authMw := middleware.JWTAuth(cfg.JWTSecret)
	mux.Handle("/api/profile", authMw(http.HandlerFunc(authH.Profile)))
	mux.Handle("/api/submit", authMw(http.HandlerFunc(submissionH.Submit)))

	return middleware.CORS(mux)
}
