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
    return <Navigate to="/login" replace />;
  }

  // If role is missing or not allowed, force re-auth at login to avoid redirect loops
  if (!auth.role || !allowedRoles.includes(auth.role)) {
    return <Navigate to="/login" replace />;
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
          auth.isAuthenticated && auth.role ? (
            <Navigate
              to={auth.role === 'admin' ? '/admin' : '/invigilator'}
              replace
            />
          ) : (
            <Login />
          )
        }
      />
      <Route path="/login" element={<Login />} />
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
      <Route path="/display" element={<DisplayScreen />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
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
