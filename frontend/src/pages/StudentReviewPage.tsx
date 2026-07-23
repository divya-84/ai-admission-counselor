import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  ArrowLeft,
  User,
  MapPin,
  GraduationCap,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Clock,
  Download,
  Eye,
  Save,
  BookOpen,
  Code,
} from 'lucide-react';

export const StudentReviewPage: React.FC = () => {
  const params = useParams<{ studentId?: string; id?: string }>();
  const studentId = params.studentId || params.id;
  const navigate = useNavigate();

  const { token } = useSelector((state: RootState) => state.auth);

  // Counselor Decision & Remarks State
  const [counselorNotes, setCounselorNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Image / Document Preview Lightbox State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch complete student details using React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['studentDetails', studentId],
    queryFn: async () => {
      console.info('Fetching student details for ID:', studentId);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const activeToken = token || localStorage.getItem('token');
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      const res = await fetch(`/api/counselor/students/${studentId}`, {
        headers,
        credentials: 'include',
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch student details from database.');
      }
      return result.data.student;
    },
    enabled: !!studentId,
  });

  // Handle Counselor actions (Approve, Reject, Hold, Request Changes, Save Remarks)
  const handleAction = async (
    status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'HOLD' | 'REQUEST_CHANGES',
    customNotes?: string,
  ) => {
    if (!studentId) return;
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const activeAdmission = data?.admissions?.[0];
      const courseId = activeAdmission?.course?.id;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const activeToken = token || localStorage.getItem('token');
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      const notesToSubmit =
        customNotes !== undefined
          ? customNotes
          : counselorNotes || activeAdmission?.notes || 'Updated by counselor';

      const res = await fetch(`/api/counselor/students/${studentId}/offer`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          status,
          notes: notesToSubmit,
          appliedIntake: activeAdmission?.appliedIntake || data?.preferredIntake || 'Fall 2026',
        }),
      });

      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setSuccessMsg(`Student application status updated to ${status} successfully!`);
        refetch();
      } else {
        setErrorMsg(result.message || 'Failed to update application status.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while updating status in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRemarksOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeAdmission = data?.admissions?.[0];
    const currentStatus = activeAdmission?.status || 'UNDER_REVIEW';
    await handleAction(currentStatus as any, counselorNotes);
  };

  // Helper to format test scores or extra JSON
  const renderTestScores = (scores: any) => {
    if (!scores) return 'None recorded';
    let parsed = scores;
    if (typeof scores === 'string') {
      try {
        parsed = JSON.parse(scores);
      } catch {
        return scores;
      }
    }
    if (typeof parsed !== 'object') return String(parsed);
    const entries = Object.entries(parsed).filter(([k]) => k !== 'sop' && k !== 'skills');
    if (entries.length === 0) return 'None recorded';
    return entries.map(([key, val]) => `${key.toUpperCase()}: ${val}`).join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm font-medium">
            Loading complete student registration file from database...
          </span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-white">Review Record Load Failed</h2>
        <p className="text-slate-400 text-sm max-w-md text-center">
          {(error as Error)?.message ||
            'Student registration record could not be retrieved from database.'}
        </p>
        <button
          onClick={() => navigate('/counselor')}
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-all text-indigo-400"
        >
          &larr; Return to Assigned Students List
        </button>
      </div>
    );
  }

  const student = data;
  const activeAdmission = student.admissions?.[0];
  const currentStatus = activeAdmission?.status || student.status || 'PENDING';

  // Parse SOP and Skills from student fields or testScores
  let sopText = student.sop || '';
  let skillsData = student.skills || null;
  if (
    !sopText &&
    student.testScores &&
    typeof student.testScores === 'object' &&
    student.testScores.sop
  ) {
    sopText = student.testScores.sop;
  }
  if (
    !skillsData &&
    student.testScores &&
    typeof student.testScores === 'object' &&
    student.testScores.skills
  ) {
    skillsData = student.testScores.skills;
  }

  const hasDocuments = student.documents && student.documents.length > 0;
  const hasCounselor = activeAdmission?.counselorId !== null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Navbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-400">
              Back to Counselor Dashboard
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase">Application Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                currentStatus === 'APPROVED' || currentStatus === 'Approved'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  : currentStatus === 'REJECTED' || currentStatus === 'Rejected'
                    ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                    : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
              }`}
            >
              {currentStatus}
            </span>
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-2">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <User className="w-8 h-8 text-indigo-500" />
            Review Student Registration File
          </h1>
          <p className="text-slate-400 text-sm">
            Student:{' '}
            <strong className="text-slate-200">
              {student.user?.name || student.name || 'Anonymous'}
            </strong>{' '}
            ({student.user?.email || student.email})
            <span className="ml-3 font-mono text-xs text-indigo-400 font-semibold">
              ID: {student.id}
            </span>
          </p>
        </div>

        {/* Success/Error Alerts */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Application Audit Progress Bar */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            Application Audit Progress
          </h3>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-white">Application Submitted</p>
                <p className="text-[10px] text-slate-500">Record initialized</p>
              </div>
            </div>
            <div className="hidden md:block h-0.5 bg-slate-800 flex-1 mx-4"></div>

            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${hasDocuments ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400' : 'bg-slate-950 border border-slate-800 text-slate-600'}`}
              >
                {hasDocuments ? '✓' : '2'}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Documents Uploaded</p>
                <p className="text-[10px] text-slate-500">
                  {student.documents?.length || 0} Files in Vault
                </p>
              </div>
            </div>
            <div className="hidden md:block h-0.5 bg-slate-800 flex-1 mx-4"></div>

            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${hasCounselor ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400' : 'bg-slate-950 border border-slate-800 text-slate-600'}`}
              >
                {hasCounselor ? '✓' : '3'}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Counselor Assigned</p>
                <p className="text-[10px] text-slate-500">Advisor assigned</p>
              </div>
            </div>
            <div className="hidden md:block h-0.5 bg-slate-800 flex-1 mx-4"></div>

            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStatus !== 'APPLIED' && currentStatus !== 'PENDING' ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400' : 'bg-slate-950 border border-slate-800 text-slate-600'}`}
              >
                {currentStatus !== 'APPLIED' && currentStatus !== 'PENDING' ? '✓' : '4'}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Admissions Decision</p>
                <p className="text-[10px] text-slate-500">Status: {currentStatus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Personal Information & Address Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-indigo-400" /> 1. Personal Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Full Name:</span>
                <span className="text-slate-200 font-semibold">
                  {student.user?.name || student.name || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email Address:</span>
                <span className="text-slate-200 font-mono">
                  {student.user?.email || student.email || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile Phone:</span>
                <span className="text-slate-200">{student.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date of Birth:</span>
                <span className="text-slate-200">
                  {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gender:</span>
                <span className="text-slate-200 capitalize">{student.gender || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nationality:</span>
                <span className="text-slate-200">{student.nationality || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
              <MapPin className="w-4 h-4 text-indigo-400" /> Address Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Street Address:</span>
                <span className="text-slate-200">{student.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">City:</span>
                <span className="text-slate-200">{student.city || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">State:</span>
                <span className="text-slate-200">{student.state || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Country:</span>
                <span className="text-slate-200">{student.preferredCountry || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PIN Code:</span>
                <span className="text-slate-200 font-mono">{student.pinCode || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Parent Information */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
            <Users className="w-4 h-4 text-indigo-400" /> 2. Parent & Guardian Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="flex justify-between border-b border-slate-800/40 pb-2">
              <span className="text-slate-500">Father's Name:</span>
              <span className="text-slate-200 font-semibold">{student.fatherName || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-2">
              <span className="text-slate-500">Mother's Name:</span>
              <span className="text-slate-200 font-semibold">{student.motherName || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-2">
              <span className="text-slate-500">Parent / Guardian Contact:</span>
              <span className="text-slate-200 font-mono">{student.guardianContact || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* 3. Academic Information & Qualifying Details */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" /> 3. Academic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
              <span className="text-slate-500">Academic Level:</span>
              <span className="text-slate-200 capitalize">{student.academicLevel || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
              <span className="text-slate-500">High School Inst.:</span>
              <span className="text-slate-200">{student.highSchoolName || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
              <span className="text-slate-500">10th Overall Percentage:</span>
              <span className="text-slate-200 font-mono font-semibold">
                {student.tenthPercentage ? `${student.tenthPercentage}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
              <span className="text-slate-500">12th Overall Percentage:</span>
              <span className="text-slate-200 font-mono font-semibold">
                {student.twelfthPercentage ? `${student.twelfthPercentage}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
              <span className="text-slate-500">12th PCM Percentage:</span>
              <span className="text-indigo-400 font-mono font-bold">
                {student.twelfthPCMPercentage ? `${student.twelfthPCMPercentage}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
              <span className="text-slate-500">JEE Percentile:</span>
              <span className="text-indigo-400 font-mono font-bold">
                {student.jeePercentile ? student.jeePercentile : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
              <span className="text-slate-500">Recommended Course:</span>
              <span className="text-indigo-400 font-bold uppercase tracking-wide">
                {student.recommendedCourse || 'Currently Not Eligible'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
              <span className="text-slate-500">Passing Year:</span>
              <span className="text-slate-200 font-mono">{student.passingYear || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
              <span className="text-slate-500">GPA Score (Standardized):</span>
              <span className="text-amber-400 font-bold font-mono">
                {student.gpa ? parseFloat(student.gpa).toFixed(2) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
              <span className="text-slate-500">Active Backlogs:</span>
              <span className="text-red-400 font-bold font-mono">{student.backlogs ?? 0}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-1.5 md:col-span-2">
              <span className="text-slate-500">Standardized Test Scores:</span>
              <span className="text-slate-200 font-mono">
                {renderTestScores(student.testScores)}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Course Preferences */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
            <BookOpen className="w-4 h-4 text-indigo-400" /> 4. Course Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Intended Course:</span>
              <span className="text-white font-semibold">
                {activeAdmission?.course?.name || 'Not Selected'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Department / Specialization:</span>
              <span className="text-slate-200">
                {activeAdmission?.course?.department?.name || 'General'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Preferred Campus:</span>
              <span className="text-slate-200">{student.preferredCampus || 'Main Campus'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Session / Intake:</span>
              <span className="text-indigo-400 font-semibold font-mono">
                {activeAdmission?.appliedIntake || student.preferredIntake || 'Fall 2026'}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Uploaded Documents Vault */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
            <FileText className="w-4 h-4 text-indigo-400" /> 5. Uploaded Documents Vault
          </h3>
          {!student.documents || student.documents.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No credential documents uploaded by student yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {student.documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h5
                      className="font-bold text-white block max-w-[200px] truncate"
                      title={doc.name}
                    >
                      {doc.name}
                    </h5>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">
                      {doc.type}
                    </span>
                  </div>
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => {
                        if (
                          doc.url?.toLowerCase().endsWith('.pdf') ||
                          doc.type === 'MARKSHEET' ||
                          doc.type === 'TC'
                        ) {
                          window.open(doc.url, '_blank');
                        } else {
                          setPreviewImage(doc.url);
                        }
                      }}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer flex items-center gap-1 transition-all"
                      title="Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                    <a
                      href={doc.url}
                      download={doc.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 cursor-pointer flex items-center gap-1 transition-all"
                      title="Download Document"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Statement of Purpose (SOP) */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
            <FileText className="w-4 h-4 text-indigo-400" /> 6. Statement of Purpose (SOP)
          </h3>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 leading-relaxed font-sans min-h-[100px]">
            {sopText ? (
              <p className="whitespace-pre-line">{sopText}</p>
            ) : (
              <p className="text-slate-500 italic">No Statement of Purpose provided by student.</p>
            )}
          </div>
        </div>

        {/* 7. Technical Skills & Experience */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
            <Code className="w-4 h-4 text-indigo-400" /> 7. Technical Skills & Experience
          </h3>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 leading-relaxed">
            {skillsData ? (
              typeof skillsData === 'string' ? (
                <p>{skillsData}</p>
              ) : (
                <pre className="font-mono text-xs">{JSON.stringify(skillsData, null, 2)}</pre>
              )
            ) : (
              <p className="text-slate-500 italic">Standard technical profile submitted.</p>
            )}
          </div>
        </div>

        {/* 8. Counselor Evaluation & Decision Actions */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4 text-indigo-400" /> 8. Counselor Evaluation & Remarks
          </h3>
          <form onSubmit={handleSaveRemarksOnly} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase">
                Counselor Remarks & Feedback Notes
              </label>
              <textarea
                value={counselorNotes}
                onChange={(e) => setCounselorNotes(e.target.value)}
                placeholder="Write counselor feedback, document verification notes, or scholarship eligibility remarks..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
              ></textarea>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-3.5 h-3.5 text-indigo-400" />
                Save Remarks
              </button>

              <div className="inline-flex gap-3">
                <button
                  type="button"
                  onClick={() => handleAction('REQUEST_CHANGES')}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-550/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-xl text-xs font-semibold cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('HOLD')}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-500/10 text-amber-450 border border-amber-500/20 hover:bg-amber-500/20 rounded-xl text-xs font-semibold cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  Hold
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('REJECTED')}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-xs font-semibold cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('APPROVED')}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/10"
                >
                  Approve
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-slate-950/80 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Credential Preview"
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReviewPage;
