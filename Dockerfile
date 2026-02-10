# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build Go Backend
FROM golang:1.23-alpine AS backend-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Bring in the dist folder for go:embed
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Build as a static Linux binary (No .exe)
RUN CGO_ENABLED=0 GOOS=linux go build -o s3-drive main.go

# Stage 3: Minimal Runtime
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=backend-builder /app/s3-drive .
# If you use a .env file, you can copy it, 
# but it's better to use K8s ConfigMaps/Secrets
EXPOSE 8080
CMD ["./s3-drive"]