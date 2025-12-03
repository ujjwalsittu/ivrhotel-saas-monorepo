import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ivrhotel/ui';
import { Button } from '@ivrhotel/ui';
import { Input } from '@ivrhotel/ui';
import { Label } from '@ivrhotel/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ivrhotel/ui';
import { Textarea } from '@ivrhotel/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ivrhotel/ui';
import { Badge } from '@ivrhotel/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ivrhotel/ui';
import { Mail, Plus, Settings } from 'lucide-react';

interface OTAMapping {
    _id: string;
    ota: string;
    email: string;
    roomMappings: Array<{
        internalRoomTypeId: string;
        otaRoomName: string;
    }>;
    active: boolean;
    totalBookings: number;
}

const ChannelManager: React.FC = () => {
    const { hotelId } = useParams();
    const [mappings, setMappings] = useState<OTAMapping[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [emailToParse, setEmailToParse] = useState('');
    const [loading, setLoading] = useState(false);

    // Form states
    const [selectedOTA, setSelectedOTA] = useState('');
    const [otaEmail, setOtaEmail] = useState('');

    useEffect(() => {
        loadMappings();
    }, [hotelId]);

    const loadMappings = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/channels`);
            setMappings(response.data);
        } catch (error) {
            console.error('Error loading mappings:', error);
        }
    };

    const handleAddMapping = async () => {
        if (!selectedOTA || !otaEmail) {
            alert('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await api.post(`/hotels/${hotelId}/channels`, {
                ota: selectedOTA,
                email: otaEmail,
                roomMappings: [], // Will be configured separately
                autoImport: true
            });

            alert('OTA mapping created successfully!');
            setShowAddForm(false);
            setSelectedOTA('');
            setOtaEmail('');
            loadMappings();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error creating mapping');
        } finally {
            setLoading(false);
        }
    };

    const handleParseEmail = async () => {
        if (!emailToParse) return;

        setLoading(true);
        try {
            const response = await api.post(`/hotels/${hotelId}/channels/parse-email`, {
                emailContent: emailToParse,
                emailSubject: 'Test Email',
                fromAddress: 'test@makemytrip.com'
            });

            if (response.data.success) {
                alert(`Email parsed successfully!\n\nBooking: ${response.data.parsedData?.bookingId}\nGuest: ${response.data.parsedData?.guestName}`);
                setEmailToParse('');
            } else {
                alert('Failed to parse email');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error parsing email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Channel Manager</h1>
                    <p className="text-muted-foreground">Manage OTA connections and bookings</p>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add OTA
                </Button>
            </div>

            <Tabs defaultValue="connections">
                <TabsList>
                    <TabsTrigger value="connections">OTA Connections</TabsTrigger>
                    <TabsTrigger value="parser">Email Parser</TabsTrigger>
                    <TabsTrigger value="bookings">OTA Bookings</TabsTrigger>
                </TabsList>

                {/* OTA Connections Tab */}
                <TabsContent value="connections" className="space-y-4">
                    {showAddForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Add OTA Connection</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Select OTA</Label>
                                    <Select value={selectedOTA} onValueChange={setSelectedOTA}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose OTA" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MAKEMYTRIP">MakeMyTrip</SelectItem>
                                            <SelectItem value="GOIBIBO">Goibibo</SelectItem>
                                            <SelectItem value="BOOKING_COM">Booking.com</SelectItem>
                                            <SelectItem value="AIRBNB">Airbnb</SelectItem>
                                            <SelectItem value="OYO">OYO</SelectItem>
                                            <SelectItem value="AGODA">Agoda</SelectItem>
                                            <SelectItem value="EXPEDIA">Expedia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>OTA Notification Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="bookings@yourdomain.com"
                                        value={otaEmail}
                                        onChange={(e) => setOtaEmail(e.target.value)}
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Forward OTA emails to this address
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleAddMapping} disabled={loading}>
                                        Create Connection
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Connections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {mappings.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No OTA connections configured
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>OTA</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Room Mappings</TableHead>
                                            <TableHead>Bookings</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mappings.map((mapping) => (
                                            <TableRow key={mapping._id}>
                                                <TableCell>
                                                    <Badge>{mapping.ota}</Badge>
                                                </TableCell>
                                                <TableCell>{mapping.email}</TableCell>
                                                <TableCell>
                                                    {mapping.roomMappings.length} mapped
                                                </TableCell>
                                                <TableCell>{mapping.totalBookings}</TableCell>
                                                <TableCell>
                                                    <Badge variant={mapping.active ? 'default' : 'secondary'}>
                                                        {mapping.active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="outline">
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Email Parser Tab */}
                <TabsContent value="parser">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Test Email Parser
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Paste Email Content</Label>
                                <Textarea
                                    placeholder="Paste booking confirmation email here..."
                                    value={emailToParse}
                                    onChange={(e) => setEmailToParse(e.target.value)}
                                    rows={10}
                                />
                            </div>

                            <Button onClick={handleParseEmail} disabled={loading || !emailToParse}>
                                Parse Email
                            </Button>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">How it works:</h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                    <li>Forward OTA booking emails to your configured email</li>
                                    <li>Our AI extracts guest info, dates, and room type</li>
                                    <li>Booking is automatically created in your system</li>
                                    <li>Duplicate bookings are prevented</li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* OTA Bookings Tab */}
                <TabsContent value="bookings">
                    <Card>
                        <CardHeader>
                            <CardTitle>OTA Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground py-8">
                                Bookings from OTAs will appear here
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ChannelManager;
