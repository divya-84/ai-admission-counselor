import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  BookOpen,
  User,
  Award,
  ArrowRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

interface ChecklistItem {
  passed: boolean;
  message: string;
}

interface EligibilityResult {
  id: string;
  code: string;
  name: string;
  departmentName: string;
  isEligible: boolean;
  checklist: {
    marks: ChecklistItem;
    age: ChecklistItem;
    subjects: ChecklistItem;
    entranceExam: ChecklistItem;
  };
  reasons: string[];
}

export const Eligibility: React.FC = () => {
  const [marks, setMarks] = useState<number>(75);
  const [reservation, setReservation] = useState<string>('General');
  const [age, setAge] = useState<number>(21);
  const [entranceExam, setEntranceExam] = useState<string>('');
  const [entranceScore, setEntranceScore] = useState<number>(0);

  // Available subjects for easy checkbox selection
  const availableSubjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Programming',
    'Machine Learning',
    'English',
  ];
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics', 'English']);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EligibilityResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const navigate = useNavigate();

  const handleSubjectChange = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject],
    );
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/eligibility/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marks: Number(marks),
          reservation,
          age: Number(age),
          entranceExam: entranceExam || undefined,
          entranceScore: entranceScore ? Number(entranceScore) : undefined,
          subjects: selectedSubjects,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setResults(result.data.results);
        setHasSearched(true);
      } else {
        setError(result.message || 'Failed to check eligibility');
      }
    } catch {
      setError('An error occurred connecting to the eligibility engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-2">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-500" />
            Admission Eligibility Checker
          </h1>
          <p className="text-slate-400 text-sm">
            Evaluate your target course qualifications including reservation mark relaxations,
            prerequisite subjects, and entrance scores.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Input Form */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-fit space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              Your Academic Profile
            </h3>

            <form onSubmit={handleCheck} className="space-y-4">
              {/* GPA/Marks Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-400" />
                  Your Score / Marks (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
                  required
                />
              </div>

              {/* Reservation Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-400" />
                  Reservation Category
                </label>
                <select
                  value={reservation}
                  onChange={(e) => setReservation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="General">General (Open Category)</option>
                  <option value="OBC">OBC (5% score relaxation)</option>
                  <option value="SC">SC (10% score relaxation)</option>
                  <option value="ST">ST (10% score relaxation)</option>
                </select>
              </div>

              {/* Age Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-400" />
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
                  required
                />
              </div>

              {/* Subjects Completed Checkboxes */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Prerequisite Subjects Completed
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {availableSubjects.map((sub) => (
                    <label
                      key={sub}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                        selectedSubjects.includes(sub)
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(sub)}
                        onChange={() => handleSubjectChange(sub)}
                        className="hidden"
                      />
                      {sub}
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional Entrance Exam details */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                  Optional Entrance Exams
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Exam (e.g. SAT, GRE)"
                    value={entranceExam}
                    onChange={(e) => setEntranceExam(e.target.value)}
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Score"
                    value={entranceScore || ''}
                    onChange={(e) => setEntranceScore(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 inline-flex items-center justify-center gap-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 px-4 py-3 rounded-xl font-semibold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying Qualifications...' : 'Verify Eligibility'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Column 2 & 3: Results Display */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isLoading ? (
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-3 text-slate-400 text-sm h-64">
                <div className="w-7 h-7 border-2 border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="font-medium">Evaluating qualifications checks...</span>
              </div>
            ) : !hasSearched ? (
              <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3 h-64 flex flex-col items-center justify-center">
                <HelpCircle className="w-10 h-10 text-slate-700" />
                <p className="text-sm">Submit your qualifications to audit course eligibility.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Audited Course Eligibility ({results.length})
                </h3>

                <div className="space-y-4">
                  {results.map((course) => (
                    <div
                      key={course.id}
                      className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-indigo-500/20 transition-all"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                            {course.code} &bull; {course.departmentName}
                          </span>
                          <h4 className="font-extrabold text-white text-lg leading-snug">
                            {course.name}
                          </h4>
                        </div>

                        {/* Status Badge */}
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border items-center gap-1 ${
                              course.isEligible
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >
                            {course.isEligible ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            {course.isEligible ? 'Eligible' : 'Ineligible'}
                          </span>
                        </div>
                      </div>

                      {/* Criteria Checklist Breakdown */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                          Requirements Audit:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {/* Marks Check */}
                          <div className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-lg">
                            {course.checklist.marks.passed ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                            <span className="text-slate-300">{course.checklist.marks.message}</span>
                          </div>

                          {/* Age Check */}
                          <div className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-lg">
                            {course.checklist.age.passed ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                            <span className="text-slate-300">{course.checklist.age.message}</span>
                          </div>

                          {/* Subjects Check */}
                          <div className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-lg">
                            {course.checklist.subjects.passed ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                            <span className="text-slate-300">
                              {course.checklist.subjects.message}
                            </span>
                          </div>

                          {/* Entrance Exam Check */}
                          <div className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-lg">
                            {course.checklist.entranceExam.passed ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                            <span className="text-slate-300">
                              {course.checklist.entranceExam.message}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex justify-end gap-2">
                        {course.isEligible ? (
                          <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                          >
                            Apply to Program
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate('/chat')}
                            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Book Counselor Session
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eligibility;
