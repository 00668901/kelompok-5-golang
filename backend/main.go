package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// --- Structs ---
type Room struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Type        string   `json:"type"`
	Price       float64  `json:"price"`
	Capacity    int      `json:"capacity"`
	Description string   `json:"description"`
	Amenities   []string `json:"amenities"`
	Available   bool     `json:"available"`
	Image       string   `json:"image"`
}

// FIX: STRUCT RESERVATION DISESUAIKAN DENGAN PAYLOAD REACT
type Reservation struct {
	ID              string  `json:"id"`
	RoomID          string  `json:"roomId"`
	GuestName       string  `json:"guestName"`
	Email           string  `json:"email"`
	Phone           string  `json:"phone"`
	Guests          int     `json:"guests"`
	SpecialRequests string  `json:"specialRequests"`
	CheckInDate     string  `json:"checkIn"`
	CheckOutDate    string  `json:"checkOut"`
	TotalPrice      float64 `json:"totalPrice,omitempty"`
	// Tambahkan field status agar ReservationsList tidak error
	Status string `json:"status"`
}

// --- Data Dummy (Rooms & Reservations) ---
var rooms = []Room{
	{
		ID:          "1",
		Name:        "Kamar Deluxe King",
		Type:        "Deluxe",
		Price:       1500000,
		Capacity:    2,
		Description: "Kamar mewah dengan pemandangan kota dan ranjang king-size.",
		Amenities:   []string{"WiFi Gratis", "AC", "TV 42-inch", "Mini Bar"},
		Available:   true,
		Image:       "http://localhost:8080/assets/images/deluxe_king.jpg",
	},
	{
		ID:          "2",
		Name:        "Suite Junior",
		Type:        "Suite",
		Price:       2500000,
		Capacity:    3,
		Description: "Ruang tamu terpisah dan fasilitas premium untuk kenyamanan ekstra.",
		Amenities:   []string{"WiFi Gratis", "AC", "TV 50-inch", "Kopi & Teh"},
		Available:   true,
		Image:       "http://localhost:8080/assets/images/suite_junior.jpg",
	},
	{
		ID:          "3",
		Name:        "Kamar Standar Twin",
		Type:        "Standard",
		Price:       900000,
		Capacity:    2,
		Description: "Kamar nyaman dengan dua ranjang single, cocok untuk rekan bisnis.",
		Amenities:   []string{"WiFi Gratis", "AC", "TV 32-inch"},
		Available:   false,
		Image:       "http://localhost:8080/assets/images/standard_twin.jpg",
	},
}

var reservations = []Reservation{
	{ID: "res_001", RoomID: "1", CheckInDate: "2025-12-01", CheckOutDate: "2025-12-03", TotalPrice: 4500000, GuestName: "User A", Email: "a@mail.com", Phone: "123", Guests: 2, SpecialRequests: "none", Status: "confirmed"},
	{ID: "res_002", RoomID: "2", CheckInDate: "2025-12-05", CheckOutDate: "2025-12-07", TotalPrice: 5000000, GuestName: "User B", Email: "b@mail.com", Phone: "456", Guests: 3, SpecialRequests: "early checkin", Status: "confirmed"},
}

// --- Handlers ---
func getRooms(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, rooms)
}

func getReservations(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, reservations)
}

func createReservation(c *gin.Context) {
	var newReservation Reservation

	if err := c.BindJSON(&newReservation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data reservasi tidak valid. Pastikan semua field ada dan benar."})
		return
	}

	newReservation.ID = "res_temp_" + newReservation.RoomID
	newReservation.Status = "confirmed" // Default status

	reservations = append(reservations, newReservation) // Tambahkan ke slice dummy

	c.IndentedJSON(http.StatusCreated, newReservation)
}

// ▼▼▼ FIX: HANDLER UNTUK MENGHAPUS RESERVASI ▼▼▼
func deleteReservation(c *gin.Context) {
	id := c.Param("id")

	// Logic untuk menghapus item dari slice dummy 'reservations'
	for i, r := range reservations {
		if r.ID == id {
			// Hapus item dari slice (menggunakan Golang slice trick)
			reservations = append(reservations[:i], reservations[i+1:]...)
			c.Status(http.StatusNoContent) // 204 No Content: Sukses tanpa mengembalikan body
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"error": "Reservasi tidak ditemukan"})
}

// ▲▲▲ END FIX: HANDLER UNTUK MENGHAPUS RESERVASI ▲▲▲

// --- Fungsi Utama ---
func main() {
	router := gin.Default()

	// Konfigurasi CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}, // Tambahkan PATCH
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// FIX: DAFTARKAN FOLDER FILE STATIS
	router.Static("/assets", "./assets")

	// Grup API v1
	api := router.Group("/api/v1")
	{
		api.GET("/rooms", getRooms)
		api.GET("/reservations", getReservations)
		api.POST("/reservations", createReservation)
		api.DELETE("/reservations/:id", deleteReservation) // <--- FIX ROUTE DELETE
		// api.PATCH("/reservations/:id/status", updateReservationStatus) // Opsional
	}

	router.Run("localhost:8080")
}
