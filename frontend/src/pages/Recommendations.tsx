import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Compass,
  ArrowRight,
  BookOpen,
  DollarSign,
  Briefcase,
  Award,
  AlertCircle,
  HelpCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface RecommendedCourse {
  id: string;
  code: string;
  name: string;
  tuitionFee: number;
  departmentName: string;
  confidenceScore: number;
  reasons: string[];
}

export const Recommendations: React.FC = () => {
  const [marks, setMarks] = useState<number>(80);
  const [interest, setInterest] = useState<string>('Computer Science');
  const [budget, setBudget] = useState<number>(25000);
  const [careerGoal, setCareerGoal] = useState<string>('Software Engineer');
  const [entranceExam, setEntranceExam] = useState<string>('');
  const [entranceScore, setEntranceScore] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RecommendedCourse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const navigate = useNavigate();

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/recommendations/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marks: Number(marks),
          interest,
          budget: Number(budget),
          careerGoal,
          entranceExam: entranceExam || undefined,
          entranceScore: entranceScore ? Number(entranceScore) : undefined,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setResults(result.data.recommendations);
        setHasSearched(true);
      } else {
        setError(result.message || 'Failed to calculate recommendations');
      }
    } catch {
      setError('An error occurred connecting to recommendation engine.');
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
            <Compass className="w-8 h-8 text-indigo-500 animate-spin-slow" />
            AI Course Recommendations
          </h1>
          <p className="text-slate-400 text-sm">
            Input your academic performance, career path goals, and tuition budgets to match with
            target degree programs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Input Form */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-fit space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Recommendation Profile
            </h3>

            <form onSubmit={handleRecommend} className="space-y-4">
              {/* GPA/Marks Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-400" />
                  Academic Score / Marks (%)
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

              {/* Interest Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Primary Field Interest
                </label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="Computer Science">Computer Science & AI</option>
                  <option value="Engineering">Robotics & Mechanical Engineering</option>
                  <option value="Business">Business & Management</option>
                  <option value="Finance">Corporate Finance & Banking</option>
                </select>
              </div>

              {/* Budget Limit Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-indigo-400" />
                    Max Tuition Budget
                  </span>
                  <span className="text-indigo-400 font-bold font-mono">
                    ${budget.toLocaleString()}/yr
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="40000"
                  step="1000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Career Goal Text Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  Target Career Goal
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Investment Banker"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
                  required
                />
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
                {isLoading ? 'Processing Matches...' : 'Find Matches'}
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
                <span className="font-medium">Evaluating matching algorithms...</span>
              </div>
            ) : !hasSearched ? (
              <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3 h-64 flex flex-col items-center justify-center">
                <HelpCircle className="w-10 h-10 text-slate-700" />
                <p className="text-sm">
                  Submit the questionnaire to view top course recommendations.
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2 h-64 flex flex-col items-center justify-center">
                <p className="text-base font-bold text-white">No matches found</p>
                <p className="text-xs text-slate-500">
                  Try adjusting your budget limits or gpa parameters to find available listings.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Top Program Matches ({results.length})
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
                          <span className="text-xs text-slate-500 font-medium">
                            Tuition: ${course.tuitionFee.toLocaleString()}/yr
                          </span>
                        </div>

                        {/* Confidence Score Badge */}
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                              course.confidenceScore >= 80
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : course.confidenceScore >= 60
                                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {course.confidenceScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Matching reasons lists */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                          Why this matches:
                        </span>
                        <ul className="space-y-1">
                          {course.reasons.map((reason, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-slate-300 flex items-start gap-1.5"
                            >
                              <span className="text-indigo-400 font-bold select-none">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Apply trigger */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => navigate('/')}
                          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                        >
                          Apply to Program
                        </button>
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

export default Recommendations;
