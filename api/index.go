package handler

import (
	"encoding/json"
	"net/http"
	"fmt" // Import fmt untuk debug/logging

	// Pastikan package ini sudah diunduh: go get github.com/gin-gonic/gin
	"github.com/gin-gonic/gin" 
)

// Definisikan Struct yang sama dengan di frontend
type Room struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Type        string  `json:"type"`
	Price       float64 `json:"price"` 
	Capacity    int     `json:"capacity"`
	Description string  `json:"description"`
	Amenities   []string `json:"amenities"` 
	Available   bool    `json:"available"` 
	Image       string  `json:"image"` 
}

// Data Dummy Kamar (Diambil dari main.go sebelumnya)
var rooms = []Room{
    // Gunakan URL gambar yang dapat diakses publik setelah deployment (bukan localhost!)
    // Atau Anda bisa menggunakan asset hosting seperti Cloudinary.
    // Untuk tujuan demo, kita pakai picsum yang universal.
    {
        ID:          "1",
        Name:        "Kamar Deluxe King",
        Type:        "Deluxe",
        Price:       1500000,
        Capacity:    2,
        Description: "Kamar mewah dengan pemandangan kota dan ranjang king-size.",
        Amenities:   []string{"WiFi Gratis", "AC", "TV 42-inch", "Mini Bar"}, 
        Available:   true, 
        Image:       "https://picsum.photos/id/11/800/600", 
    },
    // ... (Tambahkan data kamar lainnya di sini) ...
}

// Handler utama untuk Vercel. 
// Function ini harus menerima http.ResponseWriter dan *http.Request
func Handler(w http.ResponseWriter, r *http.Request) {
    // 1. Atur CORS (Wajib di Serverless Function)
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    if r.Method == "OPTIONS" {
        w.WriteHeader(http.StatusOK)
        return
    }

    // 2. Routing Sederhana (Hanya untuk GET /api/rooms)
    if r.URL.Path == "/api/rooms" && r.Method == "GET" {
        w.Header().Set("Content-Type", "application/json")
        if err := json.NewEncoder(w).Encode(rooms); err != nil {
            http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
            return
        }
        return
    }
    
    // Ini adalah fallback 404
    http.NotFound(w, r)
}