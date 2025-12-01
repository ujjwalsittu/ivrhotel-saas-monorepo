import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const OrderList: React.FC = () => {
    const { hotelId } = useParams();
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [hotelId]);

    const fetchOrders = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/pos/orders`);
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/hotels/${hotelId}/pos/orders/${id}`, { status });
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
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

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Kitchen Display System</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order: any) => (
                    <Card key={order._id} className="border-2">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">
                                {order.roomId ? `Room ${order.roomId.number}` : 'Walk-in'}
                            </CardTitle>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground mb-4">
                                {new Date(order.createdAt).toLocaleTimeString()}
                            </div>

                            <div className="space-y-2 mb-4">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between">
                                        <span>{item.quantity}x {item.name}</span>
                                        <span className="text-muted-foreground">${item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-2 flex justify-between font-bold mb-4">
                                <span>Total</span>
                                <span>${order.totalAmount}</span>
                            </div>

                            <div className="flex gap-2">
                                {order.status === 'PENDING' && (
                                    <Button className="w-full" onClick={() => updateStatus(order._id, 'PREPARING')}>
                                        Start Preparing
                                    </Button>
                                )}
                                {order.status === 'PREPARING' && (
                                    <Button className="w-full" variant="default" onClick={() => updateStatus(order._id, 'COMPLETED')}>
                                        Mark Ready
                                    </Button>
                                )}
                                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                                    <Button variant="destructive" size="icon" onClick={() => updateStatus(order._id, 'CANCELLED')}>
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default OrderList;
