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

const formSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']),
});



import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@ivrhotel/ui";

const StaffManagement: React.FC = () => {
    const { hotelId } = useParams();
    const [staffList, setStaffList] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Pagination & Search State
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

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
        const delayDebounceFn = setTimeout(() => {
            fetchStaff();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [hotelId, search, page]);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/hotels/${hotelId}/staff`, {
                params: { search, page, limit: 10 }
            });
            if (response.data.data) {
                setStaffList(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
            } else {
                setStaffList(response.data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (editingId) {
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Staff List</CardTitle>
                    <div className="w-1/3">
                        <Input
                            placeholder="Search staff..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : staffList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No staff found</TableCell>
                                </TableRow>
                            ) : (
                                staffList.map((staff: any) => (
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
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                isActive={page === i + 1}
                                                onClick={() => setPage(i + 1)}
                                                className="cursor-pointer"
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffManagement;
