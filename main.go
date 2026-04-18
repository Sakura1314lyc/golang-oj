package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

// RaviOj 增强版后端示例
// 这是一份单文件可运行版本，适合先把功能堆起来：
// - 题目列表
// - 提交代码
// - 状态轮询
// - 最近提交
// - 排行榜
// - 比赛列表
// - 用户资料
//
// 真正上线时再拆成：router / service / repository / judge / auth / contest 等模块。

type Problem struct {
	ID          int        `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Tags        []string   `json:"tags"`
	Difficulty  string     `json:"difficulty"`
	TimeLimitMS int        `json:"time_limit_ms"`
	MemoryLimit int        `json:"memory_limit_mb"`
	Samples     []TestCase `json:"samples,omitempty"`
}

type TestCase struct {
	Input    string `json:"input"`
	Output   string `json:"output"`
	IsSample bool   `json:"is_sample"`
}

type Submission struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	Username    string    `json:"username"`
	ProblemID   int       `json:"problem_id"`
	ProblemName string    `json:"problem_name"`
	Language    string    `json:"language"`
	Code        string    `json:"code,omitempty"`
	Status      string    `json:"status"`
	Runtime     string    `json:"runtime"`
	Detail      string    `json:"detail"`
	CreatedAt   time.Time `json:"created_at"`
}

type Contest struct {
	ID         int       `json:"id"`
	Title      string    `json:"title"`
	StartAt    time.Time `json:"start_at"`
	EndAt      time.Time `json:"end_at"`
	Status     string    `json:"status"`
	ProblemIDs []int     `json:"problem_ids"`
}

type UserProfile struct {
	ID            int    `json:"id"`
	Username      string `json:"username"`
	Rating        int    `json:"rating"`
	SolvedCount   int    `json:"solved_count"`
	SubmitCount   int    `json:"submit_count"`
	AcceptedCount int    `json:"accepted_count"`
}

type LeaderboardItem struct {
	Rank        int    `json:"rank"`
	Username    string `json:"username"`
	Score       int    `json:"score"`
	SolvedCount int    `json:"solved_count"`
}

type SubmitRequest struct {
	ProblemID int    `json:"problem_id"`
	Language  string `json:"language"`
	Code      string `json:"code"`
}

type SubmitResponse struct {
	ID     int    `json:"id"`
	Status string `json:"status"`
	Detail string `json:"detail"`
}

type App struct {
	mux         *http.ServeMux
	mu          sync.RWMutex
	problems    map[int]Problem
	testCases   map[int][]TestCase
	submissions map[int]*Submission
	users       map[int]*UserProfile
	contests    map[int]Contest
	nextSubID   int
}

func main() {
	app := NewApp()
	addr := envOr("ADDR", ":8080")
	log.Printf("RaviOj backend running at %s", addr)
	log.Fatal(http.ListenAndServe(addr, app.withCORS(app.mux)))
}

func NewApp() *App {
	app := &App{
		mux:         http.NewServeMux(),
		problems:    seedProblems(),
		testCases:   seedTestCases(),
		submissions: map[int]*Submission{},
		users:       seedUsers(),
		contests:    seedContests(),
		nextSubID:   1,
	}
	app.routes()
	return app
}

func (a *App) routes() {
	a.mux.HandleFunc("/api/health", a.handleHealth)
	a.mux.HandleFunc("/api/problems", a.handleProblems)
	a.mux.HandleFunc("/api/problems/", a.handleProblemDetail)
	a.mux.HandleFunc("/api/submit", a.handleSubmit)
	a.mux.HandleFunc("/api/status/", a.handleStatus)
	a.mux.HandleFunc("/api/submissions", a.handleSubmissions)
	a.mux.HandleFunc("/api/leaderboard", a.handleLeaderboard)
	a.mux.HandleFunc("/api/contests", a.handleContests)
	a.mux.HandleFunc("/api/profile", a.handleProfile)
}

func (a *App) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) handleHealth(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"service": "RaviOj",
		"time":    time.Now().Format(time.RFC3339),
	})
}

func (a *App) handleProblems(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	a.mu.RLock()
	defer a.mu.RUnlock()

	list := make([]Problem, 0, len(a.problems))
	for _, p := range a.problems {
		p.Samples = nil
		list = append(list, p)
	}
	sort.Slice(list, func(i, j int) bool { return list[i].ID < list[j].ID })
	respondJSON(w, http.StatusOK, list)
}

func (a *App) handleProblemDetail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	id, err := lastInt(r.URL.Path)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid problem id")
		return
	}

	a.mu.RLock()
	defer a.mu.RUnlock()
	p, ok := a.problems[id]
	if !ok {
		respondError(w, http.StatusNotFound, "problem not found")
		return
	}
	p.Samples = filterSamples(a.testCases[id])
	respondJSON(w, http.StatusOK, p)
}

func (a *App) handleSubmit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req SubmitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.ProblemID == 0 || strings.TrimSpace(req.Code) == "" {
		respondError(w, http.StatusBadRequest, "problem_id and code are required")
		return
	}

	a.mu.Lock()
	problem, ok := a.problems[req.ProblemID]
	if !ok {
		a.mu.Unlock()
		respondError(w, http.StatusNotFound, "problem not found")
		return
	}

	subID := a.nextSubID
	a.nextSubID++
	sub := &Submission{
		ID:          subID,
		UserID:      1,
		Username:    "Ravi",
		ProblemID:   problem.ID,
		ProblemName: problem.Title,
		Language:    normalizeLang(req.Language),
		Code:        req.Code,
		Status:      "Pending",
		Runtime:     "--",
		Detail:      "等待进入判题队列",
		CreatedAt:   time.Now(),
	}
	a.submissions[subID] = sub
	if user, ok := a.users[1]; ok {
		user.SubmitCount++
	}
	a.mu.Unlock()

	go a.judgeSubmission(subID)

	respondJSON(w, http.StatusOK, SubmitResponse{
		ID:     subID,
		Status: sub.Status,
		Detail: sub.Detail,
	})
}

func (a *App) handleStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	id, err := lastInt(r.URL.Path)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid submission id")
		return
	}

	a.mu.RLock()
	defer a.mu.RUnlock()
	sub, ok := a.submissions[id]
	if !ok {
		respondError(w, http.StatusNotFound, "submission not found")
		return
	}
	respondJSON(w, http.StatusOK, sub)
}

func (a *App) handleSubmissions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	a.mu.RLock()
	defer a.mu.RUnlock()
	list := make([]Submission, 0, len(a.submissions))
	for _, s := range a.submissions {
		clone := *s
		clone.Code = ""
		list = append(list, clone)
	}
	sort.Slice(list, func(i, j int) bool {
		return list[i].CreatedAt.After(list[j].CreatedAt)
	})
	respondJSON(w, http.StatusOK, list)
}

func (a *App) handleLeaderboard(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	a.mu.RLock()
	defer a.mu.RUnlock()
	items := make([]LeaderboardItem, 0, len(a.users))
	for _, u := range a.users {
		items = append(items, LeaderboardItem{
			Username:    u.Username,
			Score:       u.Rating,
			SolvedCount: u.SolvedCount,
		})
	}
	sort.Slice(items, func(i, j int) bool { return items[i].Score > items[j].Score })
	for i := range items {
		items[i].Rank = i + 1
	}
	respondJSON(w, http.StatusOK, items)
}

func (a *App) handleContests(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	a.mu.RLock()
	defer a.mu.RUnlock()
	list := make([]Contest, 0, len(a.contests))
	for _, c := range a.contests {
		list = append(list, c)
	}
	sort.Slice(list, func(i, j int) bool { return list[i].StartAt.Before(list[j].StartAt) })
	respondJSON(w, http.StatusOK, list)
}

func (a *App) handleProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	a.mu.RLock()
	defer a.mu.RUnlock()
	user, ok := a.users[1]
	if !ok {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}
	respondJSON(w, http.StatusOK, user)
}

func (a *App) judgeSubmission(submissionID int) {
	a.updateSubmission(submissionID, func(s *Submission) {
		s.Status = "Judging"
		s.Detail = "正在编译并执行测试点"
	})

	time.Sleep(1200 * time.Millisecond)

	a.mu.RLock()
	sub, ok := a.submissions[submissionID]
	if !ok {
		a.mu.RUnlock()
		return
	}
	code := sub.Code
	problemID := sub.ProblemID
	lang := sub.Language
	tests := a.testCases[problemID]
	a.mu.RUnlock()

	result := simulateJudge(problemID, lang, code, tests)

	a.updateSubmission(submissionID, func(s *Submission) {
		s.Status = result.Status
		s.Runtime = result.Runtime
		s.Detail = result.Detail
	})

	if result.Status == "Accepted" {
		a.mu.Lock()
		if user, ok := a.users[1]; ok {
			user.AcceptedCount++
			user.SolvedCount = calcSolvedCount(1, a.submissions)
			user.Rating += 8
		}
		a.mu.Unlock()
	}
}

type JudgeResult struct {
	Status  string
	Runtime string
	Detail  string
}

func simulateJudge(problemID int, lang, code string, tests []TestCase) JudgeResult {
	trimmed := strings.ToLower(code)
	if lang != "cpp" && lang != "go" && lang != "python" {
		return JudgeResult{Status: "Compile Error", Runtime: "--", Detail: "暂不支持该语言"}
	}
	if strings.TrimSpace(code) == "" {
		return JudgeResult{Status: "Compile Error", Runtime: "--", Detail: "代码不能为空"}
	}
	if strings.Contains(trimmed, "while(true)") || strings.Contains(trimmed, "for(;;)") {
		return JudgeResult{Status: "Time Limit Exceeded", Runtime: "1000 ms", Detail: "检测到疑似死循环"}
	}

	switch problemID {
	case 1001:
		if containsAll(trimmed, []string{"cin", "cout", "+"}) {
			return JudgeResult{Status: "Accepted", Runtime: fmt.Sprintf("%d ms", 40+rand.Intn(90)), Detail: fmt.Sprintf("通过 %d/%d 个测试点", len(tests), len(tests))}
		}
		return JudgeResult{Status: "Wrong Answer", Runtime: "17 ms", Detail: "A + B 题目未检测到正确求和逻辑"}
	case 1002:
		if containsAny(trimmed, []string{"reverse(", "[::-1]", "for i := len", "swap("}) {
			return JudgeResult{Status: "Accepted", Runtime: fmt.Sprintf("%d ms", 25+rand.Intn(60)), Detail: fmt.Sprintf("通过 %d/%d 个测试点", len(tests), len(tests))}
		}
		return JudgeResult{Status: "Wrong Answer", Runtime: "9 ms", Detail: "Reverse String 题目未检测到反转逻辑"}
	default:
		return JudgeResult{Status: "System Error", Runtime: "--", Detail: "暂未实现该题目的模拟判题逻辑"}
	}
}

func (a *App) updateSubmission(id int, fn func(*Submission)) {
	a.mu.Lock()
	defer a.mu.Unlock()
	if sub, ok := a.submissions[id]; ok {
		fn(sub)
	}
}

func filterSamples(cases []TestCase) []TestCase {
	res := make([]TestCase, 0)
	for _, tc := range cases {
		if tc.IsSample {
			res = append(res, tc)
		}
	}
	return res
}

func calcSolvedCount(userID int, submissions map[int]*Submission) int {
	solved := map[int]bool{}
	for _, s := range submissions {
		if s.UserID == userID && s.Status == "Accepted" {
			solved[s.ProblemID] = true
		}
	}
	return len(solved)
}

func containsAll(s string, parts []string) bool {
	for _, p := range parts {
		if !strings.Contains(s, p) {
			return false
		}
	}
	return true
}

func containsAny(s string, parts []string) bool {
	for _, p := range parts {
		if strings.Contains(s, p) {
			return true
		}
	}
	return false
}

func normalizeLang(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	switch s {
	case "c++", "cpp", "cxx":
		return "cpp"
	case "golang", "go":
		return "go"
	case "python", "py", "python3":
		return "python"
	default:
		return s
	}
}

func lastInt(path string) (int, error) {
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) == 0 {
		return 0, errors.New("empty path")
	}
	return strconv.Atoi(parts[len(parts)-1])
}

func respondJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func respondError(w http.ResponseWriter, status int, msg string) {
	respondJSON(w, status, map[string]any{"error": msg})
}

func envOr(key, fallback string) string {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	return v
}

func seedProblems() map[int]Problem {
	return map[int]Problem{
		1001: {
			ID:          1001,
			Title:       "A + B Problem",
			Description: "输入两个整数，输出它们的和。",
			Tags:        []string{"math", "implementation"},
			Difficulty:  "Easy",
			TimeLimitMS: 1000,
			MemoryLimit: 128,
		},
		1002: {
			ID:          1002,
			Title:       "Reverse String",
			Description: "输入一个字符串，输出反转后的结果。",
			Tags:        []string{"string"},
			Difficulty:  "Easy",
			TimeLimitMS: 1000,
			MemoryLimit: 128,
		},
	}
}

func seedTestCases() map[int][]TestCase {
	return map[int][]TestCase{
		1001: {
			{Input: "1 2", Output: "3", IsSample: true},
			{Input: "100 250", Output: "350", IsSample: true},
			{Input: "999 1", Output: "1000", IsSample: false},
		},
		1002: {
			{Input: "ravi", Output: "ivar", IsSample: true},
			{Input: "abcde", Output: "edcba", IsSample: true},
			{Input: "level", Output: "level", IsSample: false},
		},
	}
}

func seedUsers() map[int]*UserProfile {
	return map[int]*UserProfile{
		1: {ID: 1, Username: "Ravi", Rating: 1280, SolvedCount: 2, SubmitCount: 10, AcceptedCount: 8},
		2: {ID: 2, Username: "Alice", Rating: 1200, SolvedCount: 11, SubmitCount: 25, AcceptedCount: 18},
		3: {ID: 3, Username: "Bob", Rating: 1160, SolvedCount: 10, SubmitCount: 21, AcceptedCount: 15},
	}
}

func seedContests() map[int]Contest {
	now := time.Now()
	return map[int]Contest{
		1: {
			ID:         1,
			Title:      "RaviOj 春季周赛",
			StartAt:    now.Add(-2 * time.Hour),
			EndAt:      now.Add(3 * time.Hour),
			Status:     "Running",
			ProblemIDs: []int{1001, 1002},
		},
		2: {
			ID:         2,
			Title:      "RaviOj 新手训练营",
			StartAt:    now.Add(24 * time.Hour),
			EndAt:      now.Add(48 * time.Hour),
			Status:     "Upcoming",
			ProblemIDs: []int{1001},
		},
	}
}
