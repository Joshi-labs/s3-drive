package database

import (
	"errors"
	"fmt"
	"sync"
	"time"
)

// --- SIMPLE IN-MEMORY CACHE ---
// Key: "parentID_userID" -> Value: List of Files
var (
	cache      = make(map[string][]FileMetadata)
	cacheMutex sync.RWMutex
)

func InvalidateCache(parentID *uint, userID uint) {
	cacheMutex.Lock()
	defer cacheMutex.Unlock()
	
	pID := "root"
	if parentID != nil {
		pID = fmt.Sprintf("%d", *parentID)
	}

	// 1. Clear the specific user's cache (Standard behavior)
	key := fmt.Sprintf("%s_%d", pID, userID)
	delete(cache, key)

	// 2. THE FIX: If this was a Guest action (UserID 0), or if it affected a Public folder,
	// we must ALSO clear the Admin's cache for this folder.
	// Since we don't track "which admin", we can just clear the specific admin ID (1) 
	// or loop through all keys starting with pID.
	
	// Simple Fix: Always clear Admin (ID 1) cache for this folder too.
	adminKey := fmt.Sprintf("%s_%d", pID, 1)
	delete(cache, adminKey)
	
	// Bonus: If Admin did something public, clear Guest (ID 0) too.
	guestKey := fmt.Sprintf("%s_%d", pID, 0)
	delete(cache, guestKey)
}

// --- FOLDER OPERATIONS ---

func CreateFolder(name string, parentID *uint, userID uint, isPublic bool) (*FileMetadata, error) {
	// 1. Calculate Depth & Validate Parent
	currentDepth := 0
	
	if parentID != nil {
		var parentFolder FileMetadata
		if err := DB.First(&parentFolder, *parentID).Error; err != nil {
			return nil, errors.New("parent folder not found")
		}
		if !parentFolder.IsFolder {
			return nil, errors.New("parent is not a folder")
		}
		if parentFolder.Depth >= 10 {
			return nil, errors.New("max folder depth (10) reached")
		}
		currentDepth = parentFolder.Depth + 1
	}

	// 2. Handle Ownership (Guest = nil UserID)
	var ownerPtr *uint
	if userID != 0 {
		ownerPtr = &userID
	}

	// 3. Create the Folder Record
	folder := FileMetadata{
		Name:      name,
		IsFolder:  true,
		ParentID:  parentID,
		Depth:     currentDepth,
		Status:    "completed",
		UserID:    ownerPtr, // nil for guests
		IsPublic:  isPublic, // <--- DYNAMIC NOW
		CreatedAt: time.Now().Unix(),
	}

	if err := DB.Create(&folder).Error; err != nil {
		return nil, err
	}

	// 4. Clear Cache
	InvalidateCache(parentID, userID)
	
	return &folder, nil
}

func GetFolderContent(parentID *uint, userID uint, role string) ([]FileMetadata, error) {
	// 1. GENERATE CACHE KEY
	pID := "root"
	if parentID != nil { pID = fmt.Sprintf("%d", *parentID) }
	cacheKey := fmt.Sprintf("%s_%d", pID, userID)

	// 2. CHECK CACHE (Read Lock)
	cacheMutex.RLock()
	if files, found := cache[cacheKey]; found {
		cacheMutex.RUnlock()
		return files, nil // 🚀 FAST RETURN
	}
	cacheMutex.RUnlock()

	// 3. DATABASE QUERY (Cache Miss)
	var files []FileMetadata
	query := DB.Where("status = ?", "completed")

	// Parent Filter
	if parentID == nil {
		query = query.Where("parent_id IS NULL")
	} else {
		query = query.Where("parent_id = ?", *parentID)
	}

	// Permission Filter
	if role == "admin" {
		query = query.Where("user_id = ? OR is_public = ?", userID, true)
	} else {
		// Guests can only see Public stuff
		query = query.Where("is_public = ?", true)
	}

	err := query.Order("is_folder desc, name asc").Find(&files).Error
	
	// 4. SAVE TO CACHE (Write Lock)
	if err == nil {
		cacheMutex.Lock()
		cache[cacheKey] = files
		cacheMutex.Unlock()
	}

	return files, err
}