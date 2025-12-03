import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ivrhotel/ui';
import { Button } from '@ivrhotel/ui';
import { Label } from '@ivrhotel/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ivrhotel/ui';
import { Input } from '@ivrhotel/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ivrhotel/ui';
import { Badge } from '@ivrhotel/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ivrhotel/ui';
import { Megaphone, Plus, Send } from 'lucide-react';

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

interface Campaign {
    _id: string;
    name: string;
    status: 'draft' | 'scheduled' | 'sent';
    recipientCount: number;
    sentCount: number;
    scheduledAt?: string;
}

const Campaigns: React.FC = () => {
    const { hotelId } = useParams();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form states
    const [campaignName, setCampaignName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [channel, setChannel] = useState<'EMAIL' | 'SMS' | 'WHATSAPP'>('EMAIL');
    const [audience, setAudience] = useState<'all' | 'checked_in' | 'upcoming' | 'past'>('all');
    const [scheduleOption, setScheduleOption] = useState<'now' | 'later'>('now');
    const [scheduleDate, setScheduleDate] = useState('');

    useEffect(() => {
        loadCampaigns();
        loadTemplates();
    }, [hotelId]);

    const loadCampaigns = async () => {
        // For MVP, show mock campaigns
        setCampaigns([
            {
                _id: '1',
                name: 'Welcome Campaign',
                status: 'sent',
                recipientCount: 150,
                sentCount: 150
            },
            {
                _id: '2',
                name: 'Check-in Reminder',
                status: 'scheduled',
                recipientCount: 45,
                sentCount: 0,
                scheduledAt: new Date(Date.now() + 86400000).toISOString()
            }
        ]);
    };

    const loadTemplates = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}/crm/templates`);
            setTemplates(response.data);
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const handleCreateCampaign = async () => {
        if (!campaignName || !selectedTemplate) {
            alert('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await api.post(`/hotels/${hotelId}/crm/campaigns`, {
                name: campaignName,
                templateId: selectedTemplate,
                channel,
                audience,
                scheduledAt: scheduleOption === 'later' ? scheduleDate : undefined
            });

            alert('Campaign created successfully!');
            setShowCreateForm(false);
            resetForm();
            loadCampaigns();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error creating campaign');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCampaignName('');
        setSelectedTemplate('');
        setChannel('EMAIL');
        setAudience('all');
        setScheduleOption('now');
        setScheduleDate('');
    };

    const getSelectedTemplate = () => {
        return templates.find(t => t._id === selectedTemplate);
    };

    const audienceLabels = {
        all: 'All Guests',
        checked_in: 'Currently Checked-In',
        upcoming: 'Upcoming Bookings',
        past: 'Past Guests'
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Campaign Management</h1>
                    <p className="text-muted-foreground">Create and manage marketing campaigns</p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                </Button>
            </div>

            <Tabs defaultValue="campaigns">
                <TabsList>
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                    <TabsTrigger value="create">Create New</TabsTrigger>
                </TabsList>

                {/* Campaigns List Tab */}
                <TabsContent value="campaigns">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Campaigns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {campaigns.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No campaigns created yet
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Recipients</TableHead>
                                            <TableHead>Sent</TableHead>
                                            <TableHead>Scheduled</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {campaigns.map((campaign) => (
                                            <TableRow key={campaign._id}>
                                                <TableCell className="font-medium">{campaign.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        campaign.status === 'sent' ? 'default' :
                                                            campaign.status === 'scheduled' ? 'secondary' : 'outline'
                                                    }>
                                                        {campaign.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{campaign.recipientCount}</TableCell>
                                                <TableCell>{campaign.sentCount}</TableCell>
                                                <TableCell>
                                                    {campaign.scheduledAt
                                                        ? new Date(campaign.scheduledAt).toLocaleString()
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="outline">
                                                        View
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

                {/* Create Campaign Tab */}
                <TabsContent value="create">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Left Column - Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Megaphone className="h-5 w-5" />
                                    Campaign Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Campaign Name</Label>
                                    <Input
                                        placeholder="e.g., Summer Promotion"
                                        value={campaignName}
                                        onChange={(e) => setCampaignName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>Select Template</Label>
                                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map((template) => (
                                                <SelectItem key={template._id} value={template._id}>
                                                    {template.name}
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
                                    <Label>Audience</Label>
                                    <Select value={audience} onValueChange={(val: any) => setAudience(val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Guests</SelectItem>
                                            <SelectItem value="checked_in">Currently Checked-In</SelectItem>
                                            <SelectItem value="upcoming">Upcoming Bookings</SelectItem>
                                            <SelectItem value="past">Past Guests</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Schedule</Label>
                                    <Select value={scheduleOption} onValueChange={(val: any) => setScheduleOption(val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="now">Send Immediately</SelectItem>
                                            <SelectItem value="later">Schedule for Later</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {scheduleOption === 'later' && (
                                    <div>
                                        <Label>Schedule Date & Time</Label>
                                        <Input
                                            type="datetime-local"
                                            value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                        />
                                    </div>
                                )}

                                <Button
                                    onClick={handleCreateCampaign}
                                    disabled={loading || !campaignName || !selectedTemplate}
                                    className="w-full"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    {scheduleOption === 'now' ? 'Send Campaign' : 'Schedule Campaign'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Right Column - Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedTemplate ? (
                                    <>
                                        <div className="bg-gray-50 p-4 rounded-lg border">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Template:</span>
                                                    <Badge>{getSelectedTemplate()?.name}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Channel:</span>
                                                    <Badge variant="outline">{channel}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Audience:</span>
                                                    <span className="text-sm">{audienceLabels[audience]}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {getSelectedTemplate()?.content.subject && (
                                            <div>
                                                <p className="text-sm font-medium mb-1">Subject:</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {getSelectedTemplate()?.content.subject}
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-sm font-medium mb-1">Message:</p>
                                            <div className="bg-white p-4 rounded border text-sm">
                                                {getSelectedTemplate()?.content.body}
                                            </div>
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Variables like {'{'}{'guestName'}{'}'},  {'{'}{'{'}checkInDate{'}'}{'}'} will be replaced with actual data
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        Select a template to see preview
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Campaigns;
