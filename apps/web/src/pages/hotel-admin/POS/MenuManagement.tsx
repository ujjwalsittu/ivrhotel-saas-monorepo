import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ivrhotel/ui';
import { Button } from '@ivrhotel/ui';
import { Input } from '@ivrhotel/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ivrhotel/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ivrhotel/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@ivrhotel/ui';
import { Checkbox } from '@ivrhotel/ui';

const formSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.coerce.number().min(0),
    category: z.enum(['FOOD', 'BEVERAGE', 'SERVICE', 'OTHER']),
    imageUrl: z.string().optional(),
    isAvailable: z.boolean().default(true),
});

const MenuManagement: React.FC = () => {
    const { hotelId } = useParams();
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            category: "FOOD" as const,
            imageUrl: "",
            isAvailable: true,
        },
    });

    useEffect(() => {
        fetchMenuItems();
    }, [hotelId]);

    const fetchMenuItems = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/pos/menu-items`);
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (editingId) {
                await api.put(`/hotels/${hotelId}/pos/menu-items/${editingId}`, values);
            } else {
                await api.post(`/hotels/${hotelId}/pos/menu-items`, values);
            }
            fetchMenuItems();
            form.reset({
                name: "",
                description: "",
                price: 0,
                category: "FOOD",
                imageUrl: "",
                isAvailable: true,
            });
            setEditingId(null);
        } catch (error) {
            console.error('Error saving menu item:', error);
            alert('Failed to save menu item');
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item._id);
        form.reset({
            name: item.name,
            description: item.description || "",
            price: item.price,
            category: item.category,
            imageUrl: item.imageUrl || "",
            isAvailable: item.isAvailable,
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/hotels/${hotelId}/pos/menu-items/${id}`);
            fetchMenuItems();
        } catch (error) {
            console.error('Error deleting menu item:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        form.reset({
            name: "",
            description: "",
            price: 0,
            category: "FOOD",
            imageUrl: "",
            isAvailable: true,
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{editingId ? 'Edit Menu Item' : 'Add Menu Item'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Burger" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="FOOD">Food</SelectItem>
                                                    <SelectItem value="BEVERAGE">Beverage</SelectItem>
                                                    <SelectItem value="SERVICE">Service</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Delicious beef burger" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com/image.jpg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="isAvailable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Available
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-2">
                                <Button type="submit">{editingId ? 'Update' : 'Create'} Item</Button>
                                {editingId && (
                                    <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Menu Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {menuItems.map((item: any) => (
                                <TableRow key={item._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {item.imageUrl && (
                                                <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-md object-cover" />
                                            )}
                                            <div>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-sm text-muted-foreground">{item.description}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>${item.price}</TableCell>
                                    <TableCell>{item.isAvailable ? 'Available' : 'Unavailable'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(item._id)}>Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default MenuManagement;
