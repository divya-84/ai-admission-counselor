import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { MailCheck, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Verification failed');
        }

        setStatus('success');
        setMessage(result.message || 'Email verified successfully!');
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Verification failed. The token may be invalid or expired.';
        setStatus('error');
        setMessage(message);
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl space-y-6 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <h2 className="text-2xl font-bold text-white">Verifying Email</h2>
            <p className="text-slate-400 text-sm">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-4 space-y-2">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400">
              <MailCheck className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
            <p className="text-slate-400 text-sm">{message}</p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg hover:shadow-indigo-500/20 transition-all text-sm cursor-pointer"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-4 space-y-2">
            <div className="p-3 rounded-full bg-red-500/10 text-red-400">
              <ShieldAlert className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-slate-400 text-sm">{message}</p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all text-sm cursor-pointer"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
