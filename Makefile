# Variables
BINARY_NAME=s3-drive-app.exe
FRONTEND_DIR=frontend

.PHONY: all build-frontend build-backend clean install run

# Default: Build everything in the correct order
all: install build-frontend build-backend

# 1. Install dependencies
install:
	@echo ">> Installing dependencies..."
	go mod tidy
	cd $(FRONTEND_DIR) && npm install

# 2. Build Frontend (Must happen BEFORE backend for embedding)
build-frontend:
	@echo ">> Building React frontend..."
	cd $(FRONTEND_DIR) && npm run build

# 3. Build Backend
build-backend:
	@echo ">> Compiling Go binary with embedded assets..."
	go build -o $(BINARY_NAME) main.go

# 4. Clean artifacts
clean:
	@echo ">> Cleaning up..."
	if exist $(BINARY_NAME) del $(BINARY_NAME)
	if exist $(FRONTEND_DIR)\dist rmdir /s /q $(FRONTEND_DIR)\dist