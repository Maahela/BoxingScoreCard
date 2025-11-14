import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { InvigilatorDashboard } from './pages/InvigilatorDashboard';
import { DisplayScreen } from './pages/DisplayScreen';

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { auth } = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (auth.role && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { auth } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          auth.isAuthenticated ? (
            <Navigate
              to={
                auth.role === 'admin'
                  ? '/admin'
                  : auth.role === 'invigilator'
                  ? '/invigilator'
                  : '/display'
              }
              replace
            />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invigilator"
        element={
          <ProtectedRoute allowedRoles={['invigilator']}>
            <InvigilatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/display"
        element={
          <ProtectedRoute allowedRoles={['display']}>
            <DisplayScreen />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
