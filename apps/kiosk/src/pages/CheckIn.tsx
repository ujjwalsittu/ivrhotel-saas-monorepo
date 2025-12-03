import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Key, CheckCircle } from 'lucide-react';

const CheckIn: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'search' | 'confirm' | 'success'>('search');
    const [referenceId, setReferenceId] = useState('');
    const [booking, setBooking] = useState<any>(null);
    const [keyData, setKeyData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:3000/api/kiosk/find-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referenceId })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Booking not found');

            setBooking(data);
            setStep('confirm');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/kiosk/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking._id })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Check-in failed');

            setKeyData(data.keyCardData);
            setStep('success');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen p-8">
            <button
                onClick={() => navigate('/')}
                className="self-start flex items-center text-slate-400 hover:text-white mb-8"
            >
                <ChevronLeft className="w-8 h-8 mr-2" />
                <span className="text-xl">Back to Home</span>
            </button>

            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
                {step === 'search' && (
                    <div className="w-full space-y-8">
                        <h2 className="text-4xl font-bold text-center">Find Your Booking</h2>
                        <div className="relative">
                            <input
                                type="text"
                                value={referenceId}
                                onChange={(e) => setReferenceId(e.target.value)}
                                placeholder="Enter Booking Reference or Email"
                                className="w-full p-6 text-2xl bg-slate-800 rounded-xl border-2 border-slate-700 focus:border-blue-500 focus:outline-none text-center"
                            />
                        </div>
                        {error && <p className="text-red-500 text-center text-xl">{error}</p>}
                        <button
                            onClick={handleSearch}
                            disabled={!referenceId || loading}
                            className="w-full p-6 bg-blue-600 rounded-xl text-2xl font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? 'Searching...' : <><Search className="mr-3" /> Find Booking</>}
                        </button>
                    </div>
                )}

                {step === 'confirm' && booking && (
                    <div className="w-full space-y-8 bg-slate-800 p-8 rounded-3xl">
                        <h2 className="text-3xl font-bold text-center">Confirm Details</h2>
                        <div className="space-y-4 text-xl">
                            <div className="flex justify-between border-b border-slate-700 pb-4">
                                <span className="text-slate-400">Guest Name</span>
                                <span className="font-semibold">{booking.guest.firstName} {booking.guest.lastName}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-4">
                                <span className="text-slate-400">Room Type</span>
                                <span className="font-semibold">{booking.roomTypeId.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-4">
                                <span className="text-slate-400">Check In</span>
                                <span className="font-semibold">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between pb-4">
                                <span className="text-slate-400">Check Out</span>
                                <span className="font-semibold">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckIn}
                            disabled={loading}
                            className="w-full p-6 bg-green-600 rounded-xl text-2xl font-bold hover:bg-green-500 flex items-center justify-center"
                        >
                            {loading ? 'Processing...' : 'Confirm & Check In'}
                        </button>
                    </div>
                )}

                {step === 'success' && keyData && (
                    <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-16 h-16 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold">You are Checked In!</h2>

                        <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl max-w-md mx-auto transform rotate-1">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-sm text-slate-500 uppercase tracking-wider">Room Number</p>
                                    <p className="text-5xl font-bold text-blue-600">101</p> {/* Mock Room Number as API returns ID */}
                                </div>
                                <Key className="w-8 h-8 text-slate-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-400">Key Code</p>
                                <p className="font-mono text-xl tracking-widest">{keyData.code}</p>
                            </div>
                        </div>

                        <p className="text-xl text-slate-400">Please take a photo of your digital key.</p>

                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-4 bg-slate-700 rounded-xl text-xl hover:bg-slate-600"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckIn;
