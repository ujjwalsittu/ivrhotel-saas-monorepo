import React from 'react';
import { useSession } from '@/lib/auth-client';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { data: session, isPending, error } = useSession();

    if (isPending) {
        return <div>Loading...</div>; // Or a proper loading spinner
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes((session.user as any).role)) {
        return <div className="p-8 text-center text-red-500">Access Denied: You do not have permission to view this page.</div>; // Or redirect to unauthorized page
    }

    return <Outlet />;
};

export default ProtectedRoute;
