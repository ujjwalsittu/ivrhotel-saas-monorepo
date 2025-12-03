import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, UserPlus, Check } from 'lucide-react';
// Actually I don't have api client file path confirmed, I'll use axios for now or check if I can find it.
// Previous context mentioned `apps/web/src/services/api.ts` or similar.
// Let's use axios for now and I can refactor to use the shared client if I find it.
import axios from 'axios';
import { useParams } from 'react-router-dom';

const guestSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
    phone: z.string().min(10, "Phone number is required"),
    address: z.string().optional(),
});

type GuestFormValues = z.infer<typeof guestSchema>;

interface GuestStepProps {
    onSelect: (guest: GuestFormValues & { id?: string }) => void;
    selectedGuest?: GuestFormValues & { id?: string };
}

export const GuestStep: React.FC<GuestStepProps> = ({ onSelect, selectedGuest }) => {
    const { hotelId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const form = useForm<GuestFormValues>({
        resolver: zodResolver(guestSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: ''
        }
    });

    const handleSearch = async () => {
        if (!searchTerm) return;
        setIsSearching(true);
        try {
            // TODO: Implement guest search API endpoint
            // For now, we'll mock or assume an endpoint exists.
            // If not, we might need to add it to API.
            // Let's assume GET /hotels/:hotelId/guests?search=...
            const res = await axios.get(`http://localhost:4000/api/hotels/${hotelId}/guests?search=${searchTerm}`, {
                withCredentials: true
            });
            setSearchResults(res.data.data || []);
        } catch (error) {
            console.error("Search failed", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCreate = (data: GuestFormValues) => {
        onSelect(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <Label>Search Guest (Phone or Email)</Label>
                    <div className="flex gap-2 mt-1">
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Enter phone or email..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={isSearching}>
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                    </div>
                </div>
                <Button variant="outline" onClick={() => setIsCreating(!isCreating)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isCreating ? 'Cancel Creation' : 'Create New Guest'}
                </Button>
            </div>

            {/* Search Results */}
            {!isCreating && searchResults.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                    {searchResults.map((guest) => (
                        <Card key={guest._id} className={`cursor-pointer hover:border-primary ${selectedGuest?.id === guest._id ? 'border-primary bg-primary/5' : ''}`} onClick={() => onSelect({ ...guest, id: guest._id })}>
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{guest.name}</p>
                                    <p className="text-sm text-muted-foreground">{guest.phone}</p>
                                    <p className="text-sm text-muted-foreground">{guest.email}</p>
                                </div>
                                {selectedGuest?.id === guest._id && <Check className="w-5 h-5 text-primary" />}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create New Guest Form */}
            {isCreating && (
                <Card>
                    <CardHeader>
                        <CardTitle>New Guest Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input {...form.register('name')} placeholder="John Doe" />
                                    {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input {...form.register('phone')} placeholder="+1234567890" />
                                    {form.formState.errors.phone && <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Email (Optional)</Label>
                                    <Input {...form.register('email')} placeholder="john@example.com" />
                                    {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Address (Optional)</Label>
                                    <Input {...form.register('address')} placeholder="123 Main St" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">Use This Guest</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Selected Guest Summary (if not creating and not searching) */}
            {!isCreating && selectedGuest && (
                <Card className="border-primary bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg">Selected Guest</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Name</Label>
                                <p className="font-medium">{selectedGuest.name}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Phone</Label>
                                <p className="font-medium">{selectedGuest.phone}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Email</Label>
                                <p className="font-medium">{selectedGuest.email || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
