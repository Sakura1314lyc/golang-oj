package middleware

import (
	"net/http"
	"sync"
	"time"
)

type RateLimiter struct {
	mu       sync.Mutex
	clients  map[string]*clientInfo
	rate     int
	interval time.Duration
}

type clientInfo struct {
	count    int
	lastSeen time.Time
}

func NewRateLimiter(rate int, interval time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients:  make(map[string]*clientInfo),
		rate:     rate,
		interval: interval,
	}
	go rl.cleanup()
	return rl
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(10 * time.Minute)
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for ip, info := range rl.clients {
			if now.Sub(info.lastSeen) > rl.interval*2 {
				delete(rl.clients, ip)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *RateLimiter) Limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr
		rl.mu.Lock()
		info, exists := rl.clients[ip]
		if !exists {
			info = &clientInfo{}
			rl.clients[ip] = info
		}

		now := time.Now()
		if now.Sub(info.lastSeen) > rl.interval {
			info.count = 0
		}

		info.count++
		info.lastSeen = now

		if info.count > rl.rate {
			rl.mu.Unlock()
			w.Header().Set("Retry-After", "60")
			http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
			return
		}
		rl.mu.Unlock()
		next.ServeHTTP(w, r)
	})
}
