package database

import (
	"errors"
)

// DeleteResult holds the lists of things we need to destroy
type DeleteResult struct {
	S3Keys       []string // Files to remove from S3
	DBIds        []uint   // IDs to remove from DB
	RootParentID *uint    // <--- NEW: Tells us which cache to clear
}

func GetDeletionCandidates(targetID uint, userID uint, role string) (*DeleteResult, error) {
	var s3Keys []string
	var dbIds []uint

	// 1. Get the Target Item
	var target FileMetadata
	if err := DB.First(&target, targetID).Error; err != nil {
		return nil, errors.New("item not found")
	}

	// 🛑 SECURITY CHECK (The Root Item)
	if !canDelete(target, userID, role) {
		return nil, errors.New("permission denied: cannot delete admin files")
	}

	// 2. BFS Traversal (Find all descendants)
	queue := []FileMetadata{target}

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:] // Pop

		// Add to deletion list
		dbIds = append(dbIds, current.ID)
		if !current.IsFolder {
			s3Keys = append(s3Keys, current.S3Key)
		}

		// If it's a folder, find children
		if current.IsFolder {
			var children []FileMetadata
			DB.Where("parent_id = ?", current.ID).Find(&children)

			for _, child := range children {
				// 🛑 SECURITY CHECK (Recursive)
				if !canDelete(child, userID, role) {
					return nil, errors.New("aborting: folder contains protected admin files")
				}
				queue = append(queue, child)
			}
		}
	}

	return &DeleteResult{
		S3Keys:       s3Keys,
		DBIds:        dbIds,
		RootParentID: target.ParentID, // <--- Capture the parent ID
	}, nil
}

// Helper: Defines the Rules
func canDelete(file FileMetadata, userID uint, role string) bool {
	// Rule 1: Admin can delete EVERYTHING
	if role == "admin" {
		return true
	}

	// Rule 2: Guests can ONLY delete Public items
	if role == "guest" {
		return file.IsPublic
	}

	// Rule 3: Standard Users can only delete their own
	if file.UserID != nil && *file.UserID == userID {
		return true
	}

	return false
}

// Actual DB Deletion
// Actual DB Deletion
func BatchDelete(ids []uint) error {
    // Unscoped() tells GORM: "Ignore the DeletedAt column and actually remove the row"
    return DB.Unscoped().Delete(&FileMetadata{}, ids).Error
}