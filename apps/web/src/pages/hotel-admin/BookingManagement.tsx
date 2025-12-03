import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
    guest: z.object({
        name: z.string().min(2),
        email: z.string().email().optional(),
        phone: z.string().min(10),
    }),
    roomTypeId: z.string().min(1),
    checkInDate: z.string(),
    checkOutDate: z.string(),
    totalAmount: z.coerce.number().min(0),
});



const BookingManagement: React.FC = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<any[]>([]);
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Check-in State
    const [checkInBookingId, setCheckInBookingId] = useState<string | null>(null);
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string>("");

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            guest: {
                name: "",
                email: "",
                phone: "",
            },
            roomTypeId: "",
            checkInDate: "",
            checkOutDate: "",
            totalAmount: 0,
        },
    });

    useEffect(() => {
        fetchBookings();
        fetchRoomTypes();
    }, [hotelId]);

    const fetchBookings = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/bookings`);
            setBookings(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
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
            // Convert dates to ISO string for backend
            const payload = {
                ...values,
                checkInDate: new Date(values.checkInDate).toISOString(),
                checkOutDate: new Date(values.checkOutDate).toISOString(),
            };

            if (editingId) {
                await api.put(`/hotels/${hotelId}/bookings/${editingId}`, payload);
            } else {
                await api.post(`/hotels/${hotelId}/bookings`, payload);
            }
            fetchBookings();
            form.reset({
                guest: { name: "", email: "", phone: "" },
                roomTypeId: "",
                checkInDate: "",
                checkOutDate: "",
                totalAmount: 0,
            });
            setEditingId(null);
        } catch (error) {
            console.error('Error saving booking:', error);
            alert('Failed to save booking');
        }
    };

    const handleEdit = (booking: any) => {
        setEditingId(booking._id);
        form.reset({
            guest: {
                name: booking.guestId?.name || "",
                email: booking.guestId?.email || "",
                phone: booking.guestId?.phone || "",
            },
            roomTypeId: booking.roomTypeId?._id || booking.roomTypeId,
            checkInDate: booking.checkInDate ? new Date(booking.checkInDate).toISOString().split('T')[0] : "",
            checkOutDate: booking.checkOutDate ? new Date(booking.checkOutDate).toISOString().split('T')[0] : "",
            totalAmount: booking.totalAmount,
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this booking?')) return;
        try {
            await api.delete(`/hotels/${hotelId}/bookings/${id}`);
            fetchBookings();
        } catch (error) {
            console.error('Error deleting booking:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        form.reset({
            guest: { name: "", email: "", phone: "" },
            roomTypeId: "",
            checkInDate: "",
            checkOutDate: "",
            totalAmount: 0,
        });
    };

    const handleCheckIn = async (booking: any) => {
        setCheckInBookingId(booking._id);
        setSelectedRoomId("");
        try {
            // Fetch available rooms for the booking dates
            const response = await api.get(`/hotels/${hotelId}/available-rooms`, {
                params: {
                    checkInDate: booking.checkInDate,
                    checkOutDate: booking.checkOutDate,
                    roomTypeId: booking.roomTypeId?._id || booking.roomTypeId
                }
            });
            setAvailableRooms(response.data);
        } catch (error) {
            console.error('Error fetching available rooms:', error);
            alert('Failed to fetch available rooms');
        }
    };

    const confirmCheckIn = async () => {
        if (!checkInBookingId || !selectedRoomId) return;
        try {
            await api.post(`/hotels/${hotelId}/bookings/${checkInBookingId}/check-in`, { roomId: selectedRoomId });
            fetchBookings();
            setCheckInBookingId(null);
            setAvailableRooms([]);
            setSelectedRoomId("");
        } catch (error) {
            console.error('Error checking in:', error);
            alert('Failed to check in');
        }
    };

    const handleCheckOut = async (booking: any) => {
        if (!confirm(`Are you sure you want to check out ${booking.guestId?.name}?`)) return;
        try {
            await api.post(`/hotels/${hotelId}/bookings/${booking._id}/check-out`);
            fetchBookings();
        } catch (error) {
            console.error('Error checking out:', error);
            alert('Failed to check out');
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>New Booking</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="guest.name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Guest Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Jane Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="guest.phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1234567890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="guest.email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="jane@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="roomTypeId"
                                    render={({ field }) => (
                                        <FormItem>
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
                                <FormField
                                    control={form.control}
                                    name="checkInDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Check In</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="checkOutDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Check Out</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="totalAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} value={field.value as number} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">{editingId ? 'Update' : 'Create'} Booking</Button>
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
                    <CardTitle>Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Guest</TableHead>
                                <TableHead>Room Type</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.map((booking: any) => (
                                <TableRow key={booking._id}>
                                    <TableCell>
                                        <div>{booking.guestId?.name}</div>
                                        <div className="text-xs text-gray-500">{booking.guestId?.phone}</div>
                                    </TableCell>
                                    <TableCell>{booking.roomTypeId?.name}</TableCell>
                                    <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{booking.status}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => navigate(`/hotel/${hotelId}/bookings/${booking._id}`)}>View</Button>
                                            {booking.status === 'CONFIRMED' && (
                                                <Button size="sm" onClick={() => handleCheckIn(booking)}>Check In</Button>
                                            )}
                                            {booking.status === 'CHECKED_IN' && (
                                                <Button size="sm" variant="secondary" onClick={() => handleCheckOut(booking)}>Check Out</Button>
                                            )}
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(booking)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(booking._id)}>Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>


            <Dialog open={!!checkInBookingId} onOpenChange={(open) => !open && setCheckInBookingId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Check In Guest</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Room</Label>
                            <Select onValueChange={setSelectedRoomId} value={selectedRoomId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a clean room" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRooms.length === 0 ? (
                                        <SelectItem value="none" disabled>No clean rooms available</SelectItem>
                                    ) : (
                                        availableRooms.map((room) => (
                                            <SelectItem key={room._id} value={room._id}>
                                                {room.number} ({room.floorId?.name})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCheckInBookingId(null)}>Cancel</Button>
                        <Button onClick={confirmCheckIn} disabled={!selectedRoomId}>Confirm Check In</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default BookingManagement;
