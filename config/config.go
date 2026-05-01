package config

import "os"

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
