import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ivrhotel/ui';
import { Button } from '@ivrhotel/ui';
import { Input } from '@ivrhotel/ui';
import { Label } from '@ivrhotel/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ivrhotel/ui';
import { Progress } from '@ivrhotel/ui';
import { CheckCircle2, Shield, FileText } from 'lucide-react';
import SelfieCapture from '@/components/SelfieCapture';
import FileUpload from '@/components/FileUpload';

const STEPS = ['Welcome', 'Nationality', 'Document', 'Selfie', 'Complete'];

const KYCForm: React.FC = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [session, setSession] = useState<any>(null);
    const [nationality, setNationality] = useState('IN');
    const [documentType, setDocumentType] = useState('aadhaar');
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSession();
    }, [token]);

    const fetchSession = async () => {
        try {
            const response = await api.get(`/kyc/${token}`);
            setSession(response.data.session);
        } catch (error: any) {
            if (error.response?.status === 404) {
                alert('Invalid KYC link');
            } else if (error.response?.status === 410) {
                alert('This KYC link has expired');
            }
        }
    };

    const handleNationalitySubmit = async () => {
        setLoading(true);
        try {
            await api.put(`/kyc/${token}/identity`, {
                nationality,
                documentType
            });
            setCurrentStep(2);
        } catch (error) {
            alert('Error submitting nationality');
        } finally {
            setLoading(false);
        }
    };

    const handleDigilockerVerify = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/kyc/${token}/digilocker`, {
                aadhaarNumber
            });
            alert(`Verification successful! Welcome ${response.data.data.name}`);
            setCurrentStep(3);
        } catch (error) {
            alert('Digilocker verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentUpload = async (files: File[]) => {
        const formData = new FormData();
        formData.append('file', files[0]);

        try {
            await api.post(`/kyc/${token}/upload-document`, formData);
            setCurrentStep(3);
        } catch (error) {
            alert('Error uploading document');
            throw error;
        }
    };

    const handleSelfieCapture = async (imageDataUrl: string) => {
        const blob = await fetch(imageDataUrl).then(r => r.blob());
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const response = await api.post(`/kyc/${token}/upload-selfie`, formData);

            // Show face match result
            if (response.data.faceMatchScore) {
                alert(`Face Match Score: ${response.data.faceMatchScore}%`);
            }

            // Complete KYC
            await api.post(`/kyc/${token}/complete`);
            setCurrentStep(4);
        } catch (error) {
            alert('Error processing selfie');
        } finally {
            setLoading(false);
        }
    };

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    if (!session) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
                <h1 className="text-3xl font-bold">Guest Verification (KYC)</h1>
                <p className="text-muted-foreground">Secure identity verification</p>
            </div>

            <Progress value={progress} />

            {/* Step 0: Welcome */}
            {currentStep === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>Complete your identity verification to proceed with your booking.</p>
                        <div className="bg-blue-50 p-4 rounded-lg text-sm">
                            <strong>Privacy Note:</strong> Your data is encrypted and used only for verification purposes.
                        </div>
                        <Button onClick={() => setCurrentStep(1)} className="w-full">
                            Start Verification
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 1: Nationality */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select Nationality</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Nationality</Label>
                            <Select value={nationality} onValueChange={setNationality}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IN">Indian</SelectItem>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="UK">United Kingdom</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {nationality === 'IN' && (
                            <div>
                                <Label>Document Type</Label>
                                <Select value={documentType} onValueChange={setDocumentType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                                        <SelectItem value="passport">Passport</SelectItem>
                                        <SelectItem value="driving_license">Driving License</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <Button onClick={handleNationalitySubmit} disabled={loading} className="w-full">
                            Continue
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Document Verification */}
            {currentStep === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <FileText className="inline mr-2" />
                            Verify Document
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {nationality === 'IN' && documentType === 'aadhaar' ? (
                            <>
                                <div>
                                    <Label>Aadhaar Number</Label>
                                    <Input
                                        value={aadhaarNumber}
                                        onChange={(e) => setAadhaarNumber(e.target.value)}
                                        placeholder="XXXX-XXXX-XXXX"
                                        maxLength={12}
                                    />
                                </div>
                                <Button
                                    onClick={handleDigilockerVerify}
                                    disabled={loading || aadhaarNumber.length !== 12}
                                    className="w-full"
                                >
                                    Verify with Digilocker (Demo)
                                </Button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Upload a clear photo of your {documentType === 'passport' ? 'passport' : 'ID'}
                                </p>
                                <FileUpload
                                    accept="image/*,.pdf"
                                    onUpload={handleDocumentUpload}
                                    category="kyc-document"
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Selfie */}
            {currentStep === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Capture Selfie</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Take a clear selfie for face verification
                        </p>
                        <SelfieCapture onCapture={handleSelfieCapture} />
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Verification Complete!</h2>
                        <p className="text-muted-foreground">
                            Your identity has been verified successfully.
                        </p>
                        <Button className="mt-6" onClick={() => navigate('/')}>
                            Done
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default KYCForm;
