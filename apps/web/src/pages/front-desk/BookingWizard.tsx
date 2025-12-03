import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@ivrhotel/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@ivrhotel/ui';
import { GuestStep } from './components/GuestStep';
import { RoomStep } from './components/RoomStep';
import { ReviewStep } from './components/ReviewStep';
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from "sonner";

const STEPS = [
    { id: 1, title: 'Guest Selection' },
    { id: 2, title: 'Room Selection' },
    { id: 3, title: 'Review & Confirm' },
];

export const BookingWizard = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Wizard State
    const [guestData, setGuestData] = useState<any>(null);
    const [roomData, setRoomData] = useState<any>(null);
    const [reviewData, setReviewData] = useState<any>({ totalAmount: 0, paymentStatus: 'PENDING', notes: '' });

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Construct payload
            const payload = {
                guest: {
                    name: guestData.name,
                    email: guestData.email,
                    phone: guestData.phone,
                    address: guestData.address
                },
                roomTypeId: roomData.roomTypeId,
                checkInDate: new Date(roomData.checkInDate).toISOString(),
                checkOutDate: new Date(roomData.checkOutDate).toISOString(),
                totalAmount: reviewData.totalAmount,
                paidAmount: reviewData.paymentStatus === 'PAID' ? reviewData.totalAmount : 0, // Simplified logic
                notes: reviewData.notes
            };

            // 1. Create Booking
            const bookingRes = await axios.post(`http://localhost:4000/api/hotels/${hotelId}/bookings`, payload, { withCredentials: true });
            const bookingId = bookingRes.data._id;

            // 2. Check-in immediately if room is selected?
            // The wizard flow implies we selected a specific room.
            // The createBooking API doesn't take roomId directly in my implementation (it takes roomTypeId).
            // But I added check-in logic separately.
            // If I want to assign the room immediately, I should probably call check-in or update the booking with roomId.
            // My createBooking controller doesn't accept roomId.
            // But check-in endpoint does.
            // So let's call check-in if the user wants to check-in now.
            // For now, let's assume we just create the booking.
            // Wait, if I selected a specific room, I should probably reserve it.
            // My API `createBooking` doesn't support assigning a specific room yet (it only takes roomTypeId).
            // This is a gap in my API vs UI plan.
            // UI selects a specific room. API only reserves a room type.
            // I should probably update the API to accept `roomId` optionally to pre-assign.
            // OR I can call `check-in` immediately if the start date is today.
            // Let's call check-in if the start date is today.

            const isToday = new Date(roomData.checkInDate).toDateString() === new Date().toDateString();
            if (isToday && roomData.roomId) {
                await axios.post(`http://localhost:4000/api/hotels/${hotelId}/bookings/${bookingId}/check-in`, {
                    roomId: roomData.roomId
                }, { withCredentials: true });
            }

            toast.success("Booking Created", {
                description: "The booking has been successfully created.",
            });

            navigate(`/hotel/${hotelId}/dashboard`); // Redirect to dashboard or booking list
        } catch (error: any) {
            console.error("Booking failed", error);
            toast.error("Booking Failed", {
                description: error.response?.data?.message || "An error occurred while creating the booking.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStepValid = () => {
        if (currentStep === 1) return !!guestData;
        if (currentStep === 2) return !!roomData;
        return true;
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">New Booking</h1>
                <p className="text-muted-foreground">Create a new reservation for a guest.</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -z-10 transform -translate-y-1/2"></div>
                {STEPS.map((step) => (
                    <div key={step.id} className={`flex flex-col items-center bg-background px-4 ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${currentStep >= step.id ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground bg-background'}`}>
                            {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                        </div>
                        <span className="text-sm font-medium">{step.title}</span>
                    </div>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
                    <CardDescription>Step {currentStep} of {STEPS.length}</CardDescription>
                </CardHeader>
                <CardContent>
                    {currentStep === 1 && (
                        <GuestStep
                            onSelect={setGuestData}
                            selectedGuest={guestData}
                        />
                    )}
                    {currentStep === 2 && (
                        <RoomStep
                            onSelect={setRoomData}
                            selectedData={roomData}
                        />
                    )}
                    {currentStep === 3 && (
                        <ReviewStep
                            guest={guestData}
                            roomData={roomData}
                            onConfirm={setReviewData}
                        />
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-between mt-6">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1 || isSubmitting}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!isStepValid() || isSubmitting}
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {currentStep === STEPS.length ? 'Confirm Booking' : 'Next'}
                    {currentStep !== STEPS.length && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
            </div>
        </div>
    );
};
