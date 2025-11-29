import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
    number: z.string().min(1),
    floorId: z.string().min(1),
    roomTypeId: z.string().min(1),
});



const RoomManagement: React.FC = () => {
    const { hotelId } = useParams();
    const [rooms, setRooms] = useState<any[]>([]);
    const [floors, setFloors] = useState<any[]>([]);
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            number: "",
            floorId: "",
            roomTypeId: "",
        },
    });

    useEffect(() => {
        fetchRooms();
        fetchFloors();
        fetchRoomTypes();
    }, [hotelId]);

    const fetchRooms = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/rooms`);
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const fetchFloors = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/floors`);
            setFloors(response.data);
        } catch (error) {
            console.error('Error fetching floors:', error);
        }
    };

    const fetchRoomTypes = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/room-types`);
            setRoomTypes(response.data);
        } catch (error) {
            console.error('Error fetching room types:', error);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (editingId) {
                await api.put(`/hotels/${hotelId}/rooms/${editingId}`, values);
            } else {
                await api.post(`/hotels/${hotelId}/rooms`, values);
            }
            fetchRooms();
            form.reset({ number: "", floorId: "", roomTypeId: "" });
            setEditingId(null);
        } catch (error) {
            console.error('Error saving room:', error);
        }
    };

    const handleEdit = (room: any) => {
        setEditingId(room._id);
        form.reset({
            number: room.number,
            floorId: room.floorId?._id || room.floorId,
            roomTypeId: room.roomTypeId?._id || room.roomTypeId,
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this room?')) return;
        try {
            await api.delete(`/hotels/${hotelId}/rooms/${id}`);
            fetchRooms();
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        form.reset({ number: "", floorId: "", roomTypeId: "" });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add Room</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 items-end">
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="101" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="floorId"
                                render={({ field }) => (
                                    <FormItem className="w-[200px]">
                                        <FormLabel>Floor</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select floor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {floors.map((floor: any) => (
                                                    <SelectItem key={floor._id} value={floor._id}>
                                                        {floor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="roomTypeId"
                                render={({ field }) => (
                                    <FormItem className="w-[200px]">
                                        <FormLabel>Room Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {roomTypes.map((type: any) => (
                                                    <SelectItem key={type._id} value={type._id}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-2">
                                <Button type="submit">{editingId ? 'Update' : 'Add'} Room</Button>
                                {editingId && (
                                    <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Number</TableHead>
                                <TableHead>Floor</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rooms.map((room: any) => (
                                <TableRow key={room._id}>
                                    <TableCell>{room.number}</TableCell>
                                    <TableCell>{room.floorId?.name}</TableCell>
                                    <TableCell>{room.roomTypeId?.name}</TableCell>
                                    <TableCell>{room.status}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(room)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(room._id)}>Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default RoomManagement;
