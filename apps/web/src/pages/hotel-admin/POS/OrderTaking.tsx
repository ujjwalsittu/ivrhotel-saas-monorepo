import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    isAvailable: boolean;
}

interface CartItem extends MenuItem {
    quantity: number;
}

const OrderTaking: React.FC = () => {
    const { hotelId } = useParams();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [tableNumber, setTableNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMenuItems();
    }, [hotelId]);

    const fetchMenuItems = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/pos/menu-items`);
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i._id !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i._id === itemId) {
                const newQuantity = Math.max(0, i.quantity + delta);
                return { ...i, quantity: newQuantity };
            }
            return i;
        }).filter(i => i.quantity > 0));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        if (!tableNumber) {
            toast.error('Please enter a table number');
            return;
        }

        setSubmitting(true);
        try {
            const orderData = {
                items: cart.map(item => ({
                    menuItemId: item._id,
                    quantity: item.quantity
                })),
                tableNumber,
                notes
            };

            await api.post(`/hotels/${hotelId}/pos/orders`, orderData);
            toast.success('Order placed successfully');
            setCart([]);
            setTableNumber('');
            setNotes('');
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredItems = selectedCategory === 'ALL'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    const categories = ['ALL', 'FOOD', 'BEVERAGE', 'SERVICE', 'OTHER'];

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="flex h-[calc(100vh-100px)] gap-4">
            {/* Menu Section */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Menu</h1>
                    <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                        <TabsList>
                            {categories.map(cat => (
                                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                <ScrollArea className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                        {filteredItems.map(item => (
                            <Card
                                key={item._id}
                                className={`cursor-pointer transition-all hover:shadow-md ${!item.isAvailable ? 'opacity-50 grayscale' : ''}`}
                                onClick={() => item.isAvailable && addToCart(item)}
                            >
                                <div className="aspect-video w-full bg-muted relative overflow-hidden rounded-t-lg">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                                    )}
                                    {!item.isAvailable && (
                                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                            <Badge variant="destructive">Unavailable</Badge>
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                                        <span className="font-bold">${item.price}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Cart Section */}
            <Card className="w-[350px] flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Current Order
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Table Number</label>
                            <Input
                                placeholder="e.g. T-12"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="space-y-4 py-4">
                            {cart.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    Cart is empty
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item._id} className="flex items-center justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{item.name}</div>
                                            <div className="text-xs text-muted-foreground">${item.price} x {item.quantity}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item._id, -1)}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="text-sm w-4 text-center">{item.quantity}</span>
                                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item._id, 1)}>
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    <div className="space-y-4 pt-4 border-t mt-auto">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea
                                placeholder="Special instructions..."
                                className="h-20 resize-none"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handlePlaceOrder}
                            disabled={cart.length === 0 || submitting}
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Place Order
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrderTaking;
