import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: ('USER' | 'ADMIN' | 'COUNSELOR' | 'STUDENT' | 'HOD')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page and preserve original path in state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Authenticated but does not have permission for the route
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-900 border border-red-500/20 p-8 rounded-2xl shadow-2xl">
          <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Unauthorized Access</h2>
          <p className="text-slate-400">
            You do not have permission to access this page. Please contact your administrator if you
            believe this is an error.
          </p>
          <div className="pt-2">
            <Navigate to="/" />
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-all"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
