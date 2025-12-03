import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, BedDouble } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { format, addDays } from 'date-fns';

interface RoomStepProps {
    onSelect: (data: { roomId: string; roomTypeId: string; checkInDate: string; checkOutDate: string; roomNumber: string; price: number }) => void;
    selectedData?: { roomId: string; roomTypeId: string; checkInDate: string; checkOutDate: string; roomNumber: string; price: number };
}

export const RoomStep: React.FC<RoomStepProps> = ({ onSelect, selectedData }) => {
    const { hotelId } = useParams();
    const [checkInDate, setCheckInDate] = useState(selectedData?.checkInDate || format(new Date(), 'yyyy-MM-dd'));
    const [checkOutDate, setCheckOutDate] = useState(selectedData?.checkOutDate || format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    const [roomTypeId, setRoomTypeId] = useState(selectedData?.roomTypeId || '');

    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);

    useEffect(() => {
        fetchRoomTypes();
    }, [hotelId]);

    useEffect(() => {
        if (checkInDate && checkOutDate) {
            fetchAvailableRooms();
        }
    }, [checkInDate, checkOutDate, roomTypeId]);

    const fetchRoomTypes = async () => {
        try {
            const res = await axios.get(`http://localhost:4000/api/hotels/${hotelId}/room-types`, { withCredentials: true });
            setRoomTypes(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch room types", error);
        }
    };

    const fetchAvailableRooms = async () => {
        setIsLoadingRooms(true);
        try {
            let url = `http://localhost:4000/api/hotels/${hotelId}/available-rooms?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;
            if (roomTypeId) {
                url += `&roomTypeId=${roomTypeId}`;
            }
            const res = await axios.get(url, { withCredentials: true });
            setAvailableRooms(res.data || []);
        } catch (error) {
            console.error("Failed to fetch available rooms", error);
        } finally {
            setIsLoadingRooms(false);
        }
    };

    const handleRoomSelect = (room: any) => {
        // Find price from room type
        // The room object from available-rooms endpoint populates roomTypeId
        const price = room.roomTypeId?.basePrice || 0;

        onSelect({
            roomId: room._id,
            roomTypeId: room.roomTypeId?._id || roomTypeId, // Fallback if not populated correctly
            checkInDate,
            checkOutDate,
            roomNumber: room.number,
            price
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Check-in Date</Label>
                    <Input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Check-out Date</Label>
                    <Input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        min={checkInDate}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Room Type (Optional)</Label>
                    <Select value={roomTypeId} onValueChange={setRoomTypeId}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Room Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Room Types</SelectItem> {/* Value cannot be empty string in shadcn select sometimes */}
                            {roomTypes.map((rt) => (
                                <SelectItem key={rt._id} value={rt._id}>{rt.name} (${rt.basePrice})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <Label>Available Rooms</Label>
                {isLoadingRooms ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : availableRooms.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                        No rooms available for the selected dates and criteria.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {availableRooms.map((room) => (
                            <Card
                                key={room._id}
                                className={`cursor-pointer transition-colors hover:border-primary ${selectedData?.roomId === room._id ? 'border-primary bg-primary/10' : ''}`}
                                onClick={() => handleRoomSelect(room)}
                            >
                                <CardContent className="p-4 flex flex-col items-center gap-2">
                                    <BedDouble className="w-8 h-8 text-muted-foreground" />
                                    <div className="text-center">
                                        <p className="font-bold text-lg">{room.number}</p>
                                        <p className="text-xs text-muted-foreground">{room.roomTypeId?.name}</p>
                                        <p className="text-sm font-medium">${room.roomTypeId?.basePrice}/night</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
