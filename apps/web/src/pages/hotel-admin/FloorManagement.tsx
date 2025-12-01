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

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const FloorManagement: React.FC = () => {
    const { hotelId } = useParams();
    const [floors, setFloors] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Bulk Creation State
    const [isBulk, setIsBulk] = useState(false);
    const [bulkStart, setBulkStart] = useState(1);
    const [bulkEnd, setBulkEnd] = useState(5);
    const [bulkPattern, setBulkPattern] = useState("Floor {n}");
    const [bulkBlock, setBulkBlock] = useState("");

    // Pagination & Search State
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            number: 0,
            name: "",
            block: "",
        },
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchFloors();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [hotelId, search, page]);

    const fetchFloors = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/hotels/${hotelId}/floors`, {
                params: { search, page, limit: 10 }
            });
            if (response.data.data) {
                setFloors(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
            } else {
                setFloors(response.data); // Fallback
            }
        } catch (error) {
            console.error('Error fetching floors:', error);
        } finally {
            setIsLoading(false);
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

    const handleBulkSubmit = async () => {
        if (bulkEnd < bulkStart) {
            alert("End number must be greater than or equal to start number");
            return;
        }

        const floorsToCreate = [];
        for (let i = bulkStart; i <= bulkEnd; i++) {
            floorsToCreate.push({
                number: i,
                name: bulkPattern.replace("{n}", i.toString()),
                block: bulkBlock || undefined
            });
        }

        try {
            await api.post(`/hotels/${hotelId}/floors/bulk`, floorsToCreate);
            fetchFloors();
            setIsBulk(false);
            alert(`Successfully created ${floorsToCreate.length} floors`);
        } catch (error) {
            console.error('Error creating floors:', error);
            alert('Failed to create floors');
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add Floor</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <Button
                            variant={!isBulk ? "default" : "outline"}
                            onClick={() => setIsBulk(false)}
                        >
                            Single Floor
                        </Button>
                        <Button
                            variant={isBulk ? "default" : "outline"}
                            onClick={() => setIsBulk(true)}
                        >
                            Bulk Create
                        </Button>
                    </div>

                    {!isBulk ? (
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
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-4 items-end">
                                <div>
                                    <FormLabel>Start Number</FormLabel>
                                    <Input
                                        type="number"
                                        value={bulkStart}
                                        onChange={(e) => setBulkStart(parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <FormLabel>End Number</FormLabel>
                                    <Input
                                        type="number"
                                        value={bulkEnd}
                                        onChange={(e) => setBulkEnd(parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <FormLabel>Name Pattern (e.g., Floor {'{n}'})</FormLabel>
                                    <Input
                                        value={bulkPattern}
                                        onChange={(e) => setBulkPattern(e.target.value)}
                                        placeholder="Floor {n}"
                                    />
                                </div>
                                <div>
                                    <FormLabel>Block (Optional)</FormLabel>
                                    <Input
                                        value={bulkBlock}
                                        onChange={(e) => setBulkBlock(e.target.value)}
                                        placeholder="Wing A"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleBulkSubmit}>Generate & Create Floors</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Floors</CardTitle>
                    <div className="w-1/3">
                        <Input
                            placeholder="Search floors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : floors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No floors found</TableCell>
                                </TableRow>
                            ) : (
                                floors.map((floor: any) => (
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

export default FloorManagement;
