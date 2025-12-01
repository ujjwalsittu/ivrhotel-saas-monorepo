import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

const OrderTaking: React.FC = () => {
    const { hotelId } = useParams();
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string>("");
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

    useEffect(() => {
        fetchMenuItems();
        fetchRooms();
    }, [hotelId]);

    const fetchMenuItems = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/pos/menu-items`);
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/rooms?status=OCCUPIED`);
            setRooms(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.menuItemId === item._id);
            if (existing) {
                return prev.map(i => i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.menuItemId !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.menuItemId === itemId) {
                const newQty = i.quantity + delta;
                return newQty > 0 ? { ...i, quantity: newQty } : i;
            }
            return i;
        }));
    };

    const placeOrder = async () => {
        if (cart.length === 0) return;
        try {
            const payload = {
                roomId: selectedRoomId || undefined,
                items: cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
            };
            await api.post(`/hotels/${hotelId}/pos/orders`, payload);
            alert('Order placed successfully!');
            setCart([]);
            setSelectedRoomId("");
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order');
        }
    };

    const filteredItems = categoryFilter === "ALL"
        ? menuItems
        : menuItems.filter(i => i.category === categoryFilter);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            {/* Menu Section */}
            <div className="col-span-2 space-y-4 overflow-y-auto pr-2">
                <div className="flex gap-2">
                    {['ALL', 'FOOD', 'BEVERAGE', 'SERVICE', 'OTHER'].map(cat => (
                        <Button
                            key={cat}
                            variant={categoryFilter === cat ? "default" : "outline"}
                            onClick={() => setCategoryFilter(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {filteredItems.map((item: any) => (
                        <Card key={item._id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => addToCart(item)}>
                            <CardContent className="p-4 flex flex-col justify-between h-full">
                                <div>
                                    <div className="font-bold text-lg">{item.name}</div>
                                    <div className="text-sm text-muted-foreground line-clamp-2">{item.description}</div>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="font-bold">${item.price}</span>
                                    <Button size="sm" variant="ghost"><Plus className="h-4 w-4" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Cart Section */}
            <div className="col-span-1 border-l pl-4 flex flex-col h-full">
                <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Current Order</h2>
                    <Select onValueChange={setSelectedRoomId} value={selectedRoomId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Room (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            {rooms.map((room) => (
                                <SelectItem key={room._id} value={room._id}>
                                    Room {room.number}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10">Cart is empty</div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.menuItemId} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-muted-foreground">${item.price} x {item.quantity}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.menuItemId, -1)}><Minus className="h-3 w-3" /></Button>
                                    <span className="w-4 text-center">{item.quantity}</span>
                                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.menuItemId, 1)}><Plus className="h-3 w-3" /></Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.menuItemId)}><Trash2 className="h-3 w-3" /></Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-auto pt-4 border-t">
                    <div className="flex justify-between text-lg font-bold mb-4">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={placeOrder}>
                        Place Order
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrderTaking;
