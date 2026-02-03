package main

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"
)

func saveFileToDir(file multipart.File, header *multipart.FileHeader, saveDir string) (string, error) {
	logMessage(DEBUG, fmt.Sprintf("saveFileToDir: Starting file save process for: %s", header.Filename))
	// Generate unique filename
	timestamp := time.Now().UnixNano()
	filename := fmt.Sprintf("%d_%s", timestamp, header.Filename)

	// Save path (absolute)
	absolutePath := filepath.Join(saveDir, filename)
	logMessage(DEBUG, fmt.Sprintf("saveFileToDir: Saving to absolute path: %s", absolutePath))

	// Create destination file
	dst, err := os.Create(absolutePath)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("saveFileToDir: Failed to create file: %v", err))
		return "", err
	}
	defer dst.Close()

	// Copy contents to file
	if _, err := io.Copy(dst, file); err != nil {
		logMessage(ERROR, fmt.Sprintf("saveFileToDir: Failed to copy file content: %v", err))
		return "", err
	}

	// Return correct relative path with "./" prefix
	relativePath := "./AddRooms/" + filename
	logMessage(INFO, fmt.Sprintf("saveFileToDir: File saved successfully. Relative path: %s", relativePath))
	return relativePath, nil
}
