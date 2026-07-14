import React from 'react';
import { useNavigate } from 'react-router';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-900 border border-red-500/20 p-8 rounded-2xl shadow-2xl">
        <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-400">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">Access Denied</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          You do not have the required permissions to view this resource. Please contact your
          administrator if you believe this is an error.
        </p>
        <div className="pt-4 flex flex-col gap-2">
          <button
            onClick={() => navigate('/')}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all cursor-pointer text-sm"
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all cursor-pointer text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
