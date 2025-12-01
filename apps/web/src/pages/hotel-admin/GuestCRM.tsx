import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Users, MessageSquare } from 'lucide-react';

interface Guest {
    name: string;
    email: string;
    phone: string;
    totalBookings: number;
    lastStay: string;
}

interface Template {
    _id: string;
    name: string;
    type: string;
    channels: string[];
    content: {
        subject?: string;
        body: string;
    };
}

const GuestCRM: React.FC = () => {
    const { hotelId } = useParams();
    const [guests, setGuests] = useState<Guest[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [activeTab, setActiveTab] = useState('guests');

    // Send message states
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
    const [channel, setChannel] = useState<'EMAIL' | 'SMS' | 'WHATSAPP'>('EMAIL');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadGuests();
        loadTemplates();
    }, [hotelId]);

    const loadGuests = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/crm/guests`);
            setGuests(response.data);
        } catch (error) {
            console.error('Error loading guests:', error);
        }
    };

    const loadTemplates = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/crm/templates`);
            setTemplates(response.data);
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!selectedGuest || !message) {
            alert('Please select a guest and enter a message');
            return;
        }

        const recipient = channel === 'EMAIL' ? selectedGuest.email : selectedGuest.phone;
        if (!recipient) {
            alert(`Guest doesn't have ${channel === 'EMAIL' ? 'email' : 'phone number'}`);
            return;
        }

        setLoading(true);
        try {
            await api.post(`/hotels/${hotelId}/crm/send-message`, {
                to: recipient,
                channel,
                subject: channel === 'EMAIL' ? 'Message from Hotel' : undefined,
                content: message
            });

            alert('Message sent successfully!');
            setMessage('');
            setSelectedGuest(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error sending message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Guest CRM</h1>
                <p className="text-muted-foreground">Manage guest communications</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="guests">
                        <Users className="h-4 w-4 mr-2" />
                        Guests
                    </TabsTrigger>
                    <TabsTrigger value="send">
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                    </TabsTrigger>
                    <TabsTrigger value="templates">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Templates
                    </TabsTrigger>
                </TabsList>

                {/* Guests Tab */}
                <TabsContent value="guests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Guest List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {guests.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No guests found
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Total Stays</TableHead>
                                            <TableHead>Last Stay</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {guests.map((guest, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{guest.name}</TableCell>
                                                <TableCell>{guest.email}</TableCell>
                                                <TableCell>{guest.phone}</TableCell>
                                                <TableCell>{guest.totalBookings}</TableCell>
                                                <TableCell>
                                                    {new Date(guest.lastStay).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedGuest(guest);
                                                            setActiveTab('send');
                                                        }}
                                                    >
                                                        Message
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

                {/* Send Message Tab */}
                <TabsContent value="send">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send Message</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Select Guest</Label>
                                <Select
                                    value={selectedGuest?.name}
                                    onValueChange={(name) => {
                                        const guest = guests.find(g => g.name === name);
                                        setSelectedGuest(guest || null);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose guest" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {guests.map((guest, index) => (
                                            <SelectItem key={index} value={guest.name}>
                                                {guest.name} - {guest.email || guest.phone}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Channel</Label>
                                <Select value={channel} onValueChange={(val: any) => setChannel(val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EMAIL">Email</SelectItem>
                                        <SelectItem value="SMS">SMS</SelectItem>
                                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Message</Label>
                                <Textarea
                                    placeholder="Type your message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={6}
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Use variables: {`{{guestName}}, {{checkInDate}}, {{hotelName}}`}
                                </p>
                            </div>

                            <Button onClick={handleSendMessage} disabled={loading || !selectedGuest}>
                                <Send className="h-4 w-4 mr-2" />
                                Send Message
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Message Templates</CardTitle>
                                <Button size="sm">Create Template</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {templates.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No templates created yet
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {templates.map((template) => (
                                        <Card key={template._id}>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg">{template.name}</CardTitle>
                                                    <div className="flex gap-2">
                                                        {template.channels.map((ch) => (
                                                            <Badge key={ch} variant="outline">{ch}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {template.content.subject && (
                                                    <p className="text-sm font-medium mb-2">
                                                        Subject: {template.content.subject}
                                                    </p>
                                                )}
                                                <p className="text-sm text-muted-foreground">
                                                    {template.content.body.substring(0, 150)}...
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default GuestCRM;
