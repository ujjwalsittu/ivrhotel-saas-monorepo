import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ivrhotel/ui';
import { Button } from '@ivrhotel/ui';
import { Input } from '@ivrhotel/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ivrhotel/ui';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ivrhotel/ui';
import { Checkbox } from '@ivrhotel/ui';

const planSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.coerce.number().min(0),
    currency: z.string().default('USD'),
    interval: z.enum(['MONTHLY', 'YEARLY']),
    modules: z.array(z.object({
        name: z.string(),
        enabled: z.boolean(),
        limits: z.any().optional(),
    })),
    isActive: z.boolean().default(true),
});

const PlanManagement: React.FC = () => {
    const [plans, setPlans] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm<z.infer<typeof planSchema>>({
        resolver: zodResolver(planSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            currency: "USD",
            interval: "MONTHLY",
            modules: [
                { name: "PMS", enabled: true },
                { name: "POS", enabled: false },
                { name: "CHANNEL_MANAGER", enabled: false }
            ],
            isActive: true,
        },
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get('/plans');
            setPlans(response.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    const onSubmit = async (values: z.infer<typeof planSchema>) => {
        try {
            if (editingId) {
                await api.put(`/plans/${editingId}`, values);
            } else {
                await api.post('/plans', values);
            }
            fetchPlans();
            form.reset();
            setEditingId(null);
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Failed to save plan');
        }
    };

    const handleEdit = (plan: any) => {
        setEditingId(plan._id);
        form.reset({
            name: plan.name,
            description: plan.description,
            price: plan.price,
            currency: plan.currency,
            interval: plan.interval,
            modules: plan.modules,
            isActive: plan.isActive,
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        try {
            await api.delete(`/plans/${id}`);
            fetchPlans();
        } catch (error) {
            console.error('Error deleting plan:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        form.reset();
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{editingId ? 'Edit Plan' : 'Create New Plan'}</CardTitle>
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
                                            <FormLabel>Plan Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Basic Plan" {...field} />
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
                                    name="interval"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Billing Interval</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select interval" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                    <SelectItem value="YEARLY">Yearly</SelectItem>
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
                                                <Input placeholder="Description" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <FormLabel>Modules</FormLabel>
                                <div className="flex gap-4">
                                    {form.watch('modules')?.map((module, index) => (
                                        <FormField
                                            key={module.name}
                                            control={form.control}
                                            name={`modules.${index}.enabled`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value as boolean}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            {module.name}
                                                        </FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">{editingId ? 'Update' : 'Create'} Plan</Button>
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
                    <CardTitle>Plans</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Interval</TableHead>
                                <TableHead>Modules</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans.map((plan: any) => (
                                <TableRow key={plan._id}>
                                    <TableCell>{plan.name}</TableCell>
                                    <TableCell>{plan.currency} {plan.price}</TableCell>
                                    <TableCell>{plan.interval}</TableCell>
                                    <TableCell>
                                        {plan.modules.filter((m: any) => m.enabled).map((m: any) => m.name).join(', ')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(plan._id)}>Delete</Button>
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

export default PlanManagement;
