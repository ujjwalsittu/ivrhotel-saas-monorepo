import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import Dashboard from './pages/super-admin/Dashboard';
import HotelOnboarding from './pages/super-admin/HotelOnboarding';
import HotelList from './pages/super-admin/HotelList';
import PlanManagement from './pages/super-admin/PlanManagement';
import BrandManagement from './pages/super-admin/BrandManagement';

import HotelAdminLayout from './layouts/HotelAdminLayout';
import FloorManagement from './pages/hotel-admin/FloorManagement';
import RoomTypeManagement from './pages/hotel-admin/RoomTypeManagement';
import RoomManagement from './pages/hotel-admin/RoomManagement';
import StaffManagement from './pages/hotel-admin/StaffManagement';
import BookingManagement from './pages/hotel-admin/BookingManagement';
import HotelDashboard from './pages/hotel-admin/Dashboard';

import MenuManagement from './pages/hotel-admin/POS/MenuManagement';
import OrderTaking from './pages/hotel-admin/POS/OrderTaking';
import OrderList from './pages/hotel-admin/POS/OrderList';

import HousekeepingDashboard from './pages/hotel-admin/Housekeeping/HousekeepingDashboard';
import MaintenanceRequest from './pages/hotel-admin/Housekeeping/MaintenanceRequest';

import InvoiceList from './pages/hotel-admin/Billing/InvoiceList';
import InvoiceDetails from './pages/hotel-admin/Billing/InvoiceDetails';

import ExpenseDashboard from './pages/hotel-admin/Finance/ExpenseDashboard';
import PayrollManagement from './pages/hotel-admin/Finance/PayrollManagement';

import OnboardingWizard from './pages/hotel-admin/Onboarding/OnboardingWizard';
import HotelVerification from './pages/super-admin/HotelVerification';
import KYCForm from './pages/guest/KYCForm';
import PaymentManagement from './pages/hotel-admin/PaymentManagement';
import ChannelManager from './pages/hotel-admin/ChannelManager';
import GuestCRM from './pages/hotel-admin/GuestCRM';
import Campaigns from './pages/hotel-admin/Campaigns';
import Analytics from './pages/hotel-admin/Analytics';
import SignIn from './components/auth/sign-in';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<SignIn />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public KYC Route */}
      <Route path="/kyc/:token" element={<KYCForm />} />

      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="onboarding" element={<HotelOnboarding />} />
          <Route path="hotels" element={<HotelList />} />
          <Route path="hotels/:hotelId/verify" element={<HotelVerification />} />
          <Route path="plans" element={<PlanManagement />} />
          <Route path="brands" element={<BrandManagement />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['HOTEL_ADMIN', 'MANAGER', 'FRONT_DESK', 'HOUSEKEEPING']} />}>
        <Route path="/hotel/:hotelId" element={<HotelAdminLayout />}>
          <Route path="dashboard" element={<HotelDashboard />} />
          <Route path="floors" element={<FloorManagement />} />
          <Route path="room-types" element={<RoomTypeManagement />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="bookings" element={<BookingManagement />} />

          {/* POS Routes */}
          <Route path="pos/menu" element={<MenuManagement />} />
          <Route path="pos/order" element={<OrderTaking />} />
          <Route path="pos/orders" element={<OrderList />} />

          {/* Housekeeping Routes */}
          <Route path="housekeeping" element={<HousekeepingDashboard />} />
          <Route path="maintenance" element={<MaintenanceRequest />} />

          {/* Billing Routes */}
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />

          {/* Finance Routes */}
          <Route path="finance/expenses" element={<ExpenseDashboard />} />
          <Route path="finance/payroll" element={<PayrollManagement />} />

          {/* Payment Management */}
          <Route path="payments" element={<PaymentManagement />} />

          {/* Channel Manager */}
          <Route path="channels" element={<ChannelManager />} />

          {/* CRM */}
          <Route path="crm" element={<GuestCRM />} />

          {/* Campaigns */}
          <Route path="campaigns" element={<Campaigns />} />

          {/* Analytics */}
          <Route path="analytics" element={<Analytics />} />

          {/* Onboarding */}
          <Route path="onboarding" element={<OnboardingWizard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
