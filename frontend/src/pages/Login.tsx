import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setLoading, setError } from '../store/authSlice';
import type { RootState } from '../store';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    dispatch(setError(null));

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    dispatch(setLoading(true));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      dispatch(
        setCredentials({
          user: result.data.user,
          accessToken: result.data.accessToken,
        }),
      );
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during login';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-slate-400 text-sm">
            Sign in to access your admission counselor portal
          </p>
        </div>

        {/* Errors */}
        {(validationError || error) && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-10 py-2.5 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-sm text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            Register as Student
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
