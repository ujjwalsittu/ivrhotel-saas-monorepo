import React from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';

const HotelAdminLayout: React.FC = () => {
    const { hotelId } = useParams();

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800">Hotel Admin</h1>
                </div>
                <nav className="mt-6">
                    <Link to={`/hotel/${hotelId}/dashboard`} className="block px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Dashboard
                    </Link>
                    <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Configuration
                    </div>
                    <Link to={`/hotel/${hotelId}/floors`} className="block px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Floors
                    </Link>
                    <Link to={`/hotel/${hotelId}/room-types`} className="block px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Room Types
                    </Link>
                    <Link to={`/hotel/${hotelId}/rooms`} className="block px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Rooms
                    </Link>
                    <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
                        People
                    </div>
                    <Link to={`/hotel/${hotelId}/staff`} className="block px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Staff
                    </Link>
                    <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
                        Operations
                    </div>
                    <Link to={`/hotel/${hotelId}/bookings`} className="block px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Bookings
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default HotelAdminLayout;
