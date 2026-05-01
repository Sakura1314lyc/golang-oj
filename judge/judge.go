package judge

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"golang-oj/database"
	"golang-oj/models"
)

type Service struct{}

func NewService() *Service {
	return &Service{}
}

type result struct {
	Status  string
	Runtime string
	Memory  string
	Detail  string
}

func (s *Service) Judge(sub *models.Submission, problem *models.Problem, testCases []models.TestCase) {
	s.updateStatus(sub.ID, "Judging", "--", "正在编译并执行测试点...")

	tmpDir, err := os.MkdirTemp("", "gooj-*")
	if err != nil {
		s.updateStatus(sub.ID, "System Error", "--", fmt.Sprintf("创建临时目录失败: %v", err))
		return
	}
	defer os.RemoveAll(tmpDir)

	res := s.runJudge(tmpDir, sub, problem, testCases)

	s.updateStatus(sub.ID, res.Status, res.Runtime, res.Detail)

	if res.Status == "Accepted" {
		database.DB.Model(&models.User{}).Where("id = ?", sub.UserID).
			Updates(map[string]any{
				"accepted_count": database.DB.Raw("accepted_count + 1"),
				"rating":         database.DB.Raw("rating + 8"),
			})
		s.recalcSolved(sub.UserID)
	}
}

func (s *Service) runJudge(tmpDir string, sub *models.Submission, problem *models.Problem, testCases []models.TestCase) result {
	sourceFile := filepath.Join(tmpDir, sourceFileName(sub.Language))
	if err := os.WriteFile(sourceFile, []byte(sub.Code), 0644); err != nil {
		return result{Status: "System Error", Runtime: "--", Detail: fmt.Sprintf("写入代码文件失败: %v", err)}
	}

	execPath := sourceFile
	compileCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if sub.Language == "cpp" {
		execPath = filepath.Join(tmpDir, "prog.exe")
		cmd := exec.CommandContext(compileCtx, "g++", sourceFile, "-o", execPath, "-std=c++17", "-O2", "-lm")
		output, err := cmd.CombinedOutput()
		if err != nil {
			return result{Status: "Compile Error", Runtime: "--", Detail: string(output)}
		}
	}

	if len(testCases) == 0 {
		return result{Status: "Accepted", Runtime: "0 ms", Detail: "通过 0/0 个测试点（无测试数据）"}
	}

	passed := 0
	var totalTime int64 = 0
	timeLimit := problem.TimeLimitMS
	if timeLimit <= 0 {
		timeLimit = 1000
	}

	for i, tc := range testCases {
		runCtx, cancel := context.WithTimeout(context.Background(), time.Duration(timeLimit+1000)*time.Millisecond)
		start := time.Now()

		var cmd *exec.Cmd
		switch sub.Language {
		case "cpp":
			cmd = exec.CommandContext(runCtx, execPath)
		case "go":
			cmd = exec.CommandContext(runCtx, "go", "run", sourceFile)
		case "python":
			cmd = exec.CommandContext(runCtx, "python", sourceFile)
		default:
			cancel()
			return result{Status: "System Error", Runtime: "--", Detail: fmt.Sprintf("不支持的语言: %s", sub.Language)}
		}

		cmd.Dir = tmpDir
		cmd.Stdin = strings.NewReader(tc.Input)
		output, err := cmd.CombinedOutput()
		elapsed := time.Since(start).Milliseconds()
		cancel()

		if runCtx.Err() == context.DeadlineExceeded {
			return result{
				Status:  "Time Limit Exceeded",
				Runtime: fmt.Sprintf("%d ms", elapsed),
				Detail:  fmt.Sprintf("测试点 #%d 超时（限制 %d ms）", i+1, timeLimit),
			}
		}

		if err != nil {
			return result{
				Status:  "Runtime Error",
				Runtime: fmt.Sprintf("%d ms", elapsed),
				Detail:  fmt.Sprintf("测试点 #%d 运行错误: %s", i+1, string(output)),
			}
		}

		totalTime += elapsed

		got := strings.TrimSpace(string(output))
		want := strings.TrimSpace(tc.Output)
		if got != want {
			return result{
				Status:  "Wrong Answer",
				Runtime: fmt.Sprintf("%d ms", elapsed),
				Detail:  fmt.Sprintf("测试点 #%d 输出不匹配\n预期: %s\n实际: %s", i+1, want, got),
			}
		}
		passed++
	}

	return result{
		Status:  "Accepted",
		Runtime: fmt.Sprintf("%d ms", totalTime/int64(len(testCases))),
		Detail:  fmt.Sprintf("通过 %d/%d 个测试点", passed, len(testCases)),
	}
}

func (s *Service) updateStatus(subID uint, status, runtime, detail string) {
	database.DB.Model(&models.Submission{}).Where("id = ?", subID).
		Updates(map[string]any{
			"status":  status,
			"runtime": runtime,
			"detail":  detail,
		})
}

func (s *Service) recalcSolved(userID uint) {
	var solved int64
	database.DB.Model(&models.Submission{}).
		Where("user_id = ? AND status = ?", userID, "Accepted").
		Distinct("problem_id").Count(&solved)
	database.DB.Model(&models.User{}).Where("id = ?", userID).
		Update("solved_count", solved)
}

func sourceFileName(lang string) string {
	switch lang {
	case "cpp":
		return "main.cpp"
	case "go":
		return "main.go"
	case "python":
		return "main.py"
	default:
		return "source.txt"
	}
}
