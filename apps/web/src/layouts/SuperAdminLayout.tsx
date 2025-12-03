import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '@ivrhotel/ui';
import { Card } from '@ivrhotel/ui';

const SuperAdminLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800">Super Admin</h1>
                </div>
                <nav className="mt-6">
                    <Link to="/super-admin/dashboard" className="block px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Dashboard
                    </Link>
                    <Link to="/super-admin/hotels" className="block px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Hotels
                    </Link>
                    <Link to="/super-admin/onboarding" className="block px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Onboard Hotel
                    </Link>
                    <Link to="/super-admin/plans" className="block px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Plans
                    </Link>
                    <Link to="/super-admin/configuration" className="block px-6 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Configuration
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

export default SuperAdminLayout;
