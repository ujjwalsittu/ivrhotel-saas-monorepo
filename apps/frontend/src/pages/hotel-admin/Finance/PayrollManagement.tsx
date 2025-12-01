import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PayrollManagement: React.FC = () => {
    const { hotelId } = useParams();
    const [payrolls, setPayrolls] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [newPayroll, setNewPayroll] = useState({
        staffId: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: 0,
        bonuses: 0,
        deductions: 0
    });

    useEffect(() => {
        fetchData();
        fetchStaff();
    }, [hotelId]);

    const fetchData = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/finance/payroll`);
            setPayrolls(response.data);
        } catch (error) {
            console.error('Error fetching payrolls:', error);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/staff`);
            setStaff(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const handleGeneratePayroll = async () => {
        try {
            await api.post(`/hotels/${hotelId}/finance/payroll`, newPayroll);
            setIsGenerateOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error generating payroll:', error);
            alert('Failed to generate payroll');
        }
    };

    const handleMarkPaid = async (id: string) => {
        if (!confirm('Are you sure you want to mark this as PAID? This will create an expense record.')) return;
        try {
            await api.put(`/hotels/${hotelId}/finance/payroll/${id}/pay`, {
                paidBy: "651a2b3c4d5e6f7a8b9c0d1e" // Placeholder
            });
            fetchData();
        } catch (error) {
            console.error('Error marking paid:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Payroll Management</h1>
                <Button onClick={() => setIsGenerateOpen(true)}>Generate Payroll</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payroll History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Basic</TableHead>
                                <TableHead>Net Salary</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payrolls.map((payroll: any) => (
                                <TableRow key={payroll._id}>
                                    <TableCell>
                                        <div className="font-medium">{payroll.staffId?.name}</div>
                                        <div className="text-sm text-muted-foreground">{payroll.staffId?.role}</div>
                                    </TableCell>
                                    <TableCell>{payroll.month}/{payroll.year}</TableCell>
                                    <TableCell>${payroll.basicSalary}</TableCell>
                                    <TableCell className="font-bold">${payroll.netSalary}</TableCell>
                                    <TableCell>
                                        <Badge variant={payroll.status === 'PAID' ? 'default' : 'outline'}>
                                            {payroll.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {payroll.status === 'PENDING' && (
                                            <Button size="sm" onClick={() => handleMarkPaid(payroll._id)}>Mark Paid</Button>
                                        )}
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
                        <DialogTitle>Generate Payroll</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Staff Member</Label>
                            <Select onValueChange={(val) => setNewPayroll({ ...newPayroll, staffId: val })} value={newPayroll.staffId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    {staff.map((s) => (
                                        <SelectItem key={s._id} value={s._id}>
                                            {s.name} ({s.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Month</Label>
                                <Input
                                    type="number"
                                    min={1} max={12}
                                    value={newPayroll.month}
                                    onChange={(e) => setNewPayroll({ ...newPayroll, month: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Year</Label>
                                <Input
                                    type="number"
                                    value={newPayroll.year}
                                    onChange={(e) => setNewPayroll({ ...newPayroll, year: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Basic Salary</Label>
                                <Input
                                    type="number"
                                    value={newPayroll.basicSalary}
                                    onChange={(e) => setNewPayroll({ ...newPayroll, basicSalary: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bonuses</Label>
                                <Input
                                    type="number"
                                    value={newPayroll.bonuses}
                                    onChange={(e) => setNewPayroll({ ...newPayroll, bonuses: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Deductions</Label>
                                <Input
                                    type="number"
                                    value={newPayroll.deductions}
                                    onChange={(e) => setNewPayroll({ ...newPayroll, deductions: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="text-right font-bold">
                            Net Salary: ${(newPayroll.basicSalary + newPayroll.bonuses - newPayroll.deductions).toFixed(2)}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
                        <Button onClick={handleGeneratePayroll} disabled={!newPayroll.staffId}>Generate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PayrollManagement;
