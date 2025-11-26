package handler

import (
	"encoding/json"
	"net/http"
	"strings"
	"strconv"
)

// --- Structs (Disesuaikan) ---
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

type Reservation struct {
	ID             string  `json:"id"`
	RoomID         string  `json:"roomId"`
	GuestName      string  `json:"guestName"`
	Email          string  `json:"email"`
	Phone          string  `json:"phone"`
	Guests         int     `json:"guests"`
	SpecialRequests string `json:"specialRequests"`
	CheckInDate    string  `json:"checkIn"`        
	CheckOutDate   string  `json:"checkOut"`       
	TotalPrice     float64 `json:"totalPrice,omitempty"` 
	Status 		   string `json:"status"` 
}

// --- Data Dummy GLOBAL (Catatan: Data ini tidak tersimpan secara permanen di Vercel!) ---
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
		Image:       "https://picsum.photos/id/11/800/600",
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
		Image:       "https://picsum.photos/id/21/800/600",
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
		Image:       "https://picsum.photos/id/31/800/600",
	},
}

var reservations = []Reservation{
	{ID: "res_001", RoomID: "1", CheckInDate: "2025-12-01", CheckOutDate: "2025-12-03", TotalPrice: 4500000, GuestName: "User A", Email: "a@mail.com", Phone: "123", Guests: 2, SpecialRequests: "none", Status: "confirmed", CheckIn: "2025-12-01", CheckOut: "2025-12-03"},
	{ID: "res_002", RoomID: "2", CheckInDate: "2025-12-05", CheckOutDate: "2025-12-07", TotalPrice: 5000000, GuestName: "User B", Email: "b@mail.com", Phone: "456", Guests: 3, SpecialRequests: "early checkin", Status: "confirmed", CheckIn: "2025-12-05", CheckOut: "2025-12-07"},
}

// Handler utama untuk Vercel. 
func Handler(w http.ResponseWriter, r *http.Request) {
    // 1. Atur CORS 
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS, PATCH")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    w.Header().Set("Content-Type", "application/json")

    // Tangani preflight request OPTIONS
    if r.Method == "OPTIONS" {
        w.WriteHeader(http.StatusOK)
        return
    }

    // Ambil segmen path yang relevan setelah /api/
    pathSegments := strings.Split(r.URL.Path, "/")
    basePath := ""
    
    // Asumsi: path selalu dalam format /api/resource atau /api/resource/id
    if len(pathSegments) >= 3 && pathSegments[1] == "api" {
        basePath = pathSegments[2]
    }

    switch basePath {
    case "rooms":
        if r.Method == "GET" {
            // GET /api/rooms
            w.WriteHeader(http.StatusOK)
            json.NewEncoder(w).Encode(rooms)
            return
        }

    case "reservations":
        // Routing untuk Reservasi
        
        id := ""
        if len(pathSegments) >= 4 {
            id = pathSegments[3] 
        }

        // GET /api/reservations
        if r.Method == "GET" && id == "" {
            w.WriteHeader(http.StatusOK)
            json.NewEncoder(w).Encode(reservations)
            return
        }

        // POST /api/reservations
        if r.Method == "POST" && id == "" {
            var newReservation Reservation
            if err := json.NewDecoder(r.Body).Decode(&newReservation); err != nil {
                w.WriteHeader(http.StatusBadRequest)
                json.NewEncoder(w).Encode(map[string]string{"error": "Data reservasi tidak valid"})
                return
            }
            
            newReservation.ID = "res_vercel_" + strconv.Itoa(len(reservations) + 1)
            newReservation.Status = "confirmed"
            
            reservations = append(reservations, newReservation) 

            w.WriteHeader(http.StatusCreated)
            json.NewEncoder(w).Encode(newReservation)
            return
        }
        
        // DELETE /api/reservations/{id}
        if r.Method == "DELETE" && id != "" {
            for i, res := range reservations {
                if res.ID == id {
                    // Hapus item dari slice
                    reservations = append(reservations[:i], reservations[i+1:]...)
                    w.WriteHeader(http.StatusNoContent) // 204 No Content
                    return
                }
            }
            
            w.WriteHeader(http.StatusNotFound)
            json.NewEncoder(w).Encode(map[string]string{"error": "Reservasi tidak ditemukan"})
            return
        }
        
    default:
        // 404 Not Found 
        w.WriteHeader(http.StatusNotFound)
        json.NewEncoder(w).Encode(map[string]string{"error": "Endpoint tidak ditemukan"})
        return
    }
}