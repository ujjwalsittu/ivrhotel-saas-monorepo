import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
} from '@/components/ui/form';

const formSchema = z.object({
    name: z.string().min(1),
    basePrice: z.coerce.number().min(0),
    maxOccupancy: z.object({
        adults: z.coerce.number().min(1),
        children: z.coerce.number().min(0),
    }),
});



const RoomTypeManagement: React.FC = () => {
    const { hotelId } = useParams();
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            basePrice: 0,
            maxOccupancy: {
                adults: 2,
                children: 1,
            },
        },
    });

    useEffect(() => {
        fetchRoomTypes();
    }, [hotelId]);

    const fetchRoomTypes = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/room-types`);
            setRoomTypes(response.data);
        } catch (error) {
            console.error('Error fetching room types:', error);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (editingId) {
                await api.put(`/hotels/${hotelId}/room-types/${editingId}`, values);
            } else {
                await api.post(`/hotels/${hotelId}/room-types`, values);
            }
            fetchRoomTypes();
            form.reset({
                name: "",
                basePrice: 0,
                maxOccupancy: { adults: 2, children: 1 },
            });
            setEditingId(null);
        } catch (error) {
            console.error('Error saving room type:', error);
        }
    };

    const handleEdit = (type: any) => {
        setEditingId(type._id);
        form.reset({
            name: type.name,
            basePrice: type.basePrice,
            maxOccupancy: {
                adults: type.maxOccupancy.adults,
                children: type.maxOccupancy.children,
            },
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this room type?')) return;
        try {
            await api.delete(`/hotels/${hotelId}/room-types/${id}`);
            fetchRoomTypes();
        } catch (error) {
            console.error('Error deleting room type:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        form.reset({
            name: "",
            basePrice: 0,
            maxOccupancy: { adults: 2, children: 1 },
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add Room Type</CardTitle>
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
                                                <Input placeholder="Deluxe Room" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="basePrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Base Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} value={field.value as number} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="maxOccupancy.adults"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Adults</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} value={field.value as number} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="maxOccupancy.children"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Children</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} value={field.value as number} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">{editingId ? 'Update' : 'Add'} Room Type</Button>
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
                    <CardTitle>Room Types</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Base Price</TableHead>
                                <TableHead>Max Occupancy</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roomTypes.map((type: any) => (
                                <TableRow key={type._id}>
                                    <TableCell>{type.name}</TableCell>
                                    <TableCell>{type.basePrice}</TableCell>
                                    <TableCell>{type.maxOccupancy.adults} Adults, {type.maxOccupancy.children} Children</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(type)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(type._id)}>Delete</Button>
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

export default RoomTypeManagement;
