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



import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const RoomManagement: React.FC = () => {
    const { hotelId } = useParams();
    const [rooms, setRooms] = useState<any[]>([]);
    const [floors, setFloors] = useState<any[]>([]);
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Pagination & Search State
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            number: "",
            floorId: "",
            roomTypeId: "",
        },
    });

    useEffect(() => {
        fetchFloors();
        fetchRoomTypes();
    }, [hotelId]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchRooms();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [hotelId, search, page]);

    const fetchRooms = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/hotels/${hotelId}/rooms`, {
                params: { search, page, limit: 10 }
            });
            if (response.data.data) {
                setRooms(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
            } else {
                setRooms(response.data);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFloors = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/floors`);
            setFloors(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching floors:', error);
        }
    };

    const fetchRoomTypes = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/room-types`);
            setRoomTypes(response.data.data || response.data);
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Rooms</CardTitle>
                    <div className="w-1/3">
                        <Input
                            placeholder="Search rooms..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : rooms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No rooms found</TableCell>
                                </TableRow>
                            ) : (
                                rooms.map((room: any) => (
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
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                isActive={page === i + 1}
                                                onClick={() => setPage(i + 1)}
                                                className="cursor-pointer"
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RoomManagement;
