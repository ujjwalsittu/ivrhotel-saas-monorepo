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

type BookingFormValues = z.infer<typeof formSchema>;

const BookingManagement: React.FC = () => {
    const { hotelId } = useParams();
    const [bookings, setBookings] = useState<any[]>([]);
    const [roomTypes, setRoomTypes] = useState<any[]>([]);

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
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
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

    const onSubmit = async (values: BookingFormValues) => {
        try {
            // Convert dates to ISO string for backend
            const payload = {
                ...values,
                checkInDate: new Date(values.checkInDate).toISOString(),
                checkOutDate: new Date(values.checkOutDate).toISOString(),
            };
            await api.post(`/hotels/${hotelId}/bookings`, payload);
            fetchBookings();
            form.reset();
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Failed to create booking');
        }
    };

    const handleCheckIn = async () => {
        // For simplicity, we'll just ask for a room ID via prompt or auto-assign in a real app.
        // Here, let's just assume we need to build a check-in modal.
        // For this MVP step, I'll just log it as "Coming Soon" or implement a simple prompt if I had room list.
        alert("Check-in UI coming in next step (needs room selection)");
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
                                                    {roomTypes.map((type) => (
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
                            <Button type="submit">Create Booking</Button>
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
                            {bookings.map((booking) => (
                                <TableRow key={booking._id}>
                                    <TableCell>
                                        <div>{booking.guestId?.name}</div>
                                        <div className="text-xs text-gray-500">{booking.guestId?.phone}</div>
                                    </TableCell>
                                    <TableCell>{booking.roomTypeId?.name}</TableCell>
                                    <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{booking.status}</TableCell>
                                    <TableCell>
                                        {booking.status === 'CONFIRMED' && (
                                            <Button size="sm" onClick={() => handleCheckIn()}>Check In</Button>
                                        )}
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

export default BookingManagement;
