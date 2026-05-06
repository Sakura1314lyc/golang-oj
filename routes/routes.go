package routes

import (
	"net/http"
	"strings"
	"time"

	"golang-oj/config"
	"golang-oj/handlers"
	"golang-oj/judge"
	"golang-oj/middleware"
)

// Route path helpers to avoid repeating the middleware chain
func adminRoute(adminMw, authMw func(http.Handler) http.Handler, h http.HandlerFunc) http.Handler {
	return adminMw(authMw(http.HandlerFunc(h)))
}

func Setup(cfg *config.Config) http.Handler {
	mux := http.NewServeMux()
	judgeService := judge.NewService()

	healthH := handlers.NewHealthHandler()
	authH := handlers.NewAuthHandler(cfg.JWTSecret)
	problemH := handlers.NewProblemHandler()
	submissionH := handlers.NewSubmissionHandler(judgeService)
	contestH := handlers.NewContestHandler()
	leaderboardH := handlers.NewLeaderboardHandler()
	userH := handlers.NewUserHandler()
	adminH := handlers.NewAdminHandler(judgeService)
	rl := middleware.NewRateLimiter(100, time.Minute)

	authMw := middleware.JWTAuth(cfg.JWTSecret)
	adminMw := middleware.AdminOnly

	// === Public routes ===
	mux.HandleFunc("/api/health", healthH.Health)
	mux.HandleFunc("/api/auth/register", authH.Register)
	mux.HandleFunc("/api/auth/login", authH.Login)

	// Problems
	mux.HandleFunc("/api/problems", problemH.List)
	mux.HandleFunc("/api/problems/", problemH.Detail)

	// Contests
	mux.HandleFunc("/api/contests", contestH.List)
	mux.HandleFunc("/api/contests/", func(w http.ResponseWriter, r *http.Request) {
		// /api/contests/{id} or /api/contests/{id}/rank
		if strings.HasSuffix(r.URL.Path, "/rank") {
			contestH.Rank(w, r)
		} else {
			contestH.Detail(w, r)
		}
	})

	// Leaderboard
	mux.HandleFunc("/api/leaderboard", leaderboardH.List)

	// Users (public)
	mux.HandleFunc("/api/users/", userH.PublicProfile)

	// Announcements (public)
	mux.HandleFunc("/api/announcements", handlers.ListActiveAnnouncements)

	// Submissions (public list)
	mux.HandleFunc("/api/submissions", submissionH.List)
	mux.HandleFunc("/api/status/", submissionH.Status)

	// === Protected routes ===
	mux.Handle("/api/profile", authMw(http.HandlerFunc(authH.Profile)))
	mux.Handle("/api/profile/update", authMw(http.HandlerFunc(authH.UpdateProfile)))
	mux.Handle("/api/profile/password", authMw(http.HandlerFunc(authH.ChangePassword)))
	mux.Handle("/api/submit", authMw(http.HandlerFunc(submissionH.Submit)))
	mux.Handle("/api/my/submissions", authMw(http.HandlerFunc(submissionH.UserSubmissions)))

	// === Admin routes ===
	mux.Handle("/api/admin/problems/create", adminMw(authMw(http.HandlerFunc(problemH.Create))))
	mux.Handle("/api/admin/problems/", adminMw(authMw(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut, http.MethodPatch:
			problemH.Update(w, r)
		case http.MethodDelete:
			problemH.Delete(w, r)
		default:
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		}
	}))))
	mux.Handle("/api/admin/users", adminMw(authMw(http.HandlerFunc(userH.List))))
	mux.Handle("/api/admin/announcements", adminMw(authMw(http.HandlerFunc(adminH.ListAnnouncements))))
	mux.Handle("/api/admin/announcements/create", adminMw(authMw(http.HandlerFunc(adminH.CreateAnnouncement))))
	mux.Handle("/api/admin/announcements/", adminMw(authMw(http.HandlerFunc(adminH.DeleteAnnouncement))))
	mux.Handle("/api/admin/stats/problems", adminMw(authMw(http.HandlerFunc(adminH.ProblemStats))))
	mux.Handle("/api/admin/stats/problems/", adminMw(authMw(http.HandlerFunc(adminH.ProblemStats))))
	mux.Handle("/api/admin/rejudge/", adminMw(authMw(http.HandlerFunc(adminH.Rejudge))))

	// Apply global middleware
	var h http.Handler = mux
	h = middleware.Logging(h)
	h = rl.Limit(h)
	h = middleware.CORS(h)

	return h
}

