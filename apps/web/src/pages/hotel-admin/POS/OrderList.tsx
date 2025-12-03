import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ivrhotel/ui';
import { Badge } from '@ivrhotel/ui';
import { Button } from '@ivrhotel/ui';
import { Loader2, Clock, CheckCircle2, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    tableNumber?: string;
    notes?: string;
    status: 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
    items: OrderItem[];
    totalAmount: number;
    createdAt: string;
}

const OrderList: React.FC = () => {
    const { hotelId } = useParams();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [hotelId]);

    const fetchOrders = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/pos/orders`);
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            await api.put(`/hotels/${hotelId}/pos/orders/${orderId}`, { status: newStatus });
            toast.success(`Order marked as ${newStatus}`);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500';
            case 'PREPARING': return 'bg-blue-500';
            case 'COMPLETED': return 'bg-green-500';
            case 'CANCELLED': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
    const completedOrders = orders.filter(o => o.status === 'COMPLETED').slice(0, 10); // Show last 10 completed

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <ChefHat className="h-6 w-6" />
                    Kitchen Display System
                </h2>

                {activeOrders.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                        <p className="text-muted-foreground">No active orders</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeOrders.map(order => (
                            <Card key={order._id} className="border-2 border-muted">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
                                            </CardTitle>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(order.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="font-medium">{item.quantity}x {item.name}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {order.notes && (
                                            <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-100">
                                                <span className="font-bold">Note:</span> {order.notes}
                                            </div>
                                        )}

                                        <div className="pt-4 flex gap-2">
                                            {order.status === 'PENDING' && (
                                                <Button
                                                    className="w-full"
                                                    onClick={() => updateStatus(order._id, 'PREPARING')}
                                                >
                                                    Start Preparing
                                                </Button>
                                            )}
                                            {order.status === 'PREPARING' && (
                                                <Button
                                                    className="w-full bg-green-600 hover:bg-green-700"
                                                    onClick={() => updateStatus(order._id, 'COMPLETED')}
                                                >
                                                    Mark Ready
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {completedOrders.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-muted-foreground">Recently Completed</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-75">
                        {completedOrders.map(order => (
                            <Card key={order._id} className="bg-muted/50">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">
                                            {order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
                                        </span>
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        {order.items.length} items • {new Date(order.createdAt).toLocaleTimeString()}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderList;
