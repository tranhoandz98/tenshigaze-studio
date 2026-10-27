import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudioLayout } from './layouts/StudioLayout';
import { DashboardPage } from './pages/DashboardPage';
import { BookingsPage } from './pages/BookingsPage';
import { AlbumsPage } from './pages/AlbumsPage';
import { PublicAlbumPage } from './pages/PublicAlbumPage';
import { StaffPage } from './pages/StaffPage';
import { PayrollPage } from './pages/PayrollPage';
import { FinancePage } from './pages/FinancePage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Client Photo Selection Portal (no login needed) */}
        <Route path="/p/:slug" element={<PublicAlbumPage />} />

        {/* Internal Studio OS */}
        <Route path="/" element={<StudioLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="albums" element={<AlbumsPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
