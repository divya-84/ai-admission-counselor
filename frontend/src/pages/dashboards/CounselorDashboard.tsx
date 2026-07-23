import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import type { RootState } from '../../store';
import {
  Users,
  Calendar,
  Clock,
  Sparkles,
  Search,
  ClipboardList,
  X,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Award,
  TrendingUp,
} from 'lucide-react';

export const CounselorDashboard: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Selected Student for Modal Review
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'ai' | 'offer'>('profile');

  // Global Brochure Upload State
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [brochureName, setBrochureName] = useState<string>('academic_fee');
  const [isUploadingBrochure, setIsUploadingBrochure] = useState<boolean>(false);
  const [brochureSuccess, setBrochureSuccess] = useState<string>('');
  const [brochureError, setBrochureError] = useState<string>('');

  // Course Offer Form State
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [offerIntake, setOfferIntake] = useState<string>('Fall 2026');
  const [offerStatus, setOfferStatus] = useState<string>('UNDER_REVIEW');
  const [offerNotes, setOfferNotes] = useState<string>('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState<boolean>(false);
  const [offerSuccess, setOfferSuccess] = useState<string>('');
  const [offerError, setOfferError] = useState<string>('');

  // AI Evaluation State
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [aiEligibility, setAiEligibility] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');
  const [aiInterest, setAiInterest] = useState<string>('Computer Science');
  const [aiBudget, setAiBudget] = useState<number>(25000);
  const [aiCareerGoal, setAiCareerGoal] = useState<string>('Software Engineer');

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setError('');
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        const activeToken = token || localStorage.getItem('token');
        if (activeToken) {
          headers['Authorization'] = `Bearer ${activeToken}`;
        }

        const params = new URLSearchParams({
          search: searchTerm,
          filter,
          page: String(page),
          limit: '10',
        });

        const response = await fetch(`/api/counselor/students?${params.toString()}`, {
          headers,
          credentials: 'include',
        });
        const result = await response.json();
        if (response.ok && result.status === 'success') {
          const mappedStudents = result.data.students.map((student: any) => {
            const studentId = student.id || student._id || student.userId;
            return {
              ...student,
              id: studentId,
              _id: studentId,
              applicationId: student.applicationId || student.admissions?.[0]?.id || studentId,
              formattedName:
                student.name || student.user?.name || student.user?.email || 'Anonymous Student',
              formattedCourse: student.admissions?.[0]?.course?.name || 'Not Selected',
              formattedGpa: student.gpa ? parseFloat(student.gpa).toFixed(2) : 'N/A',
              formattedStatus: student.status || 'Pending Review',
              formattedCountry: student.preferredCountry || 'Not Specified',
              twelfthPCM: student.twelfthPCMPercentage ? Number(student.twelfthPCMPercentage) : 0,
              jee: student.jeePercentile ? Number(student.jeePercentile) : 0,
              recommendedCourse: student.recommendedCourse || 'Currently Not Eligible',
            };
          });
          setStudents(mappedStudents);
          if (result.data.pagination) {
            setTotalPages(result.data.pagination.pages || 1);
          }
        } else {
          setError(result.message || 'Failed to fetch student data');
        }
      } catch (err) {
        console.error('fetchStudents error:', err);
        setError('Error connecting to backend server');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCourses = async () => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        const activeToken = token || localStorage.getItem('token');
        if (activeToken) {
          headers['Authorization'] = `Bearer ${activeToken}`;
        }

        const response = await fetch('/api/counselor/courses', {
          headers,
          credentials: 'include',
        });
        const result = await response.json();
        if (response.ok && result.status === 'success') {
          setCourses(result.data.courses || []);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };

    fetchStudents();
    fetchCourses();
  }, [token, searchTerm, filter, page]);

  // Handler for navigating to student review page
  const handleReviewStudent = (e: React.MouseEvent, student: any) => {
    e.preventDefault();
    e.stopPropagation();
    const targetId =
      student.id ||
      student._id ||
      student.userId ||
      student.studentId ||
      student.admissions?.[0]?.studentId;
    console.info('Review button clicked for student ID:', targetId, student);
    if (targetId) {
      navigate(`/counselor/students/${targetId}`);
    } else {
      console.error('Cannot navigate: student ID is missing in student object', student);
    }
  };

  const handleBrochureUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brochureFile) {
      setBrochureError('Please select a PDF file first.');
      return;
    }
    setIsUploadingBrochure(true);
    setBrochureSuccess('');
    setBrochureError('');

    const formData = new FormData();
    formData.append('file', brochureFile);
    formData.append('name', brochureName);

    try {
      const activeToken = token || localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      const res = await fetch('/api/documents/global-upload', {
        method: 'POST',
        headers,
        body: formData,
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setBrochureSuccess('Brochure uploaded successfully!');
        setBrochureFile(null);
      } else {
        setBrochureError(result.message || 'Brochure upload failed.');
      }
    } catch {
      setBrochureError('Network error uploading brochure.');
    } finally {
      setIsUploadingBrochure(false);
    }
  };

  // Pre-populate offer form and AI parameters when student changes
  useEffect(() => {
    if (selectedStudent) {
      setActiveTab('profile');
      const firstAdmission = selectedStudent.admissions?.[0];
      setSelectedCourseId(firstAdmission?.course?.id || '');
      setOfferIntake(firstAdmission?.appliedIntake || 'Fall 2026');
      setOfferStatus(firstAdmission?.status || 'UNDER_REVIEW');
      setOfferNotes(firstAdmission?.notes || '');

      setAiRecommendations([]);
      setAiEligibility([]);
      setAiError('');

      setAiInterest(
        firstAdmission?.course?.name || selectedStudent.academicLevel || 'Computer Science',
      );
      setAiBudget(25000);
      setAiCareerGoal(firstAdmission?.notes || 'Software Engineer');
    }
  }, [selectedStudent]);

  const filteredStudents = students; // Querying dynamically now, no need for client-side filtering!

  const appointments = [
    {
      id: '1',
      student: 'Alice Watson',
      date: 'July 12, 2026',
      time: '11:00 AM',
      topic: 'Course Selection',
    },
    {
      id: '2',
      student: 'Bob Carter',
      date: 'July 14, 2026',
      time: '02:30 PM',
      topic: 'SOP Review',
    },
  ];

  // Helper: Format test scores
  const renderTestScores = (scores: any) => {
    if (!scores) return 'No test scores recorded';
    let parsed = scores;
    if (typeof scores === 'string') {
      try {
        parsed = JSON.parse(scores);
      } catch {
        return scores;
      }
    }
    const entries = Object.entries(parsed);
    if (entries.length === 0) return 'No test scores recorded';
    return entries.map(([key, val]) => `${key.toUpperCase()}: ${val}`).join(', ');
  };

  // Helper: Calculate age from DOB
  const calculateAge = (dobString: string) => {
    if (!dobString) return 20;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Run AI recommendations and eligibility checklist check
  const handleAiEvaluation = async () => {
    if (!selectedStudent) return;
    setIsAiLoading(true);
    setAiError('');
    setAiRecommendations([]);
    setAiEligibility([]);

    try {
      // Calculate marks percentage from GPA (e.g. GPA * 25 if GPA is standard out of 4.0)
      let marksPct = 75;
      if (selectedStudent.gpa) {
        const val = parseFloat(selectedStudent.gpa);
        marksPct = val <= 4.0 ? Math.round(val * 25) : Math.round(val);
      }

      // Parse test scores if any
      let examName = undefined;
      let examScore = undefined;
      if (selectedStudent.testScores) {
        let scores = selectedStudent.testScores;
        if (typeof scores === 'string') {
          try {
            scores = JSON.parse(scores);
          } catch (e) {
            console.warn('Invalid testScores JSON:', e);
          }
        }
        const entries = Object.entries(scores);
        if (entries.length > 0) {
          examName = entries[0][0].toUpperCase();
          examScore = Number(entries[0][1]);
        }
      }

      // 1. Fetch recommendations
      const recRes = await fetch('/api/recommendations/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marks: marksPct,
          interest: aiInterest,
          budget: Number(aiBudget),
          careerGoal: aiCareerGoal,
          entranceExam: examName,
          entranceScore: examScore,
        }),
      });
      const recResult = await recRes.json();

      // 2. Fetch eligibility checks
      const eligRes = await fetch('/api/eligibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marks: marksPct,
          reservation: 'General',
          entranceExam: examName,
          entranceScore: examScore,
          age: selectedStudent.dateOfBirth ? calculateAge(selectedStudent.dateOfBirth) : 20,
          subjects: ['Mathematics', 'Physics', 'English'],
        }),
      });
      const eligResult = await eligRes.json();

      if (recRes.ok && eligRes.ok) {
        setAiRecommendations(recResult.data.recommendations || []);
        setAiEligibility(eligResult.data.results || []);
      } else {
        setAiError(recResult.message || eligResult.message || 'Failed to complete AI evaluations.');
      }
    } catch (err) {
      console.error('handleAiEvaluation error:', err);
      setAiError('An error occurred connecting to matching engines.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Submit Course Offer
  const handleOfferCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCourseId) return;

    setIsSubmittingOffer(true);
    setOfferSuccess('');
    setOfferError('');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/counselor/students/${selectedStudent.id}/offer`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          courseId: selectedCourseId,
          status: offerStatus,
          appliedIntake: offerIntake,
          notes: offerNotes,
        }),
      });
      const result = await res.json();

      if (res.ok && result.status === 'success') {
        setOfferSuccess('Course offered and updated successfully!');

        // Update table row state
        setStudents((prevStudents) =>
          prevStudents.map((stud) => {
            if (stud.id === selectedStudent.id) {
              const updatedAdmission = result.data.admission;
              return {
                ...stud,
                admissions: [updatedAdmission],
                formattedCourse: updatedAdmission.course?.name || 'Not Selected',
                formattedStatus: updatedAdmission.status || 'Pending Review',
              };
            }
            return stud;
          }),
        );

        setTimeout(() => {
          setSelectedStudent(null);
          setOfferSuccess('');
        }, 1500);
      } else {
        setOfferError(result.message || 'Failed to submit course offer.');
      }
    } catch (err) {
      console.error('handleOfferCourseSubmit error:', err);
      setOfferError('Error connecting to backend server.');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              Welcome back, Advisor {user?.name || 'Counselor'}!
            </h1>
            <p className="text-slate-400 text-sm">
              Review assigned student files, check schedule availability, and process applications.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Specialization: USA & Canada Admissions
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Assigned Caseload
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-white">12</span>
              <span className="text-indigo-400 text-xs font-medium flex items-center gap-1">
                <Users className="w-4 h-4" /> 3 New this week
              </span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Awaiting Review
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-amber-400">4</span>
              <span className="text-slate-400 text-xs font-medium">Files Pending</span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Approved this Term
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-emerald-400">8</span>
              <span className="text-slate-400 text-xs font-medium">Completed Files</span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Advisor Rating
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-white">4.92 / 5.0</span>
              <span className="text-slate-400 text-xs font-medium">96 Feedback reviews</span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Students Table */}
          <div className="lg:col-span-2 bg-slate-900/45 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
                Assigned Students List
              </h2>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-350 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">All Applications</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="HOLD">Hold</option>
                  <option value="TODAY">Today's Registration</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="pb-3 pr-2">Student Name</th>
                    <th className="pb-3 pr-2">Intended Course</th>
                    <th className="pb-3 pr-2 text-center">12th PCM %</th>
                    <th className="pb-3 pr-2 text-center">JEE %tile</th>
                    <th className="pb-3 pr-2">Recommended Course</th>
                    <th className="pb-3 pr-2">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-slate-700 border-t-indigo-500 mr-2 align-middle"></span>
                        Loading student records...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-red-400 font-semibold">
                        {error}
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No registered students found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="group hover:bg-slate-800/10 transition-colors"
                      >
                        <td className="py-4 font-semibold text-white pr-2">
                          <p className="truncate max-w-[120px]" title={student.formattedName}>{student.formattedName}</p>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">{student.email}</span>
                        </td>
                        <td className="py-4 text-slate-300 pr-2">
                          <span className="truncate block max-w-[120px] font-medium" title={student.formattedCourse}>{student.formattedCourse}</span>
                        </td>
                        <td className="py-4 text-center text-slate-300 font-mono pr-2 font-semibold">
                          {student.twelfthPCM ? `${student.twelfthPCM}%` : 'N/A'}
                        </td>
                        <td className="py-4 text-center text-slate-300 font-mono pr-2 font-semibold">
                          {student.jee ? student.jee : 'N/A'}
                        </td>
                        <td className="py-4 text-slate-300 pr-2">
                          <span className="text-xs font-bold text-indigo-400 block truncate max-w-[150px]" title={student.recommendedCourse}>
                            {student.recommendedCourse}
                          </span>
                        </td>
                        <td className="py-4 pr-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              student.formattedStatus === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : ['PENDING', 'UNDER_REVIEW', 'APPLIED'].includes(student.formattedStatus)
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                  : student.formattedStatus === 'REJECTED'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {student.formattedStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={(e) => handleReviewStudent(e, student)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all cursor-pointer shadow-md hover:shadow-indigo-500/25"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Bookings & PDF Upload */}
          <div className="space-y-6">
            {/* Upload Fee Brochures Card */}
            <div className="bg-slate-900/45 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                Upload Fee Brochures
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Add or overwrite institutional fee brochures for all students.
              </p>

              {brochureSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  {brochureSuccess}
                </div>
              )}
              {brochureError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  {brochureError}
                </div>
              )}

              <form onSubmit={handleBrochureUpload} className="space-y-4 pt-1">
                <div className="space-y-1">
                  <label className="text-slate-450 text-[10px] font-bold uppercase tracking-wider block">Brochure Type *</label>
                  <select
                    value={brochureName}
                    onChange={(e) => setBrochureName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="academic_fee">Academic Fee Structure</option>
                    <option value="hostel_fee">Hostel Fee Structure</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-450 text-[10px] font-bold uppercase tracking-wider block">PDF Document *</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setBrochureFile(e.target.files[0]);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600/10 file:text-indigo-400 file:hover:bg-indigo-600/20 file:cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploadingBrochure}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUploadingBrochure ? 'Uploading File...' : 'Upload Brochure'}
                </button>
              </form>
            </div>

            {/* Appointments Calendar Column */}
            <div className="bg-slate-900/45 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Today's Bookings
              </h2>

              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3 group hover:border-indigo-500/20 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                          {apt.student}
                        </h4>
                        <p className="text-xs text-slate-500">{apt.topic}</p>
                      </div>
                      <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                        <Clock className="w-3 h-3" />
                        {apt.time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Date: {apt.date}</span>
                      <button className="text-indigo-400 hover:underline font-semibold cursor-pointer">
                        Start Call
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Student Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-indigo-400" />
                Review Profile: {selectedStudent.formattedName}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Evaluate student details, review uploaded documents, check RAG/AI recommendations,
                and assign courses.
              </p>
            </div>

            {/* Modal Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
              {(['profile', 'documents', 'ai', 'offer'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  {tab === 'ai'
                    ? 'AI Recommendations'
                    : tab === 'documents'
                      ? 'Documents & Scholarships'
                      : tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Profile Details */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal info card */}
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4" /> Personal Details
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Email Address:</span>
                        <span className="text-slate-200 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />{' '}
                          {selectedStudent.user?.email || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Phone Number:</span>
                        <span className="text-slate-200 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />{' '}
                          {selectedStudent.phone || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Date of Birth:</span>
                        <span className="text-slate-200">
                          {selectedStudent.dateOfBirth
                            ? new Date(selectedStudent.dateOfBirth).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Gender:</span>
                        <span className="text-slate-200 capitalize">
                          {selectedStudent.gender || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Nationality:</span>
                        <span className="text-slate-200">
                          {selectedStudent.nationality || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Current Address:</span>
                        <span
                          className="text-slate-200 text-right max-w-[60%] truncate"
                          title={selectedStudent.address}
                        >
                          {selectedStudent.address || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Academic Profile card */}
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Academic Profile
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Academic Level:</span>
                        <span className="text-slate-200 capitalize">
                          {selectedStudent.academicLevel || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">High School / Inst.:</span>
                        <span className="text-slate-200">
                          {selectedStudent.highSchoolName || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">GPA / Marks Score:</span>
                        <span className="text-amber-400 font-bold font-mono text-sm">
                          {selectedStudent.formattedGpa}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Standardized Tests:</span>
                        <span className="text-slate-200 font-mono">
                          {renderTestScores(selectedStudent.testScores)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Intended Destination:</span>
                        <span className="text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />{' '}
                          {selectedStudent.formattedCountry}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Preferred Intake:</span>
                        <span className="text-slate-200 font-semibold">
                          {selectedStudent.preferredIntake || 'Not Specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admission Info */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                  <h3 className="text-sm font-bold text-white mb-3">Intended Application Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-1">Intended Course:</span>
                      <span className="text-white font-semibold">
                        {selectedStudent.formattedCourse}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Status:</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-semibold inline-block ${
                          selectedStudent.formattedStatus === 'Approved' ||
                          selectedStudent.formattedStatus === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {selectedStudent.formattedStatus}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Intake:</span>
                      <span className="text-slate-300 font-mono">
                        {selectedStudent.admissions?.[0]?.appliedIntake || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Advisor Notes:</span>
                      <span
                        className="text-slate-300 italic truncate block"
                        title={selectedStudent.admissions?.[0]?.notes}
                      >
                        {selectedStudent.admissions?.[0]?.notes || 'No notes added'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Documents & Scholarships */}
            {activeTab === 'documents' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Documents checklist card */}
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" /> Uploaded Documents Checklist
                    </h3>
                    {!selectedStudent.documents || selectedStudent.documents.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">
                        No documents have been uploaded yet.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-800/80">
                        {selectedStudent.documents.map((doc: any) => (
                          <div
                            key={doc.id}
                            className="py-2.5 flex justify-between items-center text-xs"
                          >
                            <div>
                              <p className="font-semibold text-slate-200">{doc.name}</p>
                              <span className="text-[10px] text-slate-500 font-mono uppercase">
                                {doc.type}
                              </span>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 rounded font-semibold ${
                                doc.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : doc.verificationStatus === 'REJECTED'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {doc.verificationStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Scholarships card */}
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4" /> Scholarship Schemes
                    </h3>
                    {!selectedStudent.scholarships || selectedStudent.scholarships.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">
                        No scholarship schemes have been applied for.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedStudent.scholarships.map((sub: any) => (
                          <div
                            key={sub.id}
                            className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{sub.scholarship?.name}</span>
                              <span className="text-indigo-400 font-mono font-bold">
                                ${parseFloat(sub.scholarship?.amount).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {sub.scholarship?.description || 'No description'}
                            </p>
                            <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
                              <span>
                                Status:{' '}
                                <strong className="text-slate-300 font-semibold">
                                  {sub.status}
                                </strong>
                              </span>
                              <span>
                                Requirements: {sub.scholarship?.requirements || 'Standard'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: AI Recommendations & Eligibility */}
            {activeTab === 'ai' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Search Settings Bar */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                    AI Matcher Parameters
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">
                        Interest Field
                      </label>
                      <input
                        type="text"
                        value={aiInterest}
                        onChange={(e) => setAiInterest(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">
                        Max Tuition Budget ($)
                      </label>
                      <input
                        type="number"
                        value={aiBudget}
                        onChange={(e) => setAiBudget(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">
                        Career Goal
                      </label>
                      <input
                        type="text"
                        value={aiCareerGoal}
                        onChange={(e) => setAiCareerGoal(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleAiEvaluation}
                      disabled={isAiLoading}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-xs font-semibold text-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isAiLoading ? 'Analyzing profiles...' : 'Run AI Evaluation'}
                    </button>
                  </div>
                </div>

                {/* Display Errors */}
                {aiError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}

                {/* Results columns */}
                {!isAiLoading && aiRecommendations.length === 0 && aiEligibility.length === 0 ? (
                  <div className="bg-slate-950/40 border border-dashed border-slate-800 p-8 rounded-xl text-center text-slate-500 text-xs">
                    Click "Run AI Evaluation" to fetch automated course matches and eligibility
                    validations.
                  </div>
                ) : isAiLoading ? (
                  <div className="bg-slate-950/40 border border-slate-800 p-12 rounded-xl text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
                    <span className="w-6 h-6 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></span>
                    <span>Querying RAG vectors & evaluating department prerequisites...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Course Matches */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                        <TrendingUp className="w-4 h-4 text-indigo-400" /> Course Matches (
                        {aiRecommendations.length})
                      </h4>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {aiRecommendations.map((rec) => (
                          <div
                            key={rec.id}
                            className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                  {rec.departmentName}
                                </span>
                                <h5 className="font-bold text-white text-xs">
                                  {rec.code} - {rec.name}
                                </h5>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                Match: {Math.round(rec.confidenceScore * 100)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Tuition: ${rec.tuitionFee?.toLocaleString()}/yr
                            </p>
                            <div className="text-[10px] text-slate-400 space-y-1 pt-1.5 border-t border-slate-900">
                              {rec.reasons?.map((reason: string, i: number) => (
                                <p key={i} className="flex items-start gap-1">
                                  <span className="text-indigo-400">•</span>
                                  <span>{reason}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Eligibility Checks */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                        <CheckCircle className="w-4 h-4 text-emerald-400" /> Academic Eligibility
                        Checklist
                      </h4>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {aiEligibility.map((elig) => (
                          <div
                            key={elig.id}
                            className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                                  {elig.departmentName}
                                </span>
                                <h5 className="font-bold text-white text-xs">
                                  {elig.code} - {elig.name}
                                </h5>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  elig.isEligible
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                              >
                                {elig.isEligible ? 'Eligible' : 'Not Eligible'}
                              </span>
                            </div>

                            {/* Checklist Criteria */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              {Object.entries(elig.checklist || {}).map(
                                ([key, item]: [string, any]) => (
                                  <div
                                    key={key}
                                    className="p-1.5 bg-slate-900/60 rounded border border-slate-800/40 text-[10px] flex items-center gap-1.5"
                                  >
                                    <span
                                      className={item.passed ? 'text-emerald-400' : 'text-red-400'}
                                    >
                                      {item.passed ? '✓' : '✗'}
                                    </span>
                                    <div>
                                      <span className="text-slate-500 block uppercase text-[8px] font-mono">
                                        {key}
                                      </span>
                                      <span
                                        className="text-slate-300 font-medium truncate block max-w-[110px]"
                                        title={item.message}
                                      >
                                        {item.message}
                                      </span>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>

                            {elig.reasons && elig.reasons.length > 0 && (
                              <div className="text-[9px] text-red-400 space-y-0.5 pt-1.5 border-t border-slate-900/80">
                                {elig.reasons.map((r: string, idx: number) => (
                                  <p key={idx}>• {r}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Offer Course Form */}
            {activeTab === 'offer' && (
              <div className="space-y-4 animate-fadeIn">
                <form onSubmit={handleOfferCourseSubmit} className="space-y-4">
                  {/* Select course from list */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      Select Eligible Course to Offer
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer"
                      required
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.code} - {course.name} ({course.department?.name || 'No Dept'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Intake Select */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Applied Intake Term
                      </label>
                      <select
                        value={offerIntake}
                        onChange={(e) => setOfferIntake(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="Fall 2026">Fall 2026</option>
                        <option value="Spring 2027">Spring 2027</option>
                        <option value="Summer 2027">Summer 2027</option>
                        <option value="Fall 2027">Fall 2027</option>
                      </select>
                    </div>

                    {/* Status Select */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Admission Status
                      </label>
                      <select
                        value={offerStatus}
                        onChange={(e) => setOfferStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="APPROVED">Offer Approved</option>
                        <option value="REJECTED">Offer Rejected</option>
                        <option value="APPLIED">Applied</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes text area */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      Counselor Notes & Scholarship Eligibility Guidelines
                    </label>
                    <textarea
                      value={offerNotes}
                      onChange={(e) => setOfferNotes(e.target.value)}
                      placeholder="e.g. Approved with Merit Scholarship support, prerequisites subjects verified."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                    ></textarea>
                  </div>

                  {/* Status Banner Messages */}
                  {offerSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>{offerSuccess}</span>
                    </div>
                  )}

                  {offerError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>{offerError}</span>
                    </div>
                  )}

                  {/* Submit buttons */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingOffer}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-xs font-semibold text-white rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                    >
                      {isSubmittingOffer ? 'Submitting Offer...' : 'Offer Course'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselorDashboard;
