import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ivrhotel/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ivrhotel/ui';
import { Button } from '@ivrhotel/ui';

const HotelList: React.FC = () => {
    const [hotels, setHotels] = useState<any[]>([]);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            // We need to implement getHotels list API first, but let's assume we have it or use getHotel by ID loop for now (bad practice, but quick for demo if we had IDs). 
            // Actually, let's add a list API.
            const response = await api.get('/hotels'); // We need to implement this endpoint
            setHotels(response.data);
        } catch (error) {
            console.error('Error fetching hotels:', error);
        }
    };

    const verifyHotel = async (id: string, status: 'ACTIVE' | 'REJECTED') => {
        try {
            if (status === 'ACTIVE') {
                await api.post(`/hotels/${id}/onboarding/approve`);
            } else {
                // Implement reject logic if needed
                console.log('Reject logic not implemented yet');
            }
            fetchHotels();
        } catch (error) {
            console.error('Error verifying hotel:', error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Hotels</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {hotels.map((hotel) => (
                            <TableRow key={hotel._id}>
                                <TableCell>{hotel.name}</TableCell>
                                <TableCell>{hotel.status}</TableCell>
                                <TableCell>
                                    {hotel.status === 'PENDING' && (
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => verifyHotel(hotel._id, 'ACTIVE')}>Approve</Button>
                                            <Button size="sm" variant="destructive" onClick={() => verifyHotel(hotel._id, 'REJECTED')}>Reject</Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default HotelList;
