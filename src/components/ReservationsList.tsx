import React from "react";
import { useState, useEffect } from 'react';
import { Reservation, Room } from '../types/hotel';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Users, Mail, Phone, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
// Hapus import Supabase info karena sudah tidak dipakai
// import { projectId, publicAnonKey } from '../utils/supabase/info';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

// Definisikan BASE URL Golang
const GOLANG_BASE_URL = 'http://localhost:8080/api/v1';

interface ReservationsListProps {
  reservations: Reservation[];
  rooms: Room[];
  onUpdate: () => void;
}

export function ReservationsList({ reservations, rooms, onUpdate }: ReservationsListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.name || 'Unknown Room';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // ▼▼▼ FIX: HANDLE DELETE UNTUK GOLANG LOKAL ▼▼▼
  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      const response = await fetch(
        // UBAH URL ke endpoint DELETE Golang: /api/v1/reservations/{id}
        `${GOLANG_BASE_URL}/reservations/${deleteId}`,
        {
          method: 'DELETE',
          // Hapus header Authorization
        }
      );
      
      // Golang kita tidak mengembalikan JSON sukses/gagal (data.success)
      // Kita hanya cek apakah statusnya OK (misal 204 No Content atau 200 OK)
      if (!response.ok) {
        // Coba baca error dari Golang jika ada
        const errorText = await response.text(); 
        throw new Error(errorText || `Gagal menghapus: Status ${response.status}`);
      }

      toast.success('Reservasi berhasil dihapus');
      onUpdate();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error(error.message || 'Gagal menghapus reservasi');
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };
  // ▲▲▲ END FIX HANDLE DELETE ▲▲▲


  // ▼▼▼ FIX: HANDLE UPDATE STATUS UNTUK GOLANG LOKAL (Opsional, jika Anda punya endpoint PATCH) ▼▼▼
  // Catatan: Anda belum menyediakan endpoint PATCH di Golang, jadi ini akan gagal 404/405.
  const handleUpdateStatus = async (id: string, status: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        // UBAH URL ke endpoint PATCH Golang: /api/v1/reservations/{id}/status
        `${GOLANG_BASE_URL}/reservations/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            // Hapus header Authorization
          },
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) {
        const errorText = await response.text(); 
        throw new Error(errorText || `Gagal mengupdate status: Status ${response.status}`);
      }
      
      toast.success('Status reservasi diperbarui');
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Gagal mengupdate status');
    } finally {
      setLoading(false);
    }
  };
  // ▲▲▲ END FIX HANDLE UPDATE STATUS ▲▲▲


  const getStatusBadge = (status: string) => {
    switch (status) {
      // Data dummy Anda tidak menyertakan field 'status', jadi ini mungkin tidak muncul
      case 'confirmed':
        return <Badge className="bg-green-500">Dikonfirmasi</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Dibatalkan</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Selesai</Badge>;
      default:
        // Default status jika field 'status' tidak ada di data dummy Golang
        return <Badge variant="outline">Confirmed</Badge>; 
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Belum ada reservasi</p>
      </div>
    );
  }
  
  // Catatan: Karena data reservasi di Golang masih dummy (tidak dihapus),
  // Anda harus menerapkan logic penghapusan di sisi Golang agar data benar-benar hilang.
  // Untuk saat ini, fungsi ini hanya akan menguji koneksi DELETE.

  return (
    <>
      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{getRoomName(reservation.roomId)}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kode Booking: {reservation.id}
                  </p>
                </div>
                {getStatusBadge(reservation.status || 'confirmed')}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.guestName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.phone || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Check-in: {formatDate(reservation.checkInDate || '2000-01-01')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Check-out: {formatDate(reservation.checkOutDate || '2000-01-01')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.guests || 0} tamu</span>
                  </div>
                </div>
              </div>

              {reservation.specialRequests && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Permintaan khusus: </span>
                    {reservation.specialRequests}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                  <p className="text-primary">{formatPrice(reservation.totalPrice)}</p>
                </div>
                
                <div className="flex gap-2">
                  {/* Status update logic dihilangkan karena endpoint PATCH tidak ada */}
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(reservation.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Reservasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus reservasi ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}