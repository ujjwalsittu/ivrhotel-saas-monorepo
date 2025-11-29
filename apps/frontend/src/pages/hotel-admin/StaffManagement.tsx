import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']),
});



const StaffManagement: React.FC = () => {
    const { hotelId } = useParams();
    const [staffList, setStaffList] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "FRONT_DESK",
        },
    });

    useEffect(() => {
        fetchStaff();
    }, [hotelId]);

    const fetchStaff = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/staff`);
            setStaffList(response.data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (editingId) {
                // For update, password is optional if not changed. 
                // But our schema requires it. We might need to adjust schema or handle it.
                // For now, let's assume if password is empty string, we don't send it, 
                // but zod schema requires min(6).
                // Let's just send it for now, user has to re-enter or we change schema dynamically.
                // To keep it simple for MVP, we'll require password for update too or user enters a new one.
                await api.put(`/hotels/${hotelId}/staff/${editingId}`, values);
            } else {
                await api.post(`/hotels/${hotelId}/staff`, values);
            }
            fetchStaff();
            form.reset({ name: "", email: "", password: "", role: "FRONT_DESK" });
            setEditingId(null);
        } catch (error) {
            console.error('Error saving staff:', error);
            alert('Failed to save staff');
        }
    };

    const handleEdit = (staff: any) => {
        setEditingId(staff._id);
        form.reset({
            name: staff.name,
            email: staff.email,
            password: "", // Don't pre-fill password
            role: staff.role,
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this staff member?')) return;
        try {
            await api.delete(`/hotels/${hotelId}/staff/${id}`);
            fetchStaff();
        } catch (error) {
            console.error('Error deleting staff:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        form.reset({ name: "", email: "", password: "", role: "FRONT_DESK" });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add Staff Member</CardTitle>
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
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="john@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="HOTEL_ADMIN">Hotel Admin</SelectItem>
                                                    <SelectItem value="MANAGER">Manager</SelectItem>
                                                    <SelectItem value="FRONT_DESK">Front Desk</SelectItem>
                                                    <SelectItem value="HOUSEKEEPING">Housekeeping</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">{editingId ? 'Update' : 'Add'} Staff</Button>
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
                    <CardTitle>Staff List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staffList.map((staff: any) => (
                                <TableRow key={staff._id}>
                                    <TableCell>{staff.name}</TableCell>
                                    <TableCell>{staff.email}</TableCell>
                                    <TableCell>{staff.role}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(staff)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(staff._id)}>Delete</Button>
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

export default StaffManagement;
