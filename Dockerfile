# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build Go Backend
# Updated to match your exact version
FROM golang:1.25.6-alpine AS backend-builder
WORKDIR /app

# Install git as a precaution for external modules
RUN apk add --no-cache git

# 1. Copy go.mod and go.sum
COPY go.mod go.sum ./

# 2. Copy the internal folder so local dependencies are available
# before running 'go mod download'
COPY internal/ ./internal/

# 3. Download dependencies
RUN go mod download

# 4. Copy the rest of the source
COPY . .

# 5. Bring in the built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# 6. Build the static Linux binary
RUN CGO_ENABLED=0 GOOS=linux go build -o s3-drive main.go

# Stage 3: Create Minimal Runtime Image
FROM gcr.io/distroless/base-debian12
WORKDIR /app

COPY --from=backend-builder /app/s3-drive /app/s3-drive

EXPOSE 8080
CMD ["/app/s3-drive"]