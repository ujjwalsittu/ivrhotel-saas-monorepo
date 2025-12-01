import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BedDouble, LogIn, LogOut, CalendarCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const Dashboard: React.FC = () => {
    const { hotelId } = useParams<{ hotelId: string }>();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get(`/hotels/${hotelId}/dashboard/stats`);
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (hotelId) {
            fetchStats();
        }
    }, [hotelId]);

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    if (!stats) {
        return <div>Error loading dashboard data.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.rooms.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.rooms.available} Available, {stats.rooms.occupied} Occupied
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Check-Ins Today</CardTitle>
                        <LogIn className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.bookings.todayCheckIns}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.bookings.pendingCheckIns} Pending
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Check-Outs Today</CardTitle>
                        <LogOut className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.bookings.todayCheckOuts}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.bookings.pendingCheckOuts} Pending
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Room Status</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.rooms.dirty}</div>
                        <p className="text-xs text-muted-foreground">
                            Dirty Rooms (Needs Cleaning)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Guest</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.recentBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No recent bookings</TableCell>
                                </TableRow>
                            ) : (
                                stats.recentBookings.map((booking: any) => (
                                    <TableRow key={booking._id}>
                                        <TableCell>
                                            <div className="font-medium">{booking.guestId?.name || 'Unknown'}</div>
                                            <div className="text-sm text-muted-foreground">{booking.guestId?.email}</div>
                                        </TableCell>
                                        <TableCell>{booking.roomId?.number || 'Unassigned'}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                booking.status === 'CHECKED_IN' ? 'default' :
                                                    booking.status === 'CONFIRMED' ? 'secondary' :
                                                        booking.status === 'CHECKED_OUT' ? 'outline' : 'destructive'
                                            }>
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(booking.checkOutDate).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
