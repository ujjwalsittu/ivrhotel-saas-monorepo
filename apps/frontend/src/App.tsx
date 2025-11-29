import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import Dashboard from './pages/super-admin/Dashboard';
import HotelOnboarding from './pages/super-admin/HotelOnboarding';
import HotelList from './pages/super-admin/HotelList';

import HotelAdminLayout from './layouts/HotelAdminLayout';
import FloorManagement from './pages/hotel-admin/FloorManagement';
import RoomTypeManagement from './pages/hotel-admin/RoomTypeManagement';
import RoomManagement from './pages/hotel-admin/RoomManagement';
import StaffManagement from './pages/hotel-admin/StaffManagement';
import BookingManagement from './pages/hotel-admin/BookingManagement';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/super-admin/dashboard" replace />} />

      <Route path="/super-admin" element={<SuperAdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="onboarding" element={<HotelOnboarding />} />
        <Route path="hotels" element={<HotelList />} />
        <Route path="plans" element={<div>Plans (Coming Soon)</div>} />
      </Route>

      <Route path="/hotel/:hotelId" element={<HotelAdminLayout />}>
        <Route path="dashboard" element={<div>Hotel Dashboard</div>} />
        <Route path="floors" element={<FloorManagement />} />
        <Route path="room-types" element={<RoomTypeManagement />} />
        <Route path="rooms" element={<RoomManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
      </Route>
    </Routes>
  );
}

export default App;
