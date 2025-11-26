export interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  description: string;
  amenities: string[];
  available: boolean;
  image: string;
}

export interface Reservation {
  id: string;
  roomId: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  totalPrice: number;
}
