import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-screen p-8 space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-6xl font-bold tracking-tight">Welcome</h1>
                <p className="text-2xl text-slate-400">Please select an option to continue</p>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                <button
                    onClick={() => navigate('/check-in')}
                    className="flex flex-col items-center justify-center p-12 bg-blue-600 rounded-3xl shadow-2xl hover:bg-blue-500 transition-all transform hover:scale-105 active:scale-95"
                >
                    <LogIn className="w-24 h-24 mb-6" />
                    <span className="text-4xl font-semibold">Check In</span>
                </button>

                <button
                    onClick={() => navigate('/check-out')}
                    className="flex flex-col items-center justify-center p-12 bg-slate-700 rounded-3xl shadow-2xl hover:bg-slate-600 transition-all transform hover:scale-105 active:scale-95"
                >
                    <LogOut className="w-24 h-24 mb-6" />
                    <span className="text-4xl font-semibold">Check Out</span>
                </button>
            </div>
        </div>
    );
};

export default Home;
