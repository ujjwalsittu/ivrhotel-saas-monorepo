import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';

interface Hotel {
    _id: string;
    name: string;
    submittedAt: string;
    onboardingStatus: string;
    documents: any;
    photos: any;
}

const HotelVerification: React.FC = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<string>('');
    const [comments, setComments] = useState('');

    useEffect(() => {
        fetchHotelDetails();
    }, [hotelId]);

    const fetchHotelDetails = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}`);
            setHotel(response.data);
        } catch (error) {
            console.error('Error fetching hotel:', error);
        }
    };

    const handleVerifyDocument = async (documentType: string, status: string) => {
        try {
            await api.put(`/hotels/${hotelId}/onboarding/verify/${documentType}`, {
                status,
                comments
            });
            setComments('');
            fetchHotelDetails();
        } catch (error) {
            console.error('Error verifying document:', error);
            alert('Failed to verify document');
        }
    };

    const handleApproveHotel = async () => {
        if (!confirm('Are you sure you want to approve and activate this hotel?')) return;

        try {
            await api.post(`/hotels/${hotelId}/onboarding/approve`);
            alert('Hotel approved and activated!');
            navigate('/super-admin/hotels');
        } catch (error) {
            console.error('Error approving hotel:', error);
            alert('Failed to approve hotel');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            pending: { variant: 'secondary', icon: AlertCircle, text: 'Pending' },
            approved: { variant: 'default', icon: CheckCircle2, text: 'Approved' },
            rejected: { variant: 'destructive', icon: XCircle, text: 'Rejected' },
            reupload_requested: { variant: 'outline', icon: AlertCircle, text: 'Reupload Needed' }
        };
        const config = variants[status] || variants.pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {config.text}
            </Badge>
        );
    };

    const renderDocument = (doc: any, type: string) => {
        if (!doc || !doc.url) return <p className="text-sm text-gray-500">Not uploaded</p>;

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    {getStatusBadge(doc.status)}
                    {doc.verifiedAt && (
                        <span className="text-xs text-muted-foreground">
                            Verified {new Date(doc.verifiedAt).toLocaleDateString()}
                        </span>
                    )}
                </div>

                {doc.url.endsWith('.pdf') ? (
                    <div className="bg-gray-100 p-4 rounded flex items-center gap-2">
                        <FileText className="h-8 w-8" />
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View PDF
                        </a>
                    </div>
                ) : (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <img src={doc.url} alt={type} className="max-w-full h-auto rounded border" />
                    </a>
                )}

                {doc.comments && (
                    <div className="bg-yellow-50 p-3 rounded text-sm">
                        <strong>Comments:</strong> {doc.comments}
                    </div>
                )}

                {doc.status !== 'approved' && (
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Add comments..."
                            value={selectedDoc === type ? comments : ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                setSelectedDoc(type);
                                setComments(e.target.value);
                            }}
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => handleVerifyDocument(type, 'approved')}
                            >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleVerifyDocument(type, 'rejected')}
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifyDocument(type, 'reupload_requested')}
                            >
                                Request Reupload
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!hotel) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{hotel.name}</h1>
                    <p className="text-muted-foreground">
                        Submitted {new Date(hotel.submittedAt).toLocaleString()}
                    </p>
                </div>
                <Button onClick={handleApproveHotel} size="lg">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Approve & Activate Hotel
                </Button>
            </div>

            <Tabs defaultValue="documents">
                <TabsList>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                    <TabsTrigger value="info">Hotel Info</TabsTrigger>
                </TabsList>

                <TabsContent value="documents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>GST Certificate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderDocument(hotel.documents?.gstCertificate, 'gstCertificate')}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cancelled Cheque</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderDocument(hotel.documents?.cancelledCheque, 'cancelledCheque')}
                        </CardContent>
                    </Card>

                    {hotel.documents?.legalDocs?.businessPan && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Business PAN</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {renderDocument(hotel.documents.legalDocs.businessPan, 'legalDocs.businessPan')}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="photos" className="space-y-4">
                    {['lobby', 'rooms', 'washrooms', 'restaurant'].map(category => (
                        hotel.photos?.[category]?.length > 0 && (
                            <Card key={category}>
                                <CardHeader>
                                    <CardTitle className="capitalize">{category} Photos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        {hotel.photos[category].map((url: string, idx: number) => (
                                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                                                <img src={url} alt={`${category} ${idx + 1}`} className="rounded border aspect-square object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    ))}
                </TabsContent>

                <TabsContent value="info">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <strong>Hotel Type:</strong> {hotel['hotelType' as keyof Hotel]}
                                </div>
                                <div>
                                    <strong>Handling Type:</strong> {hotel['handlingType' as keyof Hotel]}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default HotelVerification;
