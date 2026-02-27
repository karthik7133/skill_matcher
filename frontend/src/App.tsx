import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ProfileSetup from './pages/ProfileSetup';

const AppRoutes = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      <Route path="/logout" element={<LogoutHandler logout={logout} />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            user?.role === 'student' ? <Navigate to="/student" /> : <Navigate to="/recruiter" />
          }
        />

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['recruiter', 'admin']} />}>
          <Route path="/recruiter" element={<RecruiterDashboard />} />
        </Route>

        <Route path="/profile" element={<ProfileSetup />} />
      </Route>
    </Routes>
  );
};

const LogoutHandler = ({ logout }: { logout: () => void }) => {
  React.useEffect(() => {
    logout();
  }, [logout]);
  return <Navigate to="/login" />;
};

import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Layout>
            <AppRoutes />
          </Layout>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
