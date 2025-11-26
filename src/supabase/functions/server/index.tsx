import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors())
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Inisialisasi bucket untuk gambar kamar
async function initBucket() {
  const bucketName = 'make-aa71f191-hotel-images'
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: false })
    console.log(`Bucket ${bucketName} created`)
  }
}

// Inisialisasi data kamar default
async function initRooms() {
  const existingRooms = await kv.get('rooms_initialized')
  if (!existingRooms) {
    const defaultRooms = [
      {
        id: '1',
        name: 'Deluxe Room',
        type: 'Deluxe',
        price: 1500000,
        capacity: 2,
        description: 'Kamar mewah dengan pemandangan kota, dilengkapi dengan AC, TV LED, dan kamar mandi modern',
        amenities: ['WiFi Gratis', 'AC', 'TV LED 42"', 'Mini Bar', 'Breakfast'],
        available: true,
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'
      },
      {
        id: '2',
        name: 'Suite Room',
        type: 'Suite',
        price: 3000000,
        capacity: 4,
        description: 'Suite eksklusif dengan ruang tamu terpisah, jacuzzi, dan balkon pribadi',
        amenities: ['WiFi Gratis', 'AC', 'TV LED 55"', 'Jacuzzi', 'Breakfast', 'Butler Service'],
        available: true,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      },
      {
        id: '3',
        name: 'Family Room',
        type: 'Family',
        price: 2000000,
        capacity: 4,
        description: 'Kamar luas untuk keluarga dengan 2 tempat tidur queen size',
        amenities: ['WiFi Gratis', 'AC', 'TV LED 42"', 'Mini Bar', 'Breakfast', 'Kids Area'],
        available: true,
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
      },
      {
        id: '4',
        name: 'Standard Room',
        type: 'Standard',
        price: 800000,
        capacity: 2,
        description: 'Kamar nyaman dengan fasilitas standar untuk menginap yang menyenangkan',
        amenities: ['WiFi Gratis', 'AC', 'TV LED 32"', 'Breakfast'],
        available: true,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
      },
      {
        id: '5',
        name: 'Presidential Suite',
        type: 'Presidential',
        price: 5000000,
        capacity: 6,
        description: 'Suite prestisius dengan fasilitas terlengkap dan pemandangan panorama',
        amenities: ['WiFi Gratis', 'AC', 'TV LED 65"', 'Jacuzzi', 'Private Pool', 'Breakfast', 'Butler Service', 'Limousine'],
        available: true,
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
      },
      {
        id: '6',
        name: 'Executive Room',
        type: 'Executive',
        price: 2500000,
        capacity: 2,
        description: 'Kamar executive dengan workspace dan akses ke executive lounge',
        amenities: ['WiFi Gratis', 'AC', 'TV LED 50"', 'Mini Bar', 'Breakfast', 'Executive Lounge Access', 'Work Desk'],
        available: true,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
      }
    ]
    
    await kv.set('hotel_rooms', defaultRooms)
    await kv.set('rooms_initialized', true)
    console.log('Default rooms initialized')
  }
}

initBucket()
initRooms()

// GET semua kamar
app.get('/make-server-aa71f191/rooms', async (c) => {
  try {
    const rooms = await kv.get('hotel_rooms') || []
    return c.json({ success: true, data: rooms })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// GET kamar berdasarkan ID
app.get('/make-server-aa71f191/rooms/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const rooms = await kv.get('hotel_rooms') || []
    const room = rooms.find((r: any) => r.id === id)
    
    if (!room) {
      return c.json({ success: false, error: 'Room not found' }, 404)
    }
    
    return c.json({ success: true, data: room })
  } catch (error) {
    console.error('Error fetching room:', error)
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// POST reservasi baru
app.post('/make-server-aa71f191/reservations', async (c) => {
  try {
    const body = await c.req.json()
    const { roomId, guestName, email, phone, checkIn, checkOut, guests, specialRequests } = body
    
    // Validasi
    if (!roomId || !guestName || !email || !phone || !checkIn || !checkOut || !guests) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }
    
    // Generate ID reservasi
    const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const reservation = {
      id: reservationId,
      roomId,
      guestName,
      email,
      phone,
      checkIn,
      checkOut,
      guests,
      specialRequests: specialRequests || '',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      totalPrice: 0 // Will be calculated
    }
    
    // Get room untuk hitung harga
    const rooms = await kv.get('hotel_rooms') || []
    const room = rooms.find((r: any) => r.id === roomId)
    
    if (!room) {
      return c.json({ success: false, error: 'Room not found' }, 404)
    }
    
    // Hitung total harga (harga per malam x jumlah malam)
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    reservation.totalPrice = room.price * nights
    
    // Simpan reservasi
    const reservations = await kv.get('reservations') || []
    reservations.push(reservation)
    await kv.set('reservations', reservations)
    
    console.log(`New reservation created: ${reservationId}`)
    return c.json({ success: true, data: reservation })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// GET semua reservasi
app.get('/make-server-aa71f191/reservations', async (c) => {
  try {
    const reservations = await kv.get('reservations') || []
    return c.json({ success: true, data: reservations })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// GET reservasi berdasarkan ID
app.get('/make-server-aa71f191/reservations/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const reservations = await kv.get('reservations') || []
    const reservation = reservations.find((r: any) => r.id === id)
    
    if (!reservation) {
      return c.json({ success: false, error: 'Reservation not found' }, 404)
    }
    
    return c.json({ success: true, data: reservation })
  } catch (error) {
    console.error('Error fetching reservation:', error)
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// DELETE reservasi
app.delete('/make-server-aa71f191/reservations/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const reservations = await kv.get('reservations') || []
    const filteredReservations = reservations.filter((r: any) => r.id !== id)
    
    if (reservations.length === filteredReservations.length) {
      return c.json({ success: false, error: 'Reservation not found' }, 404)
    }
    
    await kv.set('reservations', filteredReservations)
    console.log(`Reservation deleted: ${id}`)
    return c.json({ success: true, message: 'Reservation deleted' })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// UPDATE status reservasi
app.patch('/make-server-aa71f191/reservations/:id/status', async (c) => {
  try {
    const id = c.req.param('id')
    const { status } = await c.req.json()
    
    if (!status) {
      return c.json({ success: false, error: 'Status is required' }, 400)
    }
    
    const reservations = await kv.get('reservations') || []
    const reservationIndex = reservations.findIndex((r: any) => r.id === id)
    
    if (reservationIndex === -1) {
      return c.json({ success: false, error: 'Reservation not found' }, 404)
    }
    
    reservations[reservationIndex].status = status
    await kv.set('reservations', reservations)
    
    console.log(`Reservation ${id} status updated to ${status}`)
    return c.json({ success: true, data: reservations[reservationIndex] })
  } catch (error) {
    console.error('Error updating reservation status:', error)
    return c.json({ success: false, error: String(error) }, 500)
  }
})

Deno.serve(app.fetch)
