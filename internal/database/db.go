package database

import (
	"log"
	"os"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// --- MODELS ---

type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Username string `gorm:"uniqueIndex" json:"username"`
	Password string `json:"-"` 
}

type FileMetadata struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt int64          `json:"created_at"`
	UpdatedAt int64          `json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Name     string `json:"name"`
	S3Key    string `json:"-"`
	Size     int64  `json:"size"`
	MimeType string `json:"mime_type"`
	
	UserID   *uint  `gorm:"index" json:"user_id,omitempty"` 
	IsPublic bool   `gorm:"default:false" json:"is_public"` 
	Status string `json:"status" gorm:"default:'pending'"`

	IsFolder bool   `gorm:"default:false" json:"is_folder"`
	ParentID *uint  `gorm:"index" json:"parent_id"`
	Depth    int    `json:"depth"`
	
	IsStarred bool `gorm:"default:false" json:"is_starred"`
	IsTrash   bool `gorm:"default:false" json:"is_trash"`
}

var DB *gorm.DB

// --- INIT FUNCTION ---
func Connect() {
	var err error
	dsn := os.Getenv("DATABASE_URL")

	if dsn != "" {
		// POSTGRES MODE
		log.Println("🐘 Found DATABASE_URL, connecting to Postgres...")
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	} else {
		// SQLITE MODE (Now using Pure Go driver!)
		log.Println("📂 No DATABASE_URL found, using SQLite (main.db)...")
		DB, err = gorm.Open(sqlite.Open("main.db"), &gorm.Config{})
	}

	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	err = DB.AutoMigrate(&User{}, &FileMetadata{})
	if err != nil {
		log.Fatal("❌ Database migration failed:", err)
	}

	log.Println("✅ Database connected and migrated")
}

// --- BACKGROUND TASKS ---

// StartCleanupTask runs forever in the background
func StartCleanupTask() {
    ticker := time.NewTicker(24 * time.Hour)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            log.Println("🧹 Running Daily Cleanup Task...")
            
            // Calculate 24 hours ago (Unix Timestamp)
            yesterday := time.Now().Add(-24 * time.Hour).Unix()

            // Delete rows where Status='pending' AND CreatedAt < yesterday
            result := DB.Where("status = ? AND created_at < ?", "pending", yesterday).Delete(&FileMetadata{})
            
            if result.Error != nil {
                log.Printf("❌ Cleanup Failed: %v\n", result.Error)
            } else {
                log.Printf("✅ Cleanup Complete. Removed %d zombie records.\n", result.RowsAffected)
            }
        }
    }
}