import React from 'react';
import { useState, useEffect } from 'react';
import { Room, Reservation } from './types/hotel';
import { RoomCard } from './components/RoomCard';
import { BookingModal } from './components/BookingModal';
import { ReservationsList } from './components/ReservationsList';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { 
	Hotel, 
	Search, 
	Calendar, 
	Users, 
	Star,
	MapPin,
	Phone,
	Mail,
	Menu,
	X
} from 'lucide-react';
import { toast, Toaster } from 'sonner'; 
// Hapus import Supabase info
// import { projectId, publicAnonKey } from './utils/supabase/info'; 
import { ImageWithFallback } from './components/figma/ImageWithFallback';

// FIX VERCEL: Gunakan URL relatif untuk deployment
const API_BASE_URL = '/api';

export default function App() {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
	const [bookingModalOpen, setBookingModalOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [filterType, setFilterType] = useState('all');
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => {
		fetchRooms();
		fetchReservations();
	}, []);

	// ▼▼▼ Mengambil data Kamar dari Golang Serverless ▼▼▼
	const fetchRooms = async () => {
		try {
			// FIX VERCEL: Gunakan API_BASE_URL
			const response = await fetch(`${API_BASE_URL}/rooms`);

			if (!response.ok) {
				throw new Error('Gagal memuat data kamar dari server');
			}

			const data = await response.json();
			setRooms(data); 

		} catch (error) {
			console.error('Error fetching rooms:', error);
			if (error instanceof Error) {
				// Beri pesan yang jelas tentang kegagalan koneksi
				toast.error(`Kamar gagal dimuat: ${error.message}. Pastikan server Golang berjalan.`);
			} else {
				toast.error('Gagal memuat data kamar');
			}
		} finally {
			setLoading(false);
		}
	};
	// ▲▲▲ BATAS fetchRooms ▲▲▲


	// ▼▼▼ Mengambil data Reservasi dari Golang Serverless ▼▼▼
	const fetchReservations = async () => {
		try {
			// FIX VERCEL: Gunakan API_BASE_URL
			const response = await fetch(`${API_BASE_URL}/reservations`);

			if (!response.ok) {
				throw new Error('Gagal memuat data reservasi dari server');
			}

			const data = await response.json(); 
			setReservations(data); 

		} catch (error) {
			console.error('Error fetching reservations:', error);
			if (error instanceof Error) {
				toast.error(`Reservasi gagal dimuat: ${error.message}.`);
			} else {
				toast.error('Gagal memuat data reservasi');
			}
		}
	};
	// ▲▲▲ BATAS fetchReservations ▲▲▲


	const handleBookRoom = (room: Room) => {
		setSelectedRoom(room);
		setBookingModalOpen(true);
	};

	const handleBookingSuccess = () => {
		fetchReservations();
	};

	const filteredRooms = rooms.filter(room => {
		const roomTypeSafe = room.type || '';

		const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
							roomTypeSafe.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesType = filterType === 'all' || roomTypeSafe === filterType;
		return matchesSearch && matchesType;
	});

	const roomTypes = ['all', ...Array.from(new Set(rooms.map(r => r.type)))];

	return (
		<div className="min-h-screen bg-background">
			<Toaster position="top-right" />
			
			{/* Header */}
			<header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Hotel className="w-8 h-8" />
							<div>
								<h1 className="text-2xl">Grand Hotel Resort</h1>
								<p className="text-sm opacity-90">Luxury & Comfort Experience</p>
							</div>
						</div>
						
						<nav className="hidden md:flex gap-6">
							<a href="#rooms" className="hover:opacity-80 transition-opacity">Kamar</a>
							<a href="#reservations" className="hover:opacity-80 transition-opacity">Reservasi</a>
							<a href="#contact" className="hover:opacity-80 transition-opacity">Kontak</a>
						</nav>

						<Button
							variant="ghost"
							size="sm"
							className="md:hidden text-primary-foreground"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
						</Button>
					</div>

					{mobileMenuOpen && (
						<nav className="md:hidden mt-4 pb-2 flex flex-col gap-2">
							<a href="#rooms" className="hover:opacity-80 transition-opacity py-2">Kamar</a>
							<a href="#reservations" className="hover:opacity-80 transition-opacity py-2">Reservasi</a>
							<a href="#contact" className="hover:opacity-80 transition-opacity py-2">Kontak</a>
						</nav>
					)}
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative h-[500px] overflow-hidden">
				<ImageWithFallback
					src="https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5fGVufDF8fHx8MTc2MzM1NTg2MXww&ixlib=rb-4.1.0&q=80&w=1080"
					alt="Hotel Lobby"
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
					<div className="text-center text-white px-4">
						<h2 className="text-5xl mb-4">Selamat Datang di Grand Hotel</h2>
						<p className="text-xl mb-8">Nikmati pengalaman menginap terbaik dengan fasilitas mewah</p>
						<div className="flex items-center justify-center gap-8 flex-wrap">
							<div className="flex items-center gap-2">
								<Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
								<span>Rating 5.0</span>
							</div>
							<div className="flex items-center gap-2">
								<MapPin className="w-5 h-5" />
								<span>Jakarta, Indonesia</span>
							</div>
							<div className="flex items-center gap-2">
								<Hotel className="w-5 h-5" />
								<span>{rooms.length} Tipe Kamar</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-12">
				<Tabs defaultValue="rooms" className="space-y-8">
					<TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
						<TabsTrigger value="rooms" id="rooms">
							<Hotel className="w-4 h-4 mr-2" />
							Kamar Tersedia
						</TabsTrigger>
						<TabsTrigger value="reservations" id="reservations">
							<Calendar className="w-4 h-4 mr-2" />
							Reservasi Saya
						</TabsTrigger>
					</TabsList>

					<TabsContent value="rooms" className="space-y-6">
						{/* Search & Filter */}
						<Card>
							<CardContent className="pt-6">
								<div className="grid md:grid-cols-2 gap-4">
									<div className="relative">
										<Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
										<Input
											placeholder="Cari kamar berdasarkan nama atau tipe..."
											className="pl-10"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
									
									<div className="flex gap-2 overflow-x-auto">
										{roomTypes.map(type => (
											<Badge
												key={type}
												variant={filterType === type ? "default" : "outline"}
												className="cursor-pointer whitespace-nowrap"
												onClick={() => setFilterType(type)}
											>
												{type === 'all' ? 'Semua Tipe' : type}
											</Badge>
										))}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Room Grid */}
						{loading ? (
							<div className="text-center py-12">
								<p className="text-muted-foreground">Memuat data kamar...</p>
							</div>
						) : filteredRooms.length === 0 ? (
							<div className="text-center py-12">
								<p className="text-muted-foreground">Tidak ada kamar yang ditemukan</p>
							</div>
						) : (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredRooms.map(room => (
									<RoomCard
										key={room.id}
										room={room}
										onBook={handleBookRoom}
									/>
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent value="reservations" className="space-y-6">
						<div className="flex justify-between items-center">
							<div>
								<h3 className="text-2xl">Daftar Reservasi</h3>
								<p className="text-muted-foreground">
									Total: {reservations.length} reservasi
								</p>
							</div>
							<Button onClick={fetchReservations}>
								Refresh
							</Button>
						</div>

						<ReservationsList
							reservations={reservations}
							rooms={rooms}
							onUpdate={fetchReservations}
						/>
					</TabsContent>
				</Tabs>

				{/* Contact Section */}
				<section id="contact" className="mt-16 pt-8 border-t">
					<h3 className="text-2xl text-center mb-8">Hubungi Kami</h3>
					<div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
						<Card>
							<CardContent className="pt-6 text-center">
								<Phone className="w-8 h-8 mx-auto mb-3 text-primary" />
								<p className="text-sm text-muted-foreground">Telepon</p>
								<p>+62 21 1234 5678</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6 text-center">
								<Mail className="w-8 h-8 mx-auto mb-3 text-primary" />
								<p className="text-sm text-muted-foreground">Email</p>
								<p>info@grandhotel.com</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6 text-center">
								<MapPin className="w-8 h-8 mx-auto mb-3 text-primary" />
								<p className="text-sm text-muted-foreground">Alamat</p>
								<p>Jl. Sudirman No. 123, Jakarta</p>
							</CardContent>
						</Card>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="bg-muted mt-16 py-8">
				<div className="container mx-auto px-4 text-center text-muted-foreground">
					<p>&copy; 2025 Grand Hotel Resort. All rights reserved.</p>
				</div>
			</footer>

			{/* Booking Modal */}
			<BookingModal
				room={selectedRoom}
				open={bookingModalOpen}
				onClose={() => {
					setBookingModalOpen(false);
					setSelectedRoom(null);
				}}
				onSuccess={handleBookingSuccess}
			/>
		</div>
	);
}