import { Routes, Route, useNavigate, Outlet } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { clearCredentials, setError, setLoading } from './store/authSlice';
import type { RootState } from './store';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import CounselorDashboard from './pages/dashboards/CounselorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import HodDashboard from './pages/dashboards/HodDashboard';
import Chat from './pages/Chat';
import Recommendations from './pages/Recommendations';
import Eligibility from './pages/Eligibility';
import Scholarships from './pages/Scholarships';
import Documents from './pages/Documents';
import Appointments from './pages/Appointments';
import NotificationsPage from './pages/NotificationsPage';
import Analytics from './pages/Analytics';
import { LogOut, Bell } from 'lucide-react';

function DashboardLayout() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    dispatch(setLoading(true));
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      dispatch(clearCredentials());
      navigate('/login');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Logout failed';
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              AC
            </div>
            <span className="font-extrabold text-white tracking-tight hidden sm:inline-block">
              AI Admission Counselor
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === 'STUDENT' && (
              <button
                onClick={() => navigate('/notifications')}
                className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                title="Notifications Center"
              >
                <Bell className="w-4 h-4" />
              </button>
            )}
            {user?.role && user.role !== 'STUDENT' && (
              <button
                onClick={() => navigate('/analytics')}
                className="px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 transition-all text-xs font-semibold cursor-pointer"
              >
                Analytics Dashboard
              </button>
            )}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs text-slate-200 font-semibold">{user?.name}</span>
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>
      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function HomeRouter() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'COUNSELOR') return <CounselorDashboard />;
  if (user?.role === 'HOD') return <HodDashboard />;
  return <StudentDashboard />;
}

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected Dashboard Layout Pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomeRouter />} />

          {/* Specific Role Routes (for explicit matching or testing) */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/eligibility" element={<Eligibility />} />
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['COUNSELOR', 'ADMIN']} />}>
            <Route path="/counselor" element={<CounselorDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['HOD', 'ADMIN']} />}>
            <Route path="/hod" element={<HodDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['COUNSELOR', 'HOD', 'ADMIN']} />}>
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
