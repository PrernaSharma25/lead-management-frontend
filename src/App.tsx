import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import LeadsListPage from './features/leads/pages/LeadsListPage';
import CreateLeadPage from './features/leads/pages/CreateLeadPage';
import LeadDetailPage from './features/leads/pages/LeadDetailPage';
import EditLeadPage from './features/leads/pages/EditLeadPage';
import NotFoundPage from './features/notfound/pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="leads" element={<LeadsListPage />} />
            <Route path="leads/new" element={<CreateLeadPage />} />
            <Route path="leads/:id" element={<LeadDetailPage />} />
            <Route path="leads/:id/edit" element={<EditLeadPage />} />
            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
