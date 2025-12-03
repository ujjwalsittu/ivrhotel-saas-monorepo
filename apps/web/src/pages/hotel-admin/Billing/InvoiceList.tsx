import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ivrhotel/ui';
import { Button } from '@ivrhotel/ui';
import { Badge } from '@ivrhotel/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ivrhotel/ui';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@ivrhotel/ui";
import { Label } from "@ivrhotel/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ivrhotel/ui';

const InvoiceList: React.FC = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string>("");

    useEffect(() => {
        fetchInvoices();
        fetchBookings();
    }, [hotelId]);

    const fetchInvoices = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/invoices`);
            setInvoices(response.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };

    const fetchBookings = async () => {
        try {
            // Fetch active bookings or all bookings to generate invoice
            const response = await api.get(`/hotels/${hotelId}/bookings`);
            setBookings(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleGenerateInvoice = async () => {
        if (!selectedBookingId) return;
        try {
            const response = await api.post(`/hotels/${hotelId}/invoices/generate`, { bookingId: selectedBookingId });
            setIsGenerateOpen(false);
            navigate(`/hotel/${hotelId}/invoices/${response.data._id}`);
        } catch (error) {
            console.error('Error generating invoice:', error);
            alert('Failed to generate invoice');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Invoices</h1>
                <Button onClick={() => setIsGenerateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Generate Invoice
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Guest</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice: any) => (
                                <TableRow key={invoice._id}>
                                    <TableCell className="font-medium">#{invoice._id.slice(-6)}</TableCell>
                                    <TableCell>{invoice.guestId?.name}</TableCell>
                                    <TableCell>{invoice.bookingId?.roomId?.number || 'N/A'}</TableCell>
                                    <TableCell>${invoice.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.status === 'PAID' ? 'default' : invoice.status === 'CANCELLED' ? 'destructive' : 'outline'}>
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/hotel/${hotelId}/invoices/${invoice._id}`)}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Booking</Label>
                            <Select onValueChange={setSelectedBookingId} value={selectedBookingId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a booking" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bookings.map((booking) => (
                                        <SelectItem key={booking._id} value={booking._id}>
                                            {booking.guestId?.name} - Room {booking.roomId?.number} ({new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
                        <Button onClick={handleGenerateInvoice} disabled={!selectedBookingId}>Generate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default InvoiceList;
