package main

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"

	// IMPORT YOUR LOCAL PACKAGES
	"s3-drive/internal/database"
	"s3-drive/internal/storage"
	"s3-drive/internal/middleware"
)

//go:embed frontend/dist/*
//var frontend embed.FS
var frontendContent embed.FS

var jwtSecret = []byte("REPLACE_THIS_WITH_RANDOM_STRING") // Use ENV in prod


func enableCORS(next http.Handler) http.Handler {
    
    allowedOrigins := map[string]bool{
        "https://vpjoshi.in":          true,
        "https://s3-drive.vpjoshi.in": true,
        "https://api.vpjoshi.in":      true,
    }

    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        origin := r.Header.Get("Origin")

        if allowedOrigins[origin] {
            w.Header().Set("Access-Control-Allow-Origin", origin)
        }

        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        // Handle Preflight
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        next.ServeHTTP(w, r)
    })
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file:", err)
	}

	// 1. Initialize Systems
	database.Connect() // Connects to SQLite or Postgres
	storage.Connect()  // Connects to S3

	go database.StartCleanupTask()
	go middleware.StartCleanup()

	// 2. Create Default Admin (if none exists)
	ensureAdminExists()

	// 3. Setup Routes
	mux := http.NewServeMux()

	// --- PUBLIC AUTH ---
	mux.HandleFunc("/api/login", handleLogin)             // For Admin
	mux.HandleFunc("/api/guest-login", middleware.RateLimit(handleGuestLogin)) // For Guests
	mux.HandleFunc("/api/admin/update-password", authMiddleware(handleUpdateAdminPassword))

	// --- PROTECTED ROUTES (Middleware Required) ---
    mux.HandleFunc("/api/upload-init", middleware.RateLimit(authMiddleware(handleUploadInit)))
	mux.HandleFunc("/api/upload-finalize", middleware.RateLimit(authMiddleware(handleUploadFinalize)))
	mux.HandleFunc("/api/files", middleware.RateLimit(authMiddleware(handleListFiles)))
	mux.HandleFunc("/api/download", middleware.RateLimit(authMiddleware(handleDownload)))
	mux.HandleFunc("/api/folders", middleware.RateLimit(authMiddleware(handleCreateFolder)))
	mux.HandleFunc("/api/delete", middleware.RateLimit(authMiddleware(handleDelete)))

	mux.HandleFunc("/api/search", middleware.RateLimit(authMiddleware(handleSearch))) //searches within user's accessible files
	mux.HandleFunc("/api/recents", middleware.RateLimit(authMiddleware(handleRecents))) // shows recently accessed files (by last modified or accessed timestamp)

	mux.HandleFunc("/api/starred", middleware.RateLimit(authMiddleware(handleStarred))) // lists all starred files for the user
	mux.HandleFunc("/api/star-toggle", middleware.RateLimit(authMiddleware(handleStarToggle))) // toggles star state for a file (star if unstarred, unstar if starred)

	mux.HandleFunc("/api/trash", middleware.RateLimit(authMiddleware(handleTrashList))) // lists all files in the user's trash (soft-deleted items)
	mux.HandleFunc("/api/soft-delete", middleware.RateLimit(authMiddleware(handleSoftDelete))) // moves a file to trash (soft delete, can be restored)
	mux.HandleFunc("/api/restore", middleware.RateLimit(authMiddleware(handleRestore))) //

	// --- STATIC FILES ---
	//distFS, _ := fs.Sub(frontend, "frontend/dist")
	//fileServer := http.FileServer(http.FS(distFS))

	distFS, err := fs.Sub(frontendContent, "frontend/dist")
    if err != nil {
        log.Fatal("Failed to sub-tree frontendContent:", err)
    }

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Allow API routes to be handled by their own handlers
        // (This check is a safety net, but usually mux handles this automatically)
        if strings.HasPrefix(r.URL.Path, "/api/") {
            http.NotFound(w, r)
            return
        }

        // Clean the path to get the actual filename
        path := strings.TrimPrefix(r.URL.Path, "/")
        
        // Try to open the file in the embedded dist folder
        f, err := distFS.Open(path)
        if err != nil {
            // FILE NOT FOUND: This is likely a React route (e.g., /dashboard)
            // Serve index.html and let React Router handle the URL
            indexFile, err := distFS.Open("index.html")
            if err != nil {
                http.Error(w, "Index file not found", http.StatusNotFound)
                return
            }
            defer indexFile.Close()
            
            // Critical: Use "index.html" as the name so MIME type is set to text/html
            http.ServeContent(w, r, "index.html", time.Now(), indexFile.(io.ReadSeeker))
            return
        }
        defer f.Close()

        // FILE FOUND: Serve the actual file (main.js, logo.png, etc.)
        // Get FileInfo to provide the correct modification time and detect MIME type
        fi, _ := f.Stat()
        http.ServeContent(w, r, path, fi.ModTime(), f.(io.ReadSeeker))
    })

	log.Println("Server running on 0.0.0.0:80")
	log.Fatal(http.ListenAndServe("0.0.0.0:80", enableCORS(mux)))
}

// --- HANDLERS ---
// so on
// --- NEW FEATURE HANDLERS ---

func handleSearch(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	role := r.Context().Value("role").(string)
	
	query := r.URL.Query().Get("q")
	page := 1 // Parse "page" from query if needed
	
	files, err := database.SearchFiles(query, page, userID, role)
	if err != nil { http.Error(w, err.Error(), 500); return }
	
	json.NewEncoder(w).Encode(files)
}

func handleRecents(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	role := r.Context().Value("role").(string)
	
	files, err := database.GetRecents(1, userID, role) // Page 1 default
	if err != nil { http.Error(w, err.Error(), 500); return }
	
	json.NewEncoder(w).Encode(files)
}

func handleStarred(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	role := r.Context().Value("role").(string)
	
	files, err := database.GetStarred(1, userID, role)
	if err != nil { http.Error(w, err.Error(), 500); return }
	
	json.NewEncoder(w).Encode(files)
}

func handleStarToggle(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	var req struct { ID uint `json:"id"` }
	json.NewDecoder(r.Body).Decode(&req)

	newState, err := database.ToggleStar(req.ID, userID)
	if err != nil { http.Error(w, err.Error(), 400); return }

	json.NewEncoder(w).Encode(map[string]bool{"is_starred": newState})
}

func handleTrashList(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	files, err := database.GetTrash(1, userID)
	if err != nil { http.Error(w, err.Error(), 500); return }
	json.NewEncoder(w).Encode(files)
}

func handleSoftDelete(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	var req struct { ID uint `json:"id"` }
	json.NewDecoder(r.Body).Decode(&req)

	// Note: You might want a recursive soft delete for folders here later
	err := database.SoftDelete(req.ID, userID)
	if err != nil { http.Error(w, err.Error(), 400); return }
	
	// Invalidate cache since item moved
	database.InvalidateCache(nil, userID) // Lazy invalidation (root)

	json.NewEncoder(w).Encode(map[string]string{"status": "trashed"})
}

func handleRestore(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	var req struct { ID uint `json:"id"` }
	json.NewDecoder(r.Body).Decode(&req)

	err := database.RestoreFromTrash(req.ID, userID)
	if err != nil { http.Error(w, err.Error(), 400); return }
	
	database.InvalidateCache(nil, userID)

	json.NewEncoder(w).Encode(map[string]string{"status": "restored"})
}

func handleDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != "DELETE" {
		http.Error(w, "DELETE only", 405)
		return
	}

	userID := r.Context().Value("userID").(uint)
	role := r.Context().Value("role").(string)

	// Get ID from Query
	rawID := r.URL.Query().Get("id")
	var id uint
	fmt.Sscanf(rawID, "%d", &id)

	// 1. Calculate what needs to be deleted
	candidates, err := database.GetDeletionCandidates(id, userID, role)
	if err != nil {
		http.Error(w, err.Error(), 403)
		return
	}

	// 2. Delete from S3 (Batch)
	if len(candidates.S3Keys) > 0 {
		// Ignore S3 errors (orphaned files are better than DB inconsistency)
		_ = storage.DeleteMultiple(candidates.S3Keys)
	}

	// 3. Delete from DB
	database.BatchDelete(candidates.DBIds)

	// 4. FIX: Invalidate Cache!
	// This forces the file list to refresh on the next request
	database.InvalidateCache(candidates.RootParentID, userID)

	json.NewEncoder(w).Encode(map[string]string{
		"status": "deleted",
		"count":  fmt.Sprintf("%d items removed", len(candidates.DBIds)),
	})
}
func handleCreateFolder(w http.ResponseWriter, r *http.Request) {
    if r.Method != "POST" { http.Error(w, "POST only", 405); return }

    userID := r.Context().Value("userID").(uint)
    role := r.Context().Value("role").(string) // <--- GET ROLE
    
    var req struct {
        Name     string `json:"name"`
        ParentID *uint  `json:"parentId"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid JSON", 400); return
    }

    // Determine Visibility
    // Admin folders = Private (unless specified otherwise, but default private)
    // Guest folders = Public (Always, so they can see them)
    isPublic := (role == "guest")

    // Pass isPublic to the DB function
    folder, err := database.CreateFolder(req.Name, req.ParentID, userID, isPublic)
    if err != nil {
        http.Error(w, err.Error(), 400); return
    }

    json.NewEncoder(w).Encode(folder)
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	var req struct { Username, Password string }
	json.NewDecoder(r.Body).Decode(&req)

	var user database.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		http.Error(w, "Invalid credentials", 401); return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid credentials", 401); return
	}

	sendToken(w, user.ID, "admin")
}

func handleGuestLogin(w http.ResponseWriter, r *http.Request) {
	// Simple Guest Login. In future, check IP Limits here.
	// We use ID=0 to signify Guest
	sendToken(w, 0, "guest")
}

func handleUploadInit(w http.ResponseWriter, r *http.Request) {
	// Extract info from context (set by middleware)
	userID := r.Context().Value("userID").(uint)
	role := r.Context().Value("role").(string)

	var req struct { Filename string; Size int64; ParentID *uint `json:"parentId"` }
	json.NewDecoder(r.Body).Decode(&req)

	// 🔒 ENFORCE LIMITS
	const GB = 1024 * 1024 * 1024
	var limit int64
	if role == "guest" {
		limit = 1 * GB // 1GB for Guests
		if req.Size > limit {
			http.Error(w, "Guest limit exceeded (Max 1GB)", 403); return
		}
	} else {
		limit = 5 * GB // 5GB for Admins (S3 single PUT limit)
	}

	// Generate UUID Key
	uniqueKey := fmt.Sprintf("uploads/%s", uuid.New().String())

	// Save to DB (Pending State)
	isPublic := (role == "guest") // Guests uploads are public by default? Or private? 
	// Let's say Guest uploads are PUBLIC so they can share them.
	
	var userPtr *uint
	if userID != 0 { userPtr = &userID }

	newFile := database.FileMetadata{
		Name: req.Filename, S3Key: uniqueKey, Size: req.Size, 
		UserID: userPtr, IsPublic: isPublic,
		ParentID: req.ParentID,
		Status: "pending",
	}
	database.DB.Create(&newFile)
	database.InvalidateCache(req.ParentID, userID)

	// Generate S3 URL with HARD LIMIT
	url, err := storage.GeneratePutURL(uniqueKey, req.Size) // MUST match exactly
	if err != nil {
		http.Error(w, err.Error(), 500); return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"uploadUrl": url, "fileId": newFile.ID,
	})
}

func handleUploadFinalize(w http.ResponseWriter, r *http.Request) {
    var req struct { FileID uint `json:"fileId"` }
    json.NewDecoder(r.Body).Decode(&req)

    // 1. Get UserID to ensure they own the file (security check)
    userID := r.Context().Value("userID").(uint)
    role := r.Context().Value("role").(string)

    //var file database.FileMetadata
    // Admin can finalize anything? Or just their own? Let's stay safe:
    // User can only finalize their own file.
    query := database.DB.Model(&database.FileMetadata{}).Where("id = ?", req.FileID)
    
    if role != "admin" {
         // If guest (ID 0) or normal user, verify ownership/public logic
         if userID == 0 {
             // Guest: must match public files that are pending? 
             // Ideally we need a session ID for guests to fully secure this, 
             // but for now, checking ID exists is okay for Test 2.
         } else {
             query = query.Where("user_id = ?", userID)
         }
    }

    // 2. Flip the switch
    result := query.Update("status", "completed")
    
    if result.Error != nil || result.RowsAffected == 0 {
        http.Error(w, "File not found or access denied", 404)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func handleListFiles(w http.ResponseWriter, r *http.Request) {
    userID := r.Context().Value("userID").(uint)
    role := r.Context().Value("role").(string)
    
    // Parse Parent ID from Query (e.g., ?parentId=5)
    // If empty or "null", it means Root.
    rawParentID := r.URL.Query().Get("parentId")
    
    var parentID *uint
    if rawParentID != "" && rawParentID != "null" {
        // Convert string to uint... (simplified for brevity)
        var pID uint
        fmt.Sscanf(rawParentID, "%d", &pID)
        parentID = &pID
    }

    files, err := database.GetFolderContent(parentID, userID, role)
    if err != nil {
        http.Error(w, err.Error(), 500); return
    }
    
    json.NewEncoder(w).Encode(files)
}

func handleDownload(w http.ResponseWriter, r *http.Request) {
	fileID := r.URL.Query().Get("id")
	var file database.FileMetadata
	if err := database.DB.First(&file, fileID).Error; err != nil {
		http.Error(w, "Not found", 404); return
	}

	// Generate URL
	url, err := storage.GenerateGetURL(file.S3Key, file.Name)
	if err != nil {
		http.Error(w, err.Error(), 500); return
	}

	json.NewEncoder(w).Encode(map[string]string{"downloadUrl": url})
}

// --- HELPERS ---

func sendToken(w http.ResponseWriter, id uint, role string) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": id,
		"role": role,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString(jwtSecret)
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

func ensureAdminExists() {
	var count int64
	database.DB.Model(&database.User{}).Count(&count)
	if count == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), 14)
		database.DB.Create(&database.User{Username: "admin", Password: string(hash)})
		log.Println("⚠️ Created default user: admin / admin123")
	}
}

// --- MIDDLEWARE ---
func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Auth Token", 401); return
		}
		
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid Token", 401); return
		}

		claims := token.Claims.(jwt.MapClaims)
		userID := uint(claims["sub"].(float64))
		role := claims["role"].(string)

		ctx := context.WithValue(r.Context(), "userID", userID)
		ctx = context.WithValue(ctx, "role", role)
		next(w, r.WithContext(ctx))
	}
}

func handleUpdateAdminPassword(w http.ResponseWriter, r *http.Request) {
    if r.Method != "POST" {
        http.Error(w, "POST only", 405)
        return
    }

    userID := r.Context().Value("userID").(uint)
    role := r.Context().Value("role").(string)

    // Only allow admins to use this specific route
    if role != "admin" {
        http.Error(w, "Unauthorized: Admin access required", 403)
        return
    }

    var req struct {
        OldPassword string `json:"oldPassword"`
        NewPassword string `json:"newPassword"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid JSON", 400)
        return
    }

    // 1. Fetch the user from the DB
    var user database.User
    if err := database.DB.First(&user, userID).Error; err != nil {
        http.Error(w, "User not found", 404)
        return
    }

    // 2. Verify the OLD password
    err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword))
    if err != nil {
        http.Error(w, "Current password incorrect", 401)
        return
    }

    // 3. Hash the NEW password
    newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 14)
    if err != nil {
        http.Error(w, "Failed to process new password", 500)
        return
    }

    // 4. Update in Database
    if err := database.DB.Model(&user).Update("password", string(newHash)).Error; err != nil {
        http.Error(w, "Database error", 500)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{"status": "password updated successfully"})
}