import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { UserPlus, Mail, Lock, User, Phone, MapPin, AlertCircle, CheckCircle, GraduationCap } from 'lucide-react';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [tenthPercentage, setTenthPercentage] = useState('');
  const [twelfthPercentage, setTwelfthPercentage] = useState('');
  const [twelfthPCMPercentage, setTwelfthPCMPercentage] = useState('');
  const [jeePercentile, setJeePercentile] = useState('');
  const [role, setRole] = useState('STUDENT');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email || !password || !confirmPassword || !name) {
      setError('Name, Email, Password, and Confirm Password are required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (role === 'STUDENT') {
      if (!fatherName || !motherName || !phone || !location || !tenthPercentage || !twelfthPercentage || !twelfthPCMPercentage || !jeePercentile) {
        setError('All fields (Father\'s Name, Mother\'s Name, Mobile, Location, 10th %, 12th %, 12th PCM %, JEE Percentile) are required for Students.');
        return;
      }

      const tenth = parseFloat(tenthPercentage);
      const twelfth = parseFloat(twelfthPercentage);
      const pcm = parseFloat(twelfthPCMPercentage);
      const jee = parseFloat(jeePercentile);

      if (isNaN(tenth) || tenth < 0 || tenth > 100 ||
          isNaN(twelfth) || twelfth < 0 || twelfth > 100 ||
          isNaN(pcm) || pcm < 0 || pcm > 100 ||
          isNaN(jee) || jee < 0 || jee > 100) {
        setError('All score percentages and percentiles must be valid numbers between 0 and 100.');
        return;
      }
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
          confirmPassword,
          fullname: name,
          phone: phone || undefined,
          role,
          fatherName: role === 'STUDENT' ? fatherName : undefined,
          motherName: role === 'STUDENT' ? motherName : undefined,
          location: role === 'STUDENT' ? location : undefined,
          tenthPercentage: role === 'STUDENT' ? parseFloat(tenthPercentage) : undefined,
          twelfthPercentage: role === 'STUDENT' ? parseFloat(twelfthPercentage) : undefined,
          twelfthPCMPercentage: role === 'STUDENT' ? parseFloat(twelfthPCMPercentage) : undefined,
          jeePercentile: role === 'STUDENT' ? parseFloat(jeePercentile) : undefined,
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
      <div className="max-w-2xl w-full bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
          <p className="text-slate-400 text-sm">
            Sign up to access the AI Admission Counselor portal
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
              Account created. A verification email has been triggered. You will be redirected to the Login page shortly.
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
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Role and Basic Credentials */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                    Register As *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none transition-all text-sm cursor-pointer"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="COUNSELOR">Admission Counselor (Authorized Email)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john.doe@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Student-Specific Information */}
            {role === 'STUDENT' && (
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-4">
                <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest border-b border-slate-850 pb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" /> Academic & Personal Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                      Father's Full Name *
                    </label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Father's Name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                      Mother's Full Name *
                    </label>
                    <input
                      type="text"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      placeholder="Mother's Name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                      Location / State *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Uttar Pradesh"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                      10th Overall % *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={tenthPercentage}
                      onChange={(e) => setTenthPercentage(e.target.value)}
                      placeholder="e.g. 85.5"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                      12th Overall % *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={twelfthPercentage}
                      onChange={(e) => setTwelfthPercentage(e.target.value)}
                      placeholder="e.g. 82.0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                      12th PCM % *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={twelfthPCMPercentage}
                      onChange={(e) => setTwelfthPCMPercentage(e.target.value)}
                      placeholder="e.g. 88.0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-350 text-xs font-bold uppercase tracking-wider">
                      JEE Percentile *
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={jeePercentile}
                      onChange={(e) => setJeePercentile(e.target.value)}
                      placeholder="e.g. 91.5"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center pt-2 text-sm text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
