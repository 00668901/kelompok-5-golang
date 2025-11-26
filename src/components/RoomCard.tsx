import React from "react";
import { Room } from '../types/hotel';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Wifi, Wind, Tv, Coffee } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

export function RoomCard({ room, onBook }: RoomCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {room.available ? (
          <Badge className="absolute top-4 right-4 bg-green-500">Tersedia</Badge>
        ) : (
          <Badge className="absolute top-4 right-4 bg-red-500">Penuh</Badge>
        )}
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="mb-1">{room.name}</h3>
            <Badge variant="outline">{room.type}</Badge>
          </div>
          <div className="text-right">
            <p className="text-primary">{formatPrice(room.price)}</p>
            <p className="text-muted-foreground text-sm">per malam</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">{room.description}</p>
        
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Kapasitas: {room.capacity} orang</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {room.amenities.slice(0, 4).map((amenity, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {room.amenities.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{room.amenities.length - 4} lainnya
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onBook(room)}
          disabled={!room.available}
        >
          {room.available ? 'Pesan Sekarang' : 'Tidak Tersedia'}
        </Button>
      </CardFooter>
    </Card>
  );
}
