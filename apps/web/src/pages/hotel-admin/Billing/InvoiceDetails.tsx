import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const InvoiceDetails: React.FC = () => {
    const { hotelId, id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<any>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>("CASH");

    useEffect(() => {
        fetchInvoice();
    }, [hotelId, id]);

    const fetchInvoice = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/invoices/${id}`);
            setInvoice(response.data);
            setPaymentAmount(response.data.totalAmount - response.data.paidAmount);
        } catch (error) {
            console.error('Error fetching invoice:', error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handlePayment = async () => {
        try {
            await api.post(`/hotels/${hotelId}/invoices/${id}/pay`, {
                amount: paymentAmount,
                method: paymentMethod
            });
            setIsPaymentOpen(false);
            fetchInvoice();
        } catch (error) {
            console.error('Error recording payment:', error);
            alert('Failed to record payment');
        }
    };

    if (!invoice) return <div>Loading...</div>;

    const balanceDue = invoice.totalAmount - invoice.paidAmount;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    {invoice.status !== 'PAID' && (
                        <Button onClick={() => setIsPaymentOpen(true)}>
                            <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                        </Button>
                    )}
                </div>
            </div>

            <Card className="print:shadow-none print:border-none">
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl">INVOICE</CardTitle>
                        <div className="text-muted-foreground mt-1">#{invoice._id.slice(-6)}</div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg">Hotel Name</div>
                        <div className="text-sm text-muted-foreground">123 Hotel Street</div>
                        <div className="text-sm text-muted-foreground">City, Country</div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Bill To:</div>
                            <div className="font-bold">{invoice.guestId?.name}</div>
                            <div className="text-sm">{invoice.guestId?.email}</div>
                            <div className="text-sm">{invoice.guestId?.phone}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-muted-foreground">Date:</div>
                            <div>{new Date(invoice.createdAt).toLocaleDateString()}</div>
                            <div className="text-sm font-medium text-muted-foreground mt-2">Status:</div>
                            <Badge variant={invoice.status === 'PAID' ? 'default' : 'outline'}>
                                {invoice.status}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.items.map((item: any, idx: number) => (
                                <TableRow key={idx}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{item.type}</TableCell>
                                    <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="flex justify-end">
                        <div className="w-1/3 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${invoice.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Paid</span>
                                <span>${invoice.paidAmount.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Balance Due</span>
                                <span>${balanceDue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="print:hidden text-muted-foreground text-sm justify-center">
                    Thank you for your business!
                </CardFooter>
            </Card>

            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                                max={balanceDue}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                    <SelectItem value="ONLINE">Online</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
                        <Button onClick={handlePayment}>Record Payment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default InvoiceDetails;
