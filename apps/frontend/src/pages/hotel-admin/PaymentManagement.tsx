import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, Refund } from 'lucide-react';

interface Payment {
    method: string;
    amount: number;
    status: string;
    date: string;
    razorpayPaymentId?: string;
}

interface Charge {
    type: string;
    description: string;
    amount: number;
    quantity: number;
    date: string;
}

interface Folio {
    _id: string;
    bookingId: string;
    charges: Charge[];
    payments: Payment[];
    totalCharges: number;
    totalPayments: number;
    balance: number;
    status: string;
}

const PaymentManagement: React.FC = () => {
    const { hotelId } = useParams();
    const [folios, setFolios] = useState<Folio[]>([]);
    const [selectedFolio, setSelectedFolio] = useState<Folio | null>(null);
    const [bookingId, setBookingId] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const loadFolios = async () => {
        try {
            // For demo, we'll load recent folios
            // In production, this would be a proper endpoint
            setFolios([]);
        } catch (error) {
            console.error('Error loading folios:', error);
        }
    };

    useEffect(() => {
        loadFolios();
    }, [hotelId]);

    const handleLoadFolio = async () => {
        if (!bookingId) return;

        setLoading(true);
        try {
            const response = await api.get(`/payments/bookings/${bookingId}/folio`);
            setSelectedFolio(response.data);
        } catch (error) {
            alert('Error loading folio');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrder = async () => {
        if (!bookingId || !amount) return;

        setLoading(true);
        try {
            const response = await api.post(`/payments/bookings/${bookingId}/create-order`, {
                amount: parseFloat(amount)
            });

            alert(`Order created! Order ID: ${response.data.orderId}`);
            // In production, open Razorpay checkout
        } catch (error) {
            alert('Error creating order');
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async (paymentId: string) => {
        if (!selectedFolio) return;

        const refundAmount = prompt('Enter refund amount (leave empty for full refund):');

        setLoading(true);
        try {
            await api.post(`/payments/bookings/${selectedFolio.bookingId}/refund`, {
                paymentId,
                amount: refundAmount ? parseFloat(refundAmount) : undefined
            });

            alert('Refund processed successfully');
            handleLoadFolio();
        } catch (error) {
            alert('Error processing refund');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Payment Management</h1>
                <p className="text-muted-foreground">Manage payments and folios</p>
            </div>

            {/* Load Folio */}
            <Card>
                <CardHeader>
                    <CardTitle>Load Folio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Booking ID"
                            value={bookingId}
                            onChange={(e) => setBookingId(e.target.value)}
                        />
                        <Button onClick={handleLoadFolio} disabled={loading}>
                            Load Folio
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Create Payment Order */}
            {selectedFolio && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Create Payment Order
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Amount (INR)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <Button onClick={handleCreateOrder} disabled={loading}>
                                Create Razorpay Order
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Folio Display */}
            {selectedFolio && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Folio Details</CardTitle>
                            <Badge>{selectedFolio.status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Charges */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Charges</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedFolio.charges.map((charge, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Badge variant="outline">{charge.type}</Badge>
                                            </TableCell>
                                            <TableCell>{charge.description}</TableCell>
                                            <TableCell>{charge.quantity}</TableCell>
                                            <TableCell>₹{charge.amount}</TableCell>
                                            <TableCell className="font-semibold">
                                                ₹{charge.amount * charge.quantity}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Payments */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Payments</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedFolio.payments.map((payment, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Badge>{payment.method}</Badge>
                                            </TableCell>
                                            <TableCell>₹{payment.amount}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    payment.status === 'SUCCESS' ? 'default' :
                                                        payment.status === 'PENDING' ? 'secondary' : 'destructive'
                                                }>
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(payment.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {payment.status === 'SUCCESS' && payment.razorpayPaymentId && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRefund(payment.razorpayPaymentId!)}
                                                    >
                                                        <Refund className="h-4 w-4 mr-1" />
                                                        Refund
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Summary */}
                        <div className="border-t pt-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Charges</p>
                                    <p className="text-2xl font-bold">₹{selectedFolio.totalCharges}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Payments</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        ₹{selectedFolio.totalPayments}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    <p className={`text-2xl font-bold ${selectedFolio.balance > 0 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        ₹{selectedFolio.balance}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PaymentManagement;
