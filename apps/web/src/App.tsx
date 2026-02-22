import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { MattersPage } from '@/pages/matters';
import { ImanagePage } from '@/pages/imanage';
import { SynthesisPage } from '@/pages/synthesis';
import { TemplatesPage } from '@/pages/templates';
import { SubmissionsPage } from '@/pages/submissions';
import { LawyersPage } from '@/pages/lawyers';
import { RefereesPage } from '@/pages/referees';
import { ProfilePage } from '@/pages/profile';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="submissions" element={<SubmissionsPage />} />
          <Route path="matters" element={<MattersPage />} />
          <Route path="lawyers" element={<LawyersPage />} />
          <Route path="referees" element={<RefereesPage />} />
          <Route path="imanage" element={<ImanagePage />} />
          <Route path="synthesis" element={<SynthesisPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
