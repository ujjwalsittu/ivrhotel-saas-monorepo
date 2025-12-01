import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea";

const ExpenseDashboard: React.FC = () => {
    const { hotelId } = useParams();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [stats, setStats] = useState<any[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({
        category: "UTILITIES",
        amount: 0,
        description: "",
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, [hotelId]);

    const fetchData = async () => {
        try {
            const [expensesRes, statsRes] = await Promise.all([
                api.get(`/hotels/${hotelId}/finance/expenses`),
                api.get(`/hotels/${hotelId}/finance/expenses/stats`)
            ]);
            setExpenses(expensesRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching expense data:', error);
        }
    };

    const handleAddExpense = async () => {
        try {
            // For now, assume current user is paying (backend handles paidBy placeholder if needed)
            // In a real app, we'd pass the user ID from context if not handled by backend middleware
            await api.post(`/hotels/${hotelId}/finance/expenses`, {
                ...newExpense,
                paidBy: "651a2b3c4d5e6f7a8b9c0d1e" // Placeholder ID or get from auth context
            });
            setIsAddOpen(false);
            setNewExpense({ category: "UTILITIES", amount: 0, description: "", date: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Failed to add expense');
        }
    };

    const getTotalExpenses = () => stats.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Expense Tracking</h1>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Expenses</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${getTotalExpenses().toFixed(2)}</div></CardContent>
                </Card>
                {stats.map((stat: any) => (
                    <Card key={stat._id}>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{stat._id}</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">${stat.total.toFixed(2)}</div></CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Paid By</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map((expense: any) => (
                                <TableRow key={expense._id}>
                                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{expense.category}</TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                                    <TableCell>{expense.paidBy?.name || 'Unknown'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Expense</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select onValueChange={(val) => setNewExpense({ ...newExpense, category: val })} value={newExpense.category}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UTILITIES">Utilities</SelectItem>
                                        <SelectItem value="INVENTORY">Inventory</SelectItem>
                                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                        <SelectItem value="SALARY">Salary</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={newExpense.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewExpense({ ...newExpense, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddExpense}>Add Expense</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ExpenseDashboard;
