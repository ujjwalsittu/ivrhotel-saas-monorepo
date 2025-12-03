import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import api from '@/services/api';

interface Hotel {
    _id: string;
    name: string;
    slug: string;
    address: { city: string };
}

export function SwitchHotel() {
    const navigate = useNavigate();
    const { hotelId } = useParams();
    const [open, setOpen] = useState(false);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const res = await api.get('/hotels/my-hotels');
                setHotels(res.data);

                if (hotelId) {
                    const current = res.data.find((h: Hotel) => h._id === hotelId);
                    if (current) setSelectedHotel(current);
                }
            } catch (error) {
                console.error('Error fetching hotels:', error);
            }
        };
        fetchHotels();
    }, [hotelId]);

    const handleSelect = (hotel: Hotel) => {
        setSelectedHotel(hotel);
        setOpen(false);
        // Navigate to the dashboard of the selected hotel
        // Preserving the current page path if possible would be nice, but for now redirect to dashboard root
        navigate(`/hotels/${hotel._id}/dashboard`);
    };

    if (hotels.length <= 1) return null; // Don't show if user only has access to 1 hotel

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {selectedHotel ? (
                        <div className="flex items-center truncate">
                            <Building2 className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <span className="truncate">{selectedHotel.name}</span>
                        </div>
                    ) : (
                        "Select Hotel..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search hotel..." />
                    <CommandEmpty>No hotel found.</CommandEmpty>
                    <CommandGroup>
                        {hotels.map((hotel) => (
                            <CommandItem
                                key={hotel._id}
                                value={hotel.name}
                                onSelect={() => handleSelect(hotel)}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedHotel?._id === hotel._id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <div className="flex flex-col">
                                    <span>{hotel.name}</span>
                                    <span className="text-xs text-muted-foreground">{hotel.address?.city}</span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
