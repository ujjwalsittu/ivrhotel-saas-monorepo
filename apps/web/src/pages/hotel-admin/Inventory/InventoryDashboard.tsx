import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ivrhotel/ui';
import { Button } from '@ivrhotel/ui';
import { Input } from '@ivrhotel/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ivrhotel/ui';
import { Badge } from '@ivrhotel/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@ivrhotel/ui";
import { Label } from "@ivrhotel/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ivrhotel/ui';
import { Loader2, Plus, Minus, AlertTriangle, Package } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
    _id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    minStockLevel: number;
    costPrice: number;
}

const InventoryDashboard: React.FC = () => {
    const { hotelId } = useParams();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [transactionType, setTransactionType] = useState<'IN' | 'OUT'>('IN');

    // Forms
    const [newItem, setNewItem] = useState({
        name: "",
        category: "OTHER",
        quantity: 0,
        unit: "pcs",
        minStockLevel: 10,
        costPrice: 0
    });

    const [transaction, setTransaction] = useState({
        quantity: 1,
        reason: ""
    });

    useEffect(() => {
        fetchItems();
    }, [hotelId]);

    const fetchItems = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/inventory/items`);
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateItem = async () => {
        try {
            await api.post(`/hotels/${hotelId}/inventory/items`, newItem);
            toast.success('Item created successfully');
            setIsCreateOpen(false);
            setNewItem({ name: "", category: "OTHER", quantity: 0, unit: "pcs", minStockLevel: 10, costPrice: 0 });
            fetchItems();
        } catch (error) {
            console.error('Error creating item:', error);
            toast.error('Failed to create item');
        }
    };

    const handleTransaction = async () => {
        if (!selectedItem) return;
        try {
            await api.post(`/hotels/${hotelId}/inventory/transactions`, {
                itemId: selectedItem._id,
                type: transactionType,
                quantity: Number(transaction.quantity),
                reason: transaction.reason
            });
            toast.success('Stock updated successfully');
            setIsTransactionOpen(false);
            setTransaction({ quantity: 1, reason: "" });
            fetchItems();
        } catch (error: any) {
            console.error('Error updating stock:', error);
            toast.error(error.response?.data?.message || 'Failed to update stock');
        }
    };

    const openTransactionModal = (item: InventoryItem, type: 'IN' | 'OUT') => {
        setSelectedItem(item);
        setTransactionType(type);
        setTransaction({ quantity: 1, reason: "" });
        setIsTransactionOpen(true);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    const lowStockItems = items.filter(i => i.quantity <= i.minStockLevel);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Package className="h-8 w-8" />
                    Inventory & Stores
                </h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                </Button>
            </div>

            {lowStockItems.length > 0 && (
                <Card className="border-yellow-500 bg-yellow-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-yellow-700 flex items-center gap-2 text-lg">
                            <AlertTriangle className="h-5 w-5" />
                            Low Stock Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {lowStockItems.map(item => (
                                <Badge key={item._id} variant="outline" className="bg-white text-yellow-700 border-yellow-300">
                                    {item.name}: {item.quantity} {item.unit} (Min: {item.minStockLevel})
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Stock Levels</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Cost Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell className="font-bold text-lg">{item.quantity}</TableCell>
                                    <TableCell>{item.unit}</TableCell>
                                    <TableCell>${item.costPrice}</TableCell>
                                    <TableCell>
                                        {item.quantity <= item.minStockLevel ? (
                                            <Badge variant="destructive">Low Stock</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openTransactionModal(item, 'IN')}>
                                                <Plus className="h-3 w-3 mr-1" /> In
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => openTransactionModal(item, 'OUT')}>
                                                <Minus className="h-3 w-3 mr-1" /> Out
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Item Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Inventory Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Soap" />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={newItem.category} onValueChange={val => setNewItem({ ...newItem, category: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HOUSEKEEPING">Housekeeping</SelectItem>
                                        <SelectItem value="KITCHEN">Kitchen</SelectItem>
                                        <SelectItem value="OFFICE">Office</SelectItem>
                                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Initial Quantity</Label>
                                <Input type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit</Label>
                                <Input value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} placeholder="pcs, kg, etc." />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Stock Level</Label>
                                <Input type="number" value={newItem.minStockLevel} onChange={e => setNewItem({ ...newItem, minStockLevel: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Cost Price</Label>
                                <Input type="number" value={newItem.costPrice} onChange={e => setNewItem({ ...newItem, costPrice: Number(e.target.value) })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateItem}>Create Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Transaction Dialog */}
            <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{transactionType === 'IN' ? 'Stock In' : 'Stock Out'} - {selectedItem?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Quantity ({selectedItem?.unit})</Label>
                            <Input
                                type="number"
                                min="1"
                                value={transaction.quantity}
                                onChange={e => setTransaction({ ...transaction, quantity: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Reason (Optional)</Label>
                            <Input
                                value={transaction.reason}
                                onChange={e => setTransaction({ ...transaction, reason: e.target.value })}
                                placeholder={transactionType === 'IN' ? 'Purchase, Return...' : 'Usage, Damaged...'}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTransactionOpen(false)}>Cancel</Button>
                        <Button onClick={handleTransaction}>{transactionType === 'IN' ? 'Add Stock' : 'Issue Stock'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default InventoryDashboard;
