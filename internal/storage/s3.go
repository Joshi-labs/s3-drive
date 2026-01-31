package storage

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

var (
	Client        *s3.Client
	PresignClient *s3.PresignClient
	BucketName    string
)

// --- CONNECT ---
func Connect() {
	BucketName = os.Getenv("S3_BUCKET_NAME")
	if BucketName == "" {
		log.Fatal("❌ S3_BUCKET_NAME is not set in .env")
	}

	// Load AWS Creds from Environment (.env or System)
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("AWS_REGION")),
	)
	if err != nil {
		log.Fatalf("❌ Unable to load SDK config, %v", err)
	}

	Client = s3.NewFromConfig(cfg)
	PresignClient = s3.NewPresignClient(Client)
	log.Println("✅ Connected to AWS S3")
}

// --- GENERATE UPLOAD URL (WITH HARD LIMIT) ---
// sizeLimit: bytes (e.g., 1024*1024*1024 for 1GB)
func GeneratePutURL(key string, sizeLimit int64) (string, error) {
	req, err := PresignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:        aws.String(BucketName),
		Key:           aws.String(key),
		// 🔒 SECURITY: This locks the upload to this exact size.
		// If user tries to upload more, S3 rejects the signature or cuts the stream.
		ContentLength: aws.Int64(sizeLimit), 
	}, s3.WithPresignExpires(15*time.Minute))

	if err != nil {
		return "", err
	}
	return req.URL, nil
}

// --- GENERATE DOWNLOAD URL (WITH PRETTY NAME) ---
func GenerateGetURL(key string, downloadName string) (string, error) {
	// Forces browser to save as "vacation.jpg" instead of "uuid-hash..."
	disposition := fmt.Sprintf("attachment; filename=\"%s\"", downloadName)

	req, err := PresignClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
		Bucket:                     aws.String(BucketName),
		Key:                        aws.String(key),
		ResponseContentDisposition: aws.String(disposition),
	}, s3.WithPresignExpires(15*time.Minute))

	if err != nil {
		return "", err
	}
	return req.URL, nil
}

// --- DELETE ---
func DeleteFile(key string) error {
	_, err := Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(BucketName),
		Key:    aws.String(key),
	})
	return err
}

// --- BATCH DELETE ---
func DeleteMultiple(keys []string) error {
	if len(keys) == 0 { return nil }

	// S3 requires a specific struct for batch deletes
	var objectIds []types.ObjectIdentifier
	for _, k := range keys {
		objectIds = append(objectIds, types.ObjectIdentifier{Key: aws.String(k)})
	}

	// We can delete max 1000 at a time. For this demo, assuming <1000.
	// In prod, you would chunk this loop.
	_, err := Client.DeleteObjects(context.TODO(), &s3.DeleteObjectsInput{
		Bucket: aws.String(BucketName),
		Delete: &types.Delete{Objects: objectIds},
	})

	return err
}