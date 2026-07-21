import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import type { RootState } from '../../store';
import {
  FileText,
  Calendar,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  FileCheck,
  Compass,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Mock data for student dashboard
  const applications = [
    {
      id: '1',
      course: 'M.S. in Computer Science',
      university: 'Stanford University',
      status: 'Under Review',
      step: 2,
    },
    {
      id: '2',
      course: 'B.S. in Software Engineering',
      university: 'University of Michigan',
      status: 'Approved',
      step: 3,
    },
  ];

  const appointments = [
    {
      id: '1',
      counselor: 'Dr. Sarah Jenkins',
      date: 'July 15, 2026',
      time: '10:00 AM',
      status: 'Scheduled',
    },
  ];

  const documents = [
    { id: '1', name: 'Academic Transcript.pdf', status: 'Verified' },
    { id: '2', name: 'IELTS Score Sheet.pdf', status: 'Verified' },
    { id: '3', name: 'Statement of Purpose.pdf', status: 'Pending Review' },
  ];

  const scholarships = [
    {
      id: '1',
      name: 'Global Tech Excellence Scholarship',
      amount: '$15,000',
      deadline: 'August 1, 2026',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-slate-400 text-sm">
              Track your applications, manage counseling appointments, and explore scholarships
              here.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              GPA: 3.85 (Academic Level: Graduate)
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Complete Registration Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Active Applications
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-white">2</span>
              <span className="text-indigo-400 text-xs font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> 1 Approved
              </span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-amber-400">1</span>
              <span className="text-slate-400 text-xs font-medium">Verify SOP</span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Documents Uploaded
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-white">3</span>
              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> 2 Verified
              </span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Counseling Session
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-white">1</span>
              <span className="text-slate-400 text-xs font-medium">In 5 Days</span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Applications & Stepper */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applications Card */}
            <div className="bg-slate-900/45 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Active Applications
              </h2>

              <div className="space-y-6 pt-2">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-base">{app.course}</h4>
                        <p className="text-xs text-slate-500">{app.university}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          app.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    {/* Progress Stepper */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>1. Applied</span>
                        <span>2. Review</span>
                        <span>3. Decision</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${(app.step / 3) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Checklist Card */}
            <div className="bg-slate-900/45 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                Uploaded Documents
              </h2>

              <div className="divide-y divide-slate-800/80">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3 flex justify-between items-center first:pt-0 last:pb-0"
                  >
                    <span className="text-sm text-slate-300">{doc.name}</span>
                    <span
                      className={`text-xs font-medium flex items-center gap-1.5 ${
                        doc.status === 'Verified' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {doc.status === 'Verified' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Appointments & Scholarships */}
          <div className="space-y-6">
            {/* Appointment bookings */}
            <div className="bg-slate-900/45 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Advisor Sessions
              </h2>

              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3"
                >
                  <div>
                    <h4 className="font-semibold text-white text-sm">{apt.counselor}</h4>
                    <p className="text-xs text-slate-400">
                      {apt.date} at {apt.time}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                      {apt.status}
                    </span>
                    <button
                      onClick={() => navigate('/appointments')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
                    >
                      Details <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => navigate('/appointments')}
                  className="w-full text-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Schedule Session
                </button>
              </div>
            </div>

            {/* Matching Scholarships */}
            <div className="bg-slate-900/45 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Eligible Aid
              </h2>

              {scholarships.map((sch) => (
                <div
                  key={sch.id}
                  className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-white text-sm leading-snug">{sch.name}</h4>
                    <span className="text-emerald-400 font-bold text-sm">{sch.amount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Deadline: {sch.deadline}</span>
                    <button
                      onClick={() => navigate('/scholarships')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => navigate('/scholarships')}
                  className="w-full text-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Explore Recommendations
                </button>
              </div>
            </div>

            {/* Document Vault Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/30 to-slate-900 border border-indigo-500/10 space-y-3 text-left">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                Document Vault (OCR)
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Upload Aadhaar, Academic Marksheets, TC, and photo for automated credential
                verification checks.
              </p>
              <button
                onClick={() => navigate('/documents')}
                className="inline-flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-semibold shadow-md transition-all cursor-pointer"
              >
                Manage Documents <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Eligibility Checker Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/30 to-slate-900 border border-indigo-500/10 space-y-3 text-left">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Eligibility Checker
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Check whether you satisfy specific prerequisite subjects, entrance exams, or
                reservation category grades.
              </p>
              <button
                onClick={() => navigate('/eligibility')}
                className="inline-flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-semibold shadow-md transition-all cursor-pointer"
              >
                Verify Qualifications <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Course Matcher Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/30 to-slate-900 border border-indigo-500/10 space-y-3 text-left">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                AI Course Matcher
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Not sure which course fits your academic background and budget? Run our
                recommendation scanner.
              </p>
              <button
                onClick={() => navigate('/recommendations')}
                className="inline-flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-semibold shadow-md transition-all cursor-pointer"
              >
                Find Recommendations <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chatbot Quick Launch Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/30 to-slate-900 border border-indigo-500/10 space-y-3 text-left">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Ask Counselor AI
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Have questions about requirements, visa documentation, or course eligibilities?
                Start a chat session with our AI advisor.
              </p>
              <button
                onClick={() => navigate('/chat')}
                className="inline-flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-semibold shadow-md transition-all cursor-pointer"
              >
                Launch Chatbot <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
