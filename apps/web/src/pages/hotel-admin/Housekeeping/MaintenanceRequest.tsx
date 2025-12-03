import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ivrhotel/ui';
import { Button } from '@ivrhotel/ui';
import { Label } from "@ivrhotel/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ivrhotel/ui';
import { Textarea } from "@ivrhotel/ui";

const MaintenanceRequest: React.FC = () => {
    const { hotelId } = useParams();
    const [rooms, setRooms] = useState<any[]>([]);
    const [request, setRequest] = useState({
        roomId: "",
        description: "",
        priority: "HIGH"
    });

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get(`/hotels/${hotelId}/rooms`);
                setRooms(response.data.data || response.data);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };
        fetchRooms();
    }, [hotelId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/hotels/${hotelId}/housekeeping/tasks`, {
                ...request,
                type: 'MAINTENANCE'
            });
            alert('Maintenance request submitted successfully');
            setRequest({ roomId: "", description: "", priority: "HIGH" });
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to submit request');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Report Maintenance Issue</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Select Room / Area</Label>
                            <Select onValueChange={(val) => setRequest({ ...request, roomId: val })} value={request.roomId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Room" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rooms.map((room) => (
                                        <SelectItem key={room._id} value={room._id}>
                                            Room {room.number} ({room.floorId?.name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Issue Description</Label>
                            <Textarea
                                placeholder="Describe the issue (e.g., Leaking faucet, AC not cooling)..."
                                className="min-h-[100px]"
                                value={request.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequest({ ...request, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select onValueChange={(val) => setRequest({ ...request, priority: val })} value={request.priority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low (Can wait)</SelectItem>
                                    <SelectItem value="MEDIUM">Medium (Fix soon)</SelectItem>
                                    <SelectItem value="HIGH">High (Urgent)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={!request.roomId || !request.description}>
                            Submit Request
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default MaintenanceRequest;
