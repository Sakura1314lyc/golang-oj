package judge

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
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
	s.updateStatus(sub.ID, models.StatusJudging, "--", "--", "正在编译并执行测试点...")

	tmpDir, err := os.MkdirTemp("", "gooj-*")
	if err != nil {
		s.updateStatus(sub.ID, models.StatusSystemError, "--", "--", fmt.Sprintf("创建临时目录失败: %v", err))
		return
	}
	defer os.RemoveAll(tmpDir)

	// Create go.mod for Go submissions (required for Go module mode)
	if sub.Language == "go" {
		if err := os.WriteFile(filepath.Join(tmpDir, "go.mod"), []byte("module gooj_judge\ngo 1.26\n"), 0644); err != nil {
			s.updateStatus(sub.ID, models.StatusSystemError, "--", "--", fmt.Sprintf("创建go.mod失败: %v", err))
			return
		}
	}

	res := s.runJudge(tmpDir, sub, problem, testCases)

	s.updateStatus(sub.ID, res.Status, res.Runtime, res.Memory, res.Detail)

	if res.Status == models.StatusAccepted {
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
		return result{Status: models.StatusSystemError, Runtime: "--", Detail: fmt.Sprintf("写入代码文件失败: %v", err)}
	}

	execPath := sourceFile
	compileCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Compilation step
	switch sub.Language {
	case "cpp":
		execPath = filepath.Join(tmpDir, "prog"+exeSuffix())
		cmd := exec.CommandContext(compileCtx, "g++", sourceFile, "-o", execPath, "-std=c++17", "-O2", "-lm")
		output, err := cmd.CombinedOutput()
		if err != nil {
			return result{Status: models.StatusCompileError, Runtime: "--", Detail: string(output)}
		}
	case "java":
		execPath = filepath.Join(tmpDir, "Main")
		cmd := exec.CommandContext(compileCtx, "javac", sourceFile, "-d", tmpDir)
		output, err := cmd.CombinedOutput()
		if err != nil {
			return result{Status: models.StatusCompileError, Runtime: "--", Detail: string(output)}
		}
	}

	if len(testCases) == 0 {
		return result{Status: models.StatusAccepted, Runtime: "0 ms", Memory: "0 KB", Detail: "通过 0/0 个测试点（无测试数据）"}
	}

	passed := 0
	var totalTime int64 = 0
	timeLimit := problem.TimeLimitMS
	if timeLimit <= 0 {
		timeLimit = 1000
	}

	for i, tc := range testCases {
		runCtx, runCancel := context.WithTimeout(context.Background(), time.Duration(timeLimit+2000)*time.Millisecond)

		var cmd *exec.Cmd
		switch sub.Language {
		case "cpp":
			cmd = exec.CommandContext(runCtx, execPath)
		case "go":
			cmd = exec.CommandContext(runCtx, "go", "run", sourceFile)
		case "python":
			cmd = exec.CommandContext(runCtx, "python", sourceFile)
		case "java":
			cmd = exec.CommandContext(runCtx, "java", "-cp", tmpDir, "Main")
		case "javascript":
			cmd = exec.CommandContext(runCtx, "node", sourceFile)
		default:
			runCancel()
			return result{Status: models.StatusSystemError, Runtime: "--", Detail: fmt.Sprintf("不支持的语言: %s", sub.Language)}
		}

		start := time.Now()
		cmd.Dir = tmpDir
		cmd.Stdin = strings.NewReader(tc.Input)
		output, err := cmd.CombinedOutput()
		elapsed := time.Since(start).Milliseconds()

		if elapsed > int64(timeLimit) || runCtx.Err() == context.DeadlineExceeded {
			runCancel()
			return result{
				Status:  models.StatusTimeLimitExceeded,
				Runtime: fmt.Sprintf("%d ms", elapsed),
				Memory:  "--",
				Detail:  fmt.Sprintf("测试点 #%d 超时（限制 %d ms）", i+1, timeLimit),
			}
		}

		if err != nil {
			runCancel()
			return result{
				Status:  models.StatusRuntimeError,
				Runtime: fmt.Sprintf("%d ms", elapsed),
				Memory:  "--",
				Detail:  fmt.Sprintf("测试点 #%d 运行错误: %s", i+1, string(output)),
			}
		}

		totalTime += elapsed

		got := strings.TrimSpace(string(output))
		want := strings.TrimSpace(tc.Output)
		if got != want {
			runCancel()
			return result{
				Status:  models.StatusWrongAnswer,
				Runtime: fmt.Sprintf("%d ms", elapsed),
				Memory:  "--",
				Detail:  fmt.Sprintf("测试点 #%d 输出不匹配\n预期: %s\n实际: %s", i+1, want, got),
			}
		}
		runCancel()
		passed++
	}

	avgTime := totalTime / int64(len(testCases))
	return result{
		Status:  models.StatusAccepted,
		Runtime: fmt.Sprintf("%d ms", avgTime),
		Memory:  "--",
		Detail:  fmt.Sprintf("通过 %d/%d 个测试点", passed, len(testCases)),
	}
}

func (s *Service) updateStatus(subID uint, status, runtime, memory, detail string) {
	database.DB.Model(&models.Submission{}).Where("id = ?", subID).
		Updates(map[string]any{
			"status":  status,
			"runtime": runtime,
			"memory":  memory,
			"detail":  detail,
		})
}

func (s *Service) recalcSolved(userID uint) {
	var solved int64
	database.DB.Model(&models.Submission{}).
		Where("user_id = ? AND status = ?", userID, models.StatusAccepted).
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
	case "java":
		return "Main.java"
	case "javascript":
		return "main.js"
	default:
		return "source.txt"
	}
}

func exeSuffix() string {
	if runtime.GOOS == "windows" {
		return ".exe"
	}
	return ""
}
