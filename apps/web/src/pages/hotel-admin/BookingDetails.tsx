import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingTimeline } from '@/components/BookingTimeline';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const BookingDetails: React.FC = () => {
    const { hotelId, bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingRes, activitiesRes] = await Promise.all([
                    api.get(`/hotels/${hotelId}/bookings`), // We need a get single booking endpoint, but currently we only have get all. 
                    // Wait, the controller has getBookings but not getBookingById explicitly exposed as a separate route?
                    // Let's check the routes.
                    // router.get('/', getBookings);
                    // We don't have router.get('/:id', getBookingById);
                    // We need to add that or filter the list. Filtering list is inefficient but works for now if list is small.
                    // Actually, updateBooking uses findById, so the backend supports it.
                    // Let's add getBookingById to the backend first or use the list and find.
                    // Given the constraints, I'll add getBookingById to the backend quickly or just use the list.
                    // Using the list is safer without modifying backend more.
                    // Wait, I can just use the update endpoint logic but as a GET? No.
                    // Let's check if I can add getBookingById to backend. It's better.
                    // But I want to avoid context switching too much.
                    // Let's assume I'll add it.
                    api.get(`/hotels/${hotelId}/bookings/${bookingId}/activities`)
                ]);

                // Temporary workaround: Fetch all and find. 
                // Ideally we should have GET /bookings/:id
                const allBookingsRes = await api.get(`/hotels/${hotelId}/bookings`);
                const foundBooking = allBookingsRes.data.data.find((b: any) => b._id === bookingId);

                setBooking(foundBooking);
                setActivities(activitiesRes.data);
            } catch (error) {
                console.error('Error fetching booking details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (hotelId && bookingId) {
            fetchData();
        }
    }, [hotelId, bookingId]);

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!booking) {
        return <div>Booking not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/hotel/${hotelId}/bookings`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Booking Details</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Guest Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name</span>
                                <span className="font-medium">{booking.guestId?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email</span>
                                <span className="font-medium">{booking.guestId?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone</span>
                                <span className="font-medium">{booking.guestId?.phone}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <Badge>{booking.status}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Room Type</span>
                                <span className="font-medium">{booking.roomTypeId?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Room</span>
                                <span className="font-medium">{booking.roomId?.number || 'Not Assigned'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Check In</span>
                                <span className="font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Check Out</span>
                                <span className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Amount</span>
                                <span className="font-medium">${booking.totalAmount}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Activity Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BookingTimeline activities={activities} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BookingDetails;
