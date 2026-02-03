package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

const (
	KeyID     = "rzp_test_1DP5mmOlF5G5ag"  // Replace with your Razorpay Test Key ID
	KeySecret = "5nHd8nNEU0n23SmF1KkP9vT3" // Replace with your Razorpay Test Key Secret
)

// Create Razorpay Order (for Pay Now / Pay Later)
func createOrder(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "createOrder: Received request to create Razorpay order")
	url := "https://api.razorpay.com/v1/orders"

	payload := strings.NewReader(`{
		"amount": 50000,
		"currency": "INR",
		"receipt": "order_rcptid_11"
	}`)

	req, _ := http.NewRequest("POST", url, payload)
	req.SetBasicAuth(KeyID, KeySecret)
	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("createOrder: Failed to create order: %v", err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer res.Body.Close()

	body, _ := ioutil.ReadAll(res.Body)
	logMessage(INFO, "createOrder: Order created successfully")
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

// Create Razorpay QR Code (for Scan & Pay)
func createQR(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "createQR: Received request to create Razorpay QR code")
	url := "https://api.razorpay.com/v1/payments/qr_codes"

	payload := strings.NewReader(`{
		"type": "upi_qr",
		"name": "Test Store",
		"usage": "single_use",
		"fixed_amount": true,
		"payment_amount": 50000,
		"currency": "INR",
		"description": "Test QR Payment"
	}`)

	req, _ := http.NewRequest("POST", url, payload)
	req.SetBasicAuth(KeyID, KeySecret)
	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("createQR: Failed to create QR code: %v", err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer res.Body.Close()

	body, _ := ioutil.ReadAll(res.Body)
	logMessage(INFO, "createQR: QR code created successfully")
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}
