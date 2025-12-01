import React from 'react';
import { Outlet, Link, useParams, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Bed, Layers, DoorOpen, Users, CalendarDays,
    CreditCard, FileText, ShoppingCart, Sparkles, Wrench, TrendingUp,
    Mail, Megaphone, DollarSign, Settings
} from 'lucide-react';

interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const HotelAdminLayout: React.FC = () => {
    const { hotelId } = useParams();
    const location = useLocation();

    const navigation: NavSection[] = [
        {
            title: 'Overview',
            items: [
                { label: 'Dashboard', path: `/hotel/${hotelId}/dashboard`, icon: LayoutDashboard }
            ]
        },
        {
            title: 'Rooms & Bookings',
            items: [
                { label: 'Floors', path: `/hotel/${hotelId}/floors`, icon: Layers },
                { label: 'Room Types', path: `/hotel/${hotelId}/room-types`, icon: Bed },
                { label: 'Rooms', path: `/hotel/${hotelId}/rooms`, icon: DoorOpen },
                { label: 'Bookings', path: `/hotel/${hotelId}/bookings`, icon: CalendarDays }
            ]
        },
        {
            title: 'Operations',
            items: [
                { label: 'Housekeeping', path: `/hotel/${hotelId}/housekeeping`, icon: Sparkles },
                { label: 'Maintenance', path: `/hotel/${hotelId}/maintenance`, icon: Wrench },
                { label: 'Staff', path: `/hotel/${hotelId}/staff`, icon: Users }
            ]
        },
        {
            title: 'Revenue',
            items: [
                { label: 'Payments', path: `/hotel/${hotelId}/payments`, icon: CreditCard },
                { label: 'Invoices', path: `/hotel/${hotelId}/invoices`, icon: FileText },
                { label: 'POS Orders', path: `/hotel/${hotelId}/pos/orders`, icon: ShoppingCart }
            ]
        },
        {
            title: 'Marketing & Growth',
            items: [
                { label: 'Channel Manager', path: `/hotel/${hotelId}/channels`, icon: TrendingUp },
                { label: 'Guest CRM', path: `/hotel/${hotelId}/crm`, icon: Mail },
                { label: 'Campaigns', path: `/hotel/${hotelId}/campaigns`, icon: Megaphone }
            ]
        },
        {
            title: 'Analytics & Reports',
            items: [
                { label: 'Analytics', path: `/hotel/${hotelId}/analytics`, icon: TrendingUp }
            ]
        },
        {
            title: 'Finance',
            items: [
                { label: 'Expenses', path: `/hotel/${hotelId}/finance/expenses`, icon: DollarSign },
                { label: 'Payroll', path: `/hotel/${hotelId}/finance/payroll`, icon: Users }
            ]
        }
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg border-r">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-gray-800">Hotel Admin</h1>
                    <p className="text-sm text-gray-500 mt-1">Management Portal</p>
                </div>

                <nav className="mt-2 overflow-y-auto h-[calc(100vh-120px)]">
                    {navigation.map((section, index) => (
                        <div key={index} className="mb-4">
                            <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {section.title}
                            </div>
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${active
                                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}

                    {/* Settings at bottom */}
                    <div className="mt-8 border-t pt-4">
                        <Link
                            to={`/hotel/${hotelId}/onboarding`}
                            className={`flex items-center gap-3 px-6 py-2.5 text-sm ${isActive(`/hotel/${hotelId}/onboarding`)
                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default HotelAdminLayout;
