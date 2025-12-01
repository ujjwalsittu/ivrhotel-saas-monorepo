import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { authClient } from '@/lib/auth-client';

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Hotel name must be at least 2 characters.",
    }),
    slug: z.string().min(2, {
        message: "Slug must be at least 2 characters.",
    }),
    contactNumber: z.string().min(10, {
        message: "Contact number must be valid.",
    }),
    email: z.string().email(),
    authorizedSignatory: z.object({
        name: z.string().min(2, { message: "Name is required" }),
        phone: z.string().min(10, { message: "Phone is required" }),
    }),
    address: z.object({
        street: z.string().min(2, { message: "Street is required" }),
        city: z.string().min(2, { message: "City is required" }),
        state: z.string().min(2, { message: "State is required" }),
        country: z.string().min(2, { message: "Country is required" }),
        zipCode: z.string().min(5, { message: "Zip Code is required" }),
    }),
    hotelType: z.string(),
    handlingType: z.string(),
});

import { createHotel } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const HotelOnboarding: React.FC = () => {
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
            contactNumber: "",
            email: "",
            authorizedSignatory: {
                name: "",
                phone: ""
            },
            address: {
                street: "",
                city: "",
                state: "",
                country: "",
                zipCode: ""
            },
            hotelType: "Normal",
            handlingType: "Rooms",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // 1. Create Organization
            const orgSlug = values.slug + '-org'; // Simple slug generation
            const { data: org, error: orgError } = await authClient.organization.create({
                name: values.name,
                slug: orgSlug
            });

            if (orgError) {
                console.error("Error creating organization:", orgError);
                alert(`Failed to create organization: ${orgError.message}`);
                return;
            }

            // 2. Create Hotel linked to Organization
            // Add default planId for now (should be selected from UI later)
            const data = {
                ...values,
                organizationId: org?.id,
                planId: '6566aebc9305139772d2d2d2' // Dummy ID
            };

            const hotel = await createHotel(data);
            console.log('Hotel created:', hotel);
            alert('Hotel created successfully!');
            navigate('/super-admin/hotels');
        } catch (error) {
            console.error('Error creating hotel:', error);
            alert('Failed to create hotel');
        }
    }

    return (
        <Card className="max-w-2xl mx-auto my-8">
            <CardHeader>
                <CardTitle>Onboard New Hotel</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hotel Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Grand Hotel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug (URL)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="grand-hotel" {...field} />
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
                                            <Input placeholder="admin@grandhotel.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contactNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+91 9876543210" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium">Authorized Signatory</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="authorizedSignatory.name"
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
                                    name="authorizedSignatory.phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+91 9876543210" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium">Address</h3>
                            <FormField
                                control={form.control}
                                name="address.street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Main St" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="address.city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Metropolis" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address.state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State</FormLabel>
                                            <FormControl>
                                                <Input placeholder="NY" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="address.country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="USA" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address.zipCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Zip Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="10001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="hotelType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hotel Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Lodging">Lodging</SelectItem>
                                                <SelectItem value="Normal">Normal</SelectItem>
                                                <SelectItem value="Premium">Premium</SelectItem>
                                                <SelectItem value="Luxe">Luxe</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="handlingType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Handling Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select handling" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Rooms">Rooms Only</SelectItem>
                                                <SelectItem value="Rooms with Kitchen">Rooms + Kitchen</SelectItem>
                                                <SelectItem value="Full Service">Full Service</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full">Create Hotel</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default HotelOnboarding;
