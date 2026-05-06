package config

import (
	"os"
	"strings"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	ServerPort string
}

func Load() *Config {
	loadEnvFile()
	return &Config{
		DBHost:     envOr("DB_HOST", "localhost"),
		DBPort:     envOr("DB_PORT", "3306"),
		DBUser:     envOr("DB_USER", "root"),
		DBPassword: envOr("DB_PASSWORD", "lyc061215"),
		DBName:     envOr("DB_NAME", "gooj"),
		JWTSecret:  envOr("JWT_SECRET", "gooj-secret-key-2024"),
		ServerPort: envOr("SERVER_PORT", ":8080"),
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func loadEnvFile() {
	data, err := os.ReadFile(".env")
	if err != nil {
		return
	}
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		if os.Getenv(key) == "" {
			os.Setenv(key, val)
		}
	}
}
