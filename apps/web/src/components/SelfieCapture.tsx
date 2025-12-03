import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw } from 'lucide-react';
import { Button } from '@ivrhotel/ui';
import { Card, CardContent } from '@ivrhotel/ui';

interface SelfieCaptureProps {
    onCapture: (imageDataUrl: string) => void;
}

export const SelfieCapture: React.FC<SelfieCaptureProps> = ({ onCapture }) => {
    const webcamRef = useRef<Webcam>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState(false);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
        }
    }, [webcamRef]);

    const retake = () => {
        setCapturedImage(null);
    };

    const confirm = () => {
        if (capturedImage) {
            onCapture(capturedImage);
        }
    };

    if (cameraError) {
        return (
            <Card>
                <CardContent className="pt-6 text-center">
                    <p className="text-red-600 mb-4">Unable to access camera</p>
                    <p className="text-sm text-muted-foreground">
                        Please ensure camera permissions are granted and try again.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="pt-6">
                    {!capturedImage ? (
                        <div className="relative">
                            <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                className="w-full rounded-lg"
                                onUserMediaError={() => setCameraError(true)}
                                mirrored
                            />
                            <div className="mt-4 text-center">
                                <Button onClick={capture} size="lg">
                                    <Camera className="mr-2 h-5 w-5" />
                                    Capture Photo
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <img src={capturedImage} alt="Selfie" className="w-full rounded-lg" />
                            <div className="flex gap-2 mt-4 justify-center">
                                <Button variant="outline" onClick={retake}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Retake
                                </Button>
                                <Button onClick={confirm}>
                                    Confirm & Continue
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SelfieCapture;
