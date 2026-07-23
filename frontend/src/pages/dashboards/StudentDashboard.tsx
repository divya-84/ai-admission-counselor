import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import type { RootState } from '../../store';
import {
  FileText,
  Award,
  Sparkles,
  ArrowRight,
  FileCheck,
  UploadCloud,
  Download,
  AlertCircle,
  FileDown,
  Info,
} from 'lucide-react';

interface GlobalDoc {
  id: string;
  name: string;
  fileName: string;
  url: string;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [student, setStudent] = useState<any>(null);
  const [globalDocs, setGlobalDocs] = useState<GlobalDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // 1. Fetch Student profile & Admissions
        const profileRes = await fetch('/api/student/profile');
        const profileData = await profileRes.json();
        if (profileRes.ok && profileData.status === 'success') {
          setStudent(profileData.data.student);
        } else {
          setError(profileData.message || 'Failed to load profile data.');
        }

        // 2. Fetch Institutional Global Documents
        const docsRes = await fetch('/api/documents/global-list');
        const docsData = await docsRes.json();
        if (docsRes.ok && docsData.status === 'success') {
          setGlobalDocs(docsData.data.documents);
        }
      } catch (err) {
        setError('Failed to establish database connection to load dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const firstAdmission = student?.admissions?.[0];
  const applicationStatus = firstAdmission?.status || 'APPLIED';
  const counselorRemarks = firstAdmission?.notes || 'Application registered and pending counselor review.';
  const registrationDate = student?.createdAt
    ? new Date(student.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not Registered';

  // Get status CSS classes
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'HOLD':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'REQUEST_CHANGES':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    }
  };

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
              Track your admission status, eligibility guidelines, fee structure, and aid applications here.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {student && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                12th PCM: {student.twelfthPCMPercentage}% | JEE: {student.jeePercentile} Percentile
              </div>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Update Profile details
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Loading your student dashboard...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1 & 2: Admission Application Status & Stepper */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Application Card */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Admission Application Status
                  </h2>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(applicationStatus)}`}>
                    {applicationStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Automatically Recommended Course</span>
                    <h3 className="text-2xl font-extrabold text-white leading-tight mt-1">
                      {student?.recommendedCourse || 'Currently Not Eligible'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Registration Date</span>
                      <p className="text-sm text-slate-350 mt-1">{registrationDate}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Applicant Location</span>
                      <p className="text-sm text-slate-350 mt-1">{student?.location || 'Not Specified'}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Counselor Remarks & Decisions</span>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 mt-1.5 leading-relaxed">
                      {counselorRemarks}
                    </div>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="pt-4 border-t border-slate-850 space-y-3">
                  <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span className={applicationStatus !== 'REJECTED' ? 'text-indigo-400' : ''}>1. Registered</span>
                    <span className={['UNDER_REVIEW', 'APPROVED', 'HOLD'].includes(applicationStatus) ? 'text-indigo-400' : ''}>2. Reviewing</span>
                    <span className={applicationStatus === 'APPROVED' ? 'text-emerald-400' : ''}>3. Decision</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${applicationStatus === 'APPROVED' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{
                        width: applicationStatus === 'APPROVED' ? '100%' : ['UNDER_REVIEW', 'HOLD', 'REQUEST_CHANGES'].includes(applicationStatus) ? '66%' : '33%'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Institutional Fee Structures Documents */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-400" />
                  Institutional Documents & Fees
                </h2>
                <p className="text-slate-400 text-xs">
                  View or download official fee brochures uploaded by the admissions committee.
                </p>

                {globalDocs.length === 0 ? (
                  <div className="p-6 bg-slate-950/40 border border-slate-850 rounded-xl text-center text-slate-500 text-sm">
                    No official brochures have been uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {globalDocs.map((doc) => (
                      <div key={doc.id} className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex justify-between items-center transition-all">
                        <div className="space-y-1 truncate pr-2">
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">{doc.name.replace('_', ' ')}</h4>
                          <p className="text-xs text-slate-500 truncate">{doc.fileName}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setActivePdfUrl(doc.url)}
                            className="p-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-all cursor-pointer"
                            title="View PDF Document"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <a
                            href={doc.url}
                            download={doc.fileName}
                            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                            title="Download Brochure"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Scholarships & Action Cards */}
            <div className="space-y-6">
              {/* Government Scholarships Read-Only Panel */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-850 pb-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  Government Scholarships
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Admitted students are eligible for direct state and national financial aid programs. Explore official links below:
                </p>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">UP Scholarship Portal</span>
                      <span className="text-[10px] bg-indigo-500/15 text-indigo-300 font-semibold px-2 py-0.5 rounded">Post-Matric</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-snug">
                      Fee reimbursement and maintenance allowances for residents of Uttar Pradesh (General/OBC/SC/ST/Minority).
                    </p>
                    <a
                      href="https://scholarship.up.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold mt-2"
                    >
                      Visit UP Portal <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">National Scholarship (NSP)</span>
                      <span className="text-[10px] bg-indigo-500/15 text-indigo-300 font-semibold px-2 py-0.5 rounded">Govt of India</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-snug">
                      National portal supporting Central Sector schemes, Pragati/Saksham scholarships, and minority aid programs.
                    </p>
                    <a
                      href="https://scholarships.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold mt-2"
                    >
                      Visit NSP Portal <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* RAG Chatbot Quick Link */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/30 to-slate-900 border border-indigo-500/10 space-y-3 text-left">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Ask Counselor AI
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Have questions about tuition rules, admission cutoff limits, or courses? Ask our AI agent.
                </p>
                <button
                  onClick={() => navigate('/chat')}
                  className="inline-flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-semibold shadow-md transition-all cursor-pointer"
                >
                  Start Chat Session <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Document Vault Link */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/30 to-slate-900 border border-indigo-500/10 space-y-3 text-left">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-indigo-400" />
                  Upload Marksheets (OCR)
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Submit high school and secondary grade cards for automated extraction and advisor confirmation.
                </p>
                <button
                  onClick={() => navigate('/documents')}
                  className="inline-flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-semibold shadow-md transition-all cursor-pointer"
                >
                  Manage Certificates <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF Interactive Viewer Modal */}
      {activePdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 shrink-0">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileDown className="w-5 h-5 text-indigo-400" />
                Institutional Brochure Viewer
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={activePdfUrl}
                  download
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  onClick={() => setActivePdfUrl(null)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-950 relative">
              <iframe
                src={activePdfUrl}
                title="Institutional PDF Viewer"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
