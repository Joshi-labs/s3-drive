package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Define the limit rules
const (
	GuestLimit    = 100             // Max requests
	GuestWindow   = 1 * time.Hour   // Per this duration
)

type ClientRate struct {
	Count     int
	ResetTime time.Time
}

var (
	// Map to store IP -> Rate Info
	clients = make(map[string]*ClientRate)
	mu      sync.Mutex
)

// RateLimitMiddleware checks usage for GUESTS only
// It requires the "role" to be in the context, so put this INSIDE AuthMiddleware or verify token manually if Auth isn't strictly required yet.
// However, since we apply it to routes that might NOT be authed yet (like guest login), 
// we generally use IP address.
func RateLimit(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		
		// 1. Identify the User (Admin vs Guest)
		// We try to peek at the token to see if it's an admin.
		// If no token or invalid token, we treat them as a "Potential Guest" and limit by IP.
		isAdmin := false
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" {
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			// We parse insecurely just to check the role claim quickly
			token, _, _ := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
			if token != nil {
				if claims, ok := token.Claims.(jwt.MapClaims); ok {
					if role, ok := claims["role"].(string); ok && role == "admin" {
						isAdmin = true
					}
				}
			}
		}

		// 2. Skip Limits for Admin
		if isAdmin {
			next(w, r)
			return
		}

		// 3. Enforce Limit for Guests (by IP)
		ip := r.RemoteAddr
		// If behind a proxy (like Nginx/Cloudflare), use X-Forwarded-For
		if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
			ip = strings.Split(fwd, ",")[0]
		}

		mu.Lock()
		defer mu.Unlock()

		client, exists := clients[ip]
		
		// Initialize if new or if window expired
		if !exists || time.Now().After(client.ResetTime) {
			clients[ip] = &ClientRate{
				Count:     1,
				ResetTime: time.Now().Add(GuestWindow),
			}
			next(w, r)
			return
		}

		// Check Limit
		if client.Count >= GuestLimit {
			http.Error(w, "429 Too Many Requests (Guest Limit: 100/hr)", http.StatusTooManyRequests)
			return
		}

		// Increment
		client.Count++
		next(w, r)
	}
}

// ... (Previous code)

// --- MEMORY CLEANUP ---
// StartCleanup runs in the background to remove old IPs from the map.
// Otherwise, the map grows forever and crashes the server.
func StartCleanup() {
	// Run this check every 5 minutes
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		<-ticker.C
		mu.Lock()
		
		now := time.Now()
		itemsRemoved := 0
		
		for ip, client := range clients {
			// If the window (1 hour) has passed, this data is useless.
			// Delete it to free memory.
			if now.After(client.ResetTime) {
				delete(clients, ip)
				itemsRemoved++
			}
		}
		
		mu.Unlock()
		
		if itemsRemoved > 0 {
			// Optional: Log it so you know it's working
			// log.Printf("🧹 Rate Limit Cleanup: Forgot %d old IPs\n", itemsRemoved)
		}
	}
}