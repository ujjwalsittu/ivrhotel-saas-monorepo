import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { differenceInCalendarDays } from 'date-fns';

interface ReviewStepProps {
    guest: any;
    roomData: any;
    onConfirm: (data: { totalAmount: number; paymentStatus: string; notes: string }) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ guest, roomData, onConfirm }) => {
    const [notes, setNotes] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const [totalAmount, setTotalAmount] = useState(0);
    const [nights, setNights] = useState(0);

    useEffect(() => {
        if (roomData) {
            const n = differenceInCalendarDays(new Date(roomData.checkOutDate), new Date(roomData.checkInDate));
            setNights(n > 0 ? n : 1); // Minimum 1 night
            setTotalAmount((n > 0 ? n : 1) * roomData.price);
        }
    }, [roomData]);

    // Update parent whenever local state changes, or just on submit? 
    // The parent controls the "Submit" button usually in a wizard.
    // But here I might put the submit button in the parent wizard component.
    // So I need to expose the data to parent.
    // Actually, let's just have the parent read the state or pass a ref?
    // Or better, update parent state on change.

    useEffect(() => {
        onConfirm({ totalAmount, paymentStatus, notes });
    }, [totalAmount, paymentStatus, notes]);

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Guest Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{guest.name}</span>
                        </div>
                        <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Phone:</span>
                            <span className="font-medium">{guest.phone}</span>
                        </div>
                        <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium">{guest.email || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Room & Dates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Room:</span>
                            <span className="font-medium">#{roomData.roomNumber}</span>
                        </div>
                        <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Check-in:</span>
                            <span className="font-medium">{roomData.checkInDate}</span>
                        </div>
                        <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Check-out:</span>
                            <span className="font-medium">{roomData.checkOutDate}</span>
                        </div>
                        <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{nights} Night(s)</span>
                        </div>
                        <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Rate:</span>
                            <span className="font-medium">${roomData.price}/night</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment & Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Total Amount ($)</Label>
                            <Input
                                type="number"
                                value={totalAmount}
                                onChange={(e) => setTotalAmount(Number(e.target.value))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Status</Label>
                            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pending (Pay at Hotel)</SelectItem>
                                    <SelectItem value="PAID">Paid (Pre-paid)</SelectItem>
                                    <SelectItem value="PARTIAL">Partial Deposit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Special requests, arrival time, etc."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
