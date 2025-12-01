import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

const STEPS = [
    'Basic Information',
    'Location',
    'Legal Information',
    'Documents',
    'Photos',
    'Review & Submit'
];

const OnboardingWizard: React.FC = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({
        name: '',
        hotelType: 'NORMAL',
        handlingType: 'ROOMS',
        contactNumber: '',
        email: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            coordinates: { lat: 0, lng: 0 }
        },
        legalAddress: '',
        gstNumber: '',
        authorizedSignatory: {
            name: '',
            phone: ''
        },
        businessStructure: 'PRIVATE_LIMITED'
    });
    const [uploadedDocs, setUploadedDocs] = useState<any>({});
    const [uploadedPhotos, setUploadedPhotos] = useState<any>({
        lobby: [],
        rooms: [],
        washrooms: [],
        restaurant: []
    });

    useEffect(() => {
        fetchHotelData();
    }, [hotelId]);

    const fetchHotelData = async () => {
        try {
            const response = await api.get(`/hotels/${hotelId}`);
            setFormData(response.data);

            // Load uploaded files and flatten nested structure
            if (response.data.documents) {
                const docs: any = {};

                const flattenDocs = (obj: any, prefix = '') => {
                    Object.keys(obj).forEach(key => {
                        const value = obj[key];
                        const newKey = prefix ? `${prefix}.${key}` : key;

                        if (value && typeof value === 'object' && 'url' in value) {
                            docs[newKey] = value.url;
                        } else if (value && typeof value === 'object') {
                            flattenDocs(value, newKey);
                        }
                    });
                };

                flattenDocs(response.data.documents);
                setUploadedDocs(docs);
            }

            if (response.data.photos) {
                setUploadedPhotos(response.data.photos);
            }
        } catch (error) {
            console.error('Error fetching hotel data:', error);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        const keys = field.split('.');
        if (keys.length === 1) {
            setFormData({ ...formData, [field]: value });
        } else {
            const updated = { ...formData };
            let current: any = updated;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            setFormData(updated);
        }
    };

    const saveProgress = async () => {
        try {
            await api.put(`/hotels/${hotelId}/onboarding`, formData);
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const handleFileUpload = async (category: string, documentType: string, files: File[]) => {
        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);
            formData.append('documentType', documentType);

            try {
                const response = await api.post(`/hotels/${hotelId}/onboarding/upload`, formData);

                if (category === 'photos') {
                    setUploadedPhotos({
                        ...uploadedPhotos,
                        [documentType]: [...(uploadedPhotos[documentType] || []), response.data.url]
                    });
                } else {
                    setUploadedDocs({
                        ...uploadedDocs,
                        [documentType]: response.data.url
                    });
                }
            } catch (error) {
                console.error('Upload error:', error);
                throw error;
            }
        }
    };

    const handleSubmit = async () => {
        try {
            await saveProgress();
            await api.post(`/hotels/${hotelId}/onboarding/submit`);
            alert('Onboarding submitted for review!');
            navigate(`/hotel/${hotelId}/dashboard`);
        } catch (error) {
            console.error('Submit error:', error);
            alert('Failed to submit onboarding');
        }
    };

    const nextStep = async () => {
        await saveProgress();
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Hotel Onboarding</h1>
                <p className="text-muted-foreground">Complete your hotel setup</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                        <CardTitle>{STEPS[currentStep]}</CardTitle>
                        <span className="text-sm text-muted-foreground">
                            Step {currentStep + 1} of {STEPS.length}
                        </span>
                    </div>
                    <Progress value={progress} />
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Step 0: Basic Information */}
                    {currentStep === 0 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Hotel Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Hotel Type</Label>
                                    <Select
                                        value={formData.hotelType}
                                        onValueChange={(val) => handleInputChange('hotelType', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LODGING">Lodging</SelectItem>
                                            <SelectItem value="NORMAL">Normal</SelectItem>
                                            <SelectItem value="PREMIUM">Premium</SelectItem>
                                            <SelectItem value="LUXE">Luxe</SelectItem>
                                            <SelectItem value="PREMIUM_LUXE">Premium Luxe</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Handling Type</Label>
                                    <Select
                                        value={formData.handlingType}
                                        onValueChange={(val) => handleInputChange('handlingType', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ROOMS">Rooms Only</SelectItem>
                                            <SelectItem value="ROOMS_KITCHEN">Rooms + Kitchen</SelectItem>
                                            <SelectItem value="ROOMS_RESTAURANT_KITCHEN">Rooms + Restaurant + Kitchen</SelectItem>
                                            <SelectItem value="FULL">Full Service</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Contact Number</Label>
                                    <Input
                                        value={formData.contactNumber}
                                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 1: Location */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <Label>Street Address</Label>
                                <Input
                                    value={formData.address.street}
                                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>City</Label>
                                    <Input
                                        value={formData.address.city}
                                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>State</Label>
                                    <Input
                                        value={formData.address.state}
                                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Zip Code</Label>
                                    <Input
                                        value={formData.address.zipCode}
                                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Country</Label>
                                    <Input
                                        value={formData.address.country}
                                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Latitude</Label>
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        value={formData.address.coordinates?.lat || ''}
                                        onChange={(e) => handleInputChange('address.coordinates.lat', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label>Longitude</Label>
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        value={formData.address.coordinates?.lng || ''}
                                        onChange={(e) => handleInputChange('address.coordinates.lng', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Legal Information */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div>
                                <Label>GST Number</Label>
                                <Input
                                    value={formData.gstNumber}
                                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Legal Address</Label>
                                <Textarea
                                    value={formData.legalAddress}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('legalAddress', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Authorized Signatory Name</Label>
                                    <Input
                                        value={formData.authorizedSignatory.name}
                                        onChange={(e) => handleInputChange('authorizedSignatory.name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Signatory Phone</Label>
                                    <Input
                                        value={formData.authorizedSignatory.phone}
                                        onChange={(e) => handleInputChange('authorizedSignatory.phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Business Structure</Label>
                                <Select
                                    value={formData.businessStructure}
                                    onValueChange={(val) => handleInputChange('businessStructure', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PRIVATE_LIMITED">Private Limited</SelectItem>
                                        <SelectItem value="LLP">LLP</SelectItem>
                                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Documents */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <Label>GST Certificate</Label>
                                <FileUpload
                                    accept=".pdf,image/*"
                                    onUpload={(files) => handleFileUpload('documents', 'gstCertificate', files)}
                                    uploadedFiles={uploadedDocs.gstCertificate ? [uploadedDocs.gstCertificate] : []}
                                    category="gstCertificate"
                                />
                            </div>
                            <div>
                                <Label>Cancelled Cheque</Label>
                                <FileUpload
                                    accept=".pdf,image/*"
                                    onUpload={(files) => handleFileUpload('documents', 'cancelledCheque', files)}
                                    uploadedFiles={uploadedDocs.cancelledCheque ? [uploadedDocs.cancelledCheque] : []}
                                    category="cancelledCheque"
                                />
                            </div>
                            <div>
                                <Label>Business PAN</Label>
                                <FileUpload
                                    accept=".pdf,image/*"
                                    onUpload={(files) => handleFileUpload('documents', 'legalDocs.businessPan', files)}
                                    uploadedFiles={uploadedDocs['legalDocs.businessPan'] ? [uploadedDocs['legalDocs.businessPan']] : []}
                                    category="businessPan"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Photos */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div>
                                <Label>Lobby Photos</Label>
                                <FileUpload
                                    accept="image/*"
                                    multiple
                                    onUpload={(files) => handleFileUpload('photos', 'lobby', files)}
                                    uploadedFiles={uploadedPhotos.lobby || []}
                                    category="lobby"
                                />
                            </div>
                            <div>
                                <Label>Room Photos</Label>
                                <FileUpload
                                    accept="image/*"
                                    multiple
                                    onUpload={(files) => handleFileUpload('photos', 'rooms', files)}
                                    uploadedFiles={uploadedPhotos.rooms || []}
                                    category="rooms"
                                />
                            </div>
                            <div>
                                <Label>Washroom Photos</Label>
                                <FileUpload
                                    accept="image/*"
                                    multiple
                                    onUpload={(files) => handleFileUpload('photos', 'washrooms', files)}
                                    uploadedFiles={uploadedPhotos.washrooms || []}
                                    category="washrooms"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review & Submit */}
                    {currentStep === 5 && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Ready to Submit</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Review your information and submit for verification
                                </p>
                                <div className="text-left space-y-2 text-sm">
                                    <p><strong>Hotel Name:</strong> {formData.name}</p>
                                    <p><strong>Type:</strong> {formData.hotelType}</p>
                                    <p><strong>Location:</strong> {formData.address.city}, {formData.address.state}</p>
                                    <p><strong>Documents Uploaded:</strong> {Object.keys(uploadedDocs).length}</p>
                                    <p><strong>Photos Uploaded:</strong> {Object.values(uploadedPhotos).flat().length}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-6">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>
                        {currentStep < STEPS.length - 1 ? (
                            <Button onClick={nextStep}>
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit}>
                                Submit for Review
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OnboardingWizard;
