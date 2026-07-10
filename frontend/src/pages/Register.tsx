import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { UserPlus, Mail, Lock, User, Phone, Globe, AlertCircle, CheckCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email || !password || !name) {
      setError('Email, Password, and Name are required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullname: name,
          phone: phone || undefined,
          nationality: nationality || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during registration';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
          <p className="text-slate-400 text-sm">
            Sign up as a Student to begin your admission journey
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2 text-emerald-400 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Registration Successful!</span>
            </div>
            <p className="text-slate-400 text-xs">
              A mock email verification link has been logged to the server terminal. You will be
              redirected to the Login page shortly.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Nationality
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="Indian"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed text-sm pt-3"
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Register
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-sm text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
