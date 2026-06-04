package main

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Normalize key to the desired length (16, 24, or 32 bytes for AES)
func normalizeKey(key []byte, desiredLength int) []byte {
	if len(key) < desiredLength {
		// Pad the key with zeroes if it's too short
		paddedKey := make([]byte, desiredLength)
		copy(paddedKey, key)
		return paddedKey
	}
	// Truncate the key if it's too long
	return key[:desiredLength]
}

// 32-byte key for AES-256 encryption
var encryptionKey = normalizeKey([]byte("a-too-long-or-short-key-that-is-40-bytes"), 32)

// Encrypt encrypts the plaintext string
func Encrypt(plaintext string) (string, error) {
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	// Generate a new IV
	iv := make([]byte, aes.BlockSize)
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	// Encrypt the plaintext
	ciphertext := make([]byte, len(plaintext))
	stream := cipher.NewCFBEncrypter(block, iv)
	stream.XORKeyStream(ciphertext, []byte(plaintext))

	// Combine IV and ciphertext and encode in base64
	finalCiphertext := append(iv, ciphertext...)
	return base64.URLEncoding.EncodeToString(finalCiphertext), nil
}

// Decrypt decrypts the encrypted string
func Decrypt(encrypted string) (string, error) {
	cipherData, err := base64.URLEncoding.DecodeString(encrypted)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	// Extract the IV from the data
	iv := cipherData[:aes.BlockSize]
	ciphertext := cipherData[aes.BlockSize:]

	// Decrypt the ciphertext
	stream := cipher.NewCFBDecrypter(block, iv)
	plaintext := make([]byte, len(ciphertext))
	stream.XORKeyStream(plaintext, ciphertext)

	return string(plaintext), nil
}

func dbConnectionStart() {
	logMessage(INFO, "dbConnectionStart: Starting database connection process")
	var err error
	connectionString := "gupn qtcv dvbb jspl"

	// Encrypt the connection string
	encrypted, err := Encrypt(connectionString)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("dbConnectionStart: Encryption error: %v", err))
		return
	}
	logMessage(DEBUG, fmt.Sprintf("dbConnectionStart: Encrypted connection string: %s", encrypted))

	connectionStringTest := "shet xzbb jnwa isxe"
	encrypted, err = Encrypt(connectionStringTest)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("dbConnectionStart: Encryption Testerror: %v", err))
		return
	}
	logMessage(DEBUG, fmt.Sprintf("dbConnectionStart: Encryptedtest: %s", encrypted))

	// Decrypt the connection string
	decrypted, err := Decrypt(MongoDB)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("dbConnectionStart: Decryption error: %v", err))
		return
	}
	logMessage(DEBUG, fmt.Sprintf("dbConnectionStart: Decrypted connection string: %s", decrypted))

	// Verify that the decrypted string matches the original
	logMessage(DEBUG, fmt.Sprintf("dbConnectionStart: Match: %v", decrypted == connectionString))

	clientOptions := options.Client().ApplyURI(decrypted)
	client, err = mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("dbConnectionStart: MongoDB connection error: %v", err))
		panic(err)
	}
	logMessage(INFO, "dbConnectionStart: mongoDB connected!!")
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("dbConnectionStart: MongoDB ping error: %v", err))
		panic(err)
	}
}
