import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, XCircle, AlertCircle, Clock, BedDouble, Paintbrush } from 'lucide-react';

interface Room {
    _id: string;
    number: string;
    floorId: {
        _id: string;
        name: string;
        number: number;
    };
    roomTypeId: {
        _id: string;
        name: string;
    };
    status: 'CLEAN' | 'DIRTY' | 'OCCUPIED' | 'MAINTENANCE' | 'OUT_OF_ORDER';
}

const RoomRack: React.FC = () => {
    const { hotelId } = useParams();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchRooms();
    }, [hotelId]);

    const fetchRooms = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/rooms`, {
                params: { limit: 1000 } // Fetch all rooms
            });
            setRooms(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateRoomStatus = async (roomId: string, status: string) => {
        try {
            await api.put(`/hotels/${hotelId}/rooms/${roomId}`, { status });
            fetchRooms(); // Refresh
        } catch (error) {
            console.error('Error updating room status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CLEAN': return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
            case 'DIRTY': return 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200';
            case 'OCCUPIED': return 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200';
            case 'MAINTENANCE': return 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200';
            case 'OUT_OF_ORDER': return 'bg-black text-white hover:bg-gray-800';
            default: return 'bg-white border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CLEAN': return <CheckCircle2 className="h-4 w-4" />;
            case 'DIRTY': return <Paintbrush className="h-4 w-4" />;
            case 'OCCUPIED': return <BedDouble className="h-4 w-4" />;
            case 'MAINTENANCE': return <AlertCircle className="h-4 w-4" />;
            case 'OUT_OF_ORDER': return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    // Group rooms by floor
    const floors = React.useMemo(() => {
        const grouped: Record<string, Room[]> = {};
        rooms.forEach(room => {
            const floorName = room.floorId?.name || 'Unknown Floor';
            if (!grouped[floorName]) {
                grouped[floorName] = [];
            }
            grouped[floorName].push(room);
        });
        // Sort floors (simple alpha sort for now, ideally by floor number if available)
        return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
    }, [rooms]);

    const filteredRooms = (rooms: Room[]) => {
        if (filter === 'ALL') return rooms;
        return rooms.filter(r => r.status === filter);
    };

    if (loading) return <div>Loading Room Rack...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Room Rack</h1>
                <div className="flex gap-2">
                    {['ALL', 'CLEAN', 'DIRTY', 'OCCUPIED', 'MAINTENANCE'].map(status => (
                        <Button
                            key={status}
                            variant={filter === status ? 'default' : 'outline'}
                            onClick={() => setFilter(status)}
                            size="sm"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                {floors.map(([floorName, floorRooms]) => {
                    const visibleRooms = filteredRooms(floorRooms);
                    if (visibleRooms.length === 0) return null;

                    return (
                        <Card key={floorName}>
                            <CardHeader className="pb-3">
                                <CardTitle>{floorName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {visibleRooms.map(room => (
                                        <TooltipProvider key={room._id}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${getStatusColor(room.status)}`}
                                                        onClick={() => {
                                                            // Simple toggle for demo: Dirty -> Clean, Clean -> Dirty (if empty)
                                                            if (room.status === 'DIRTY') updateRoomStatus(room._id, 'CLEAN');
                                                            else if (room.status === 'CLEAN') updateRoomStatus(room._id, 'DIRTY');
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="font-bold text-lg">{room.number}</span>
                                                            {getStatusIcon(room.status)}
                                                        </div>
                                                        <div className="text-xs truncate font-medium">
                                                            {room.roomTypeId?.name}
                                                        </div>
                                                        <div className="text-xs mt-1 uppercase tracking-wider opacity-75">
                                                            {room.status}
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Click to toggle Clean/Dirty</p>
                                                    <p>Status: {room.status}</p>
                                                    <p>Type: {room.roomTypeId?.name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default RoomRack;
