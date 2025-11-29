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
    number: z.coerce.number(),
    name: z.string().min(1),
    block: z.string().optional(),
});

const FloorManagement: React.FC = () => {
    const { hotelId } = useParams();
    const [floors, setFloors] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            number: 0,
            name: "",
            block: "",
        },
    });

    useEffect(() => {
        fetchFloors();
    }, [hotelId]);

    const fetchFloors = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/floors`);
            setFloors(response.data);
        } catch (error) {
            console.error('Error fetching floors:', error);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (editingId) {
                await api.put(`/hotels/${hotelId}/floors/${editingId}`, values);
            } else {
                await api.post(`/hotels/${hotelId}/floors`, values);
            }
            fetchFloors();
            form.reset({ number: 0, name: "", block: "" });
            setEditingId(null);
        } catch (error) {
            console.error('Error saving floor:', error);
        }
    };

    const handleEdit = (floor: any) => {
        setEditingId(floor._id);
        form.reset({
            number: floor.number,
            name: floor.name,
            block: floor.block || "",
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this floor?')) return;
        try {
            await api.delete(`/hotels/${hotelId}/floors/${id}`);
            fetchFloors();
        } catch (error) {
            console.error('Error deleting floor:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        form.reset({ number: 0, name: "", block: "" });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add Floor</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 items-end">
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value as number} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ground Floor" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="block"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Block (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Wing A" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-2">
                                <Button type="submit">{editingId ? 'Update' : 'Add'} Floor</Button>
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
                    <CardTitle>Floors</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Number</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Block</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {floors.map((floor: any) => (
                                <TableRow key={floor._id}>
                                    <TableCell>{floor.number}</TableCell>
                                    <TableCell>{floor.name}</TableCell>
                                    <TableCell>{floor.block || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(floor)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(floor._id)}>Delete</Button>
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

export default FloorManagement;
