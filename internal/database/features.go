package database

import "fmt"

// --- 1. SEARCH ---
func SearchFiles(query string, page int, userID uint, role string) ([]FileMetadata, error) {
	var files []FileMetadata
	offset := (page - 1) * 50

	db := DB.Where("is_trash = ?", false). // Don't search inside trash
		Where("name LIKE ?", "%"+query+"%") // Partial match

	if role != "admin" {
		// Guest: Public only. User: Own files only.
		if userID == 0 {
			db = db.Where("is_public = ?", true)
		} else {
			db = db.Where("user_id = ?", userID)
		}
	} else {
		// Admin sees everything (or restrict to own? assuming own + public for now)
		db = db.Where("user_id = ? OR is_public = ?", userID, true)
	}

	// Order by relevance (folder matches first, then files)
	err := db.Order("is_folder desc, name asc").
		Limit(50).Offset(offset).
		Find(&files).Error

	return files, err
}

// --- 2. RECENTS ---
func GetRecents(page int, userID uint, role string) ([]FileMetadata, error) {
	var files []FileMetadata
	offset := (page - 1) * 50

	db := DB.Where("is_trash = ?", false).Where("is_folder = ?", false) // Usually recents are files, not folders

	if role == "guest" {
		db = db.Where("is_public = ?", true)
	} else if role == "admin" {
		db = db.Where("user_id = ? OR is_public = ?", userID, true)
	} else {
		db = db.Where("user_id = ?", userID)
	}

	err := db.Order("created_at desc"). // Newest first
		Limit(50).Offset(offset).
		Find(&files).Error

	return files, err
}

// --- 3. STARRED ---
func GetStarred(page int, userID uint, role string) ([]FileMetadata, error) {
	var files []FileMetadata
	offset := (page - 1) * 50

	db := DB.Where("is_trash = ?", false).Where("is_starred = ?", true)

	if role == "guest" {
		db = db.Where("is_public = ?", true)
	} else {
		db = db.Where("user_id = ?", userID)
	}

	err := db.Order("created_at desc").
		Limit(50).Offset(offset).
		Find(&files).Error

	return files, err
}

// Toggle Star Status
func ToggleStar(id uint, userID uint) (bool, error) {
	var file FileMetadata
	if err := DB.First(&file, id).Error; err != nil {
		return false, err
	}

	// Security: Can only star your own files (or public ones?)
	// Let's say Admin can star anything, others only their own.
	if file.UserID != nil && *file.UserID != userID && userID != 1 {
		return false, fmt.Errorf("permission denied")
	}

	newState := !file.IsStarred
	err := DB.Model(&file).Update("is_starred", newState).Error
	return newState, err
}

// --- 4. TRASH (SOFT DELETE) ---
func GetTrash(page int, userID uint) ([]FileMetadata, error) {
	var files []FileMetadata
	offset := (page - 1) * 50

	// Everyone sees their own trash. 
	// Admin sees all? Let's stick to "Own Trash" for safety.
	db := DB.Where("is_trash = ?", true)
	
	if userID != 0 {
		db = db.Where("user_id = ?", userID)
	} else {
		// Guest trash? (If we allow guests to soft delete public files, that's chaotic)
		// Let's assume Guests can't use Trash for now, or only for sessions.
		// For now: Guests see nothing in trash.
		return []FileMetadata{}, nil
	}

	err := db.Order("updated_at desc"). // Recently trashed first
		Limit(50).Offset(offset).
		Find(&files).Error

	return files, err
}

func SoftDelete(id uint, userID uint) error {
	// Move to Trash
	return DB.Model(&FileMetadata{}).Where("id = ? AND user_id = ?", id, userID).
		Update("is_trash", true).Error
}

func RestoreFromTrash(id uint, userID uint) error {
	// Move out of Trash
	return DB.Model(&FileMetadata{}).Where("id = ? AND user_id = ?", id, userID).
		Update("is_trash", false).Error
}