import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isChecking, setIsChecking] = useState(true);
  const { accessToken, role } = useAuthStore();

  // Wait for Zustand persist to hydrate
  useEffect(() => {
    // Small delay to ensure persist has loaded from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!accessToken) {
    // Redirect to appropriate login page
    if (allowedRoles.includes('student')) {
      return <Navigate to="/student/login" replace />;
    }
    if (allowedRoles.includes('teacher')) {
      return <Navigate to="/teacher/login" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // User is authenticated but wrong role, redirect to their dashboard
    if (role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    if (role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
