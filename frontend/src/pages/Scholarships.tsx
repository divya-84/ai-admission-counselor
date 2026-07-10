import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  IndianRupee,
  ShieldAlert,
  Dribbble,
  BookOpen,
} from 'lucide-react';

interface RecommendedScholarship {
  id: string;
  name: string;
  type: 'Government' | 'Merit' | 'Minority' | 'Sports' | 'EWS' | 'University';
  coverage: string;
  explanation: string;
}

export const Scholarships: React.FC = () => {
  const [marks, setMarks] = useState<number>(85);
  const [annualIncome, setAnnualIncome] = useState<number>(180000);
  const [category, setCategory] = useState<string>('OBC');
  const [religion, setReligion] = useState<string>('Hindu');
  const [isSportsPlayer, setIsSportsPlayer] = useState<boolean>(false);
  const [ewsCertificate, setEwsCertificate] = useState<boolean>(false);
  const [aktuRegistered, setAktuRegistered] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RecommendedScholarship[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const navigate = useNavigate();

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/scholarships/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marks: Number(marks),
          annualIncome: Number(annualIncome),
          category,
          religion,
          isSportsPlayer,
          ewsCertificate,
          aktuRegistered,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setResults(result.data.scholarships);
        setHasSearched(true);
      } else {
        setError(result.message || 'Failed to match scholarships');
      }
    } catch {
      setError('An error occurred connecting to the scholarship engine.');
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
            <Award className="w-8 h-8 text-indigo-500" />
            Scholarship Recommendation Engine
          </h1>
          <p className="text-slate-400 text-sm">
            Scan eligible financial aid schemes, state board DBT waivers, minority awards, sports
            grants, and AKTU University scholarships.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Input Form */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-fit space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Eligibility Profile
            </h3>

            <form onSubmit={handleRecommend} className="space-y-4">
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

              {/* Annual Income Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-indigo-400" />
                  Annual Family Income (INR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
                  required
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="General">General (Open)</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              {/* Religion Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Religion
                </label>
                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim (Minority)</option>
                  <option value="Christian">Christian (Minority)</option>
                  <option value="Sikh">Sikh (Minority)</option>
                  <option value="Buddhist">Buddhist (Minority)</option>
                  <option value="Jain">Jain (Minority)</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                {/* Sports Toggle */}
                <label className="flex items-center justify-between p-2 rounded-lg border border-slate-850 hover:border-slate-800 bg-slate-950/40 cursor-pointer select-none">
                  <span className="text-xs text-slate-300 flex items-center gap-2">
                    <Dribbble className="w-4 h-4 text-amber-500 animate-pulse" />
                    Sports Player (State/National)
                  </span>
                  <input
                    type="checkbox"
                    checked={isSportsPlayer}
                    onChange={(e) => setIsSportsPlayer(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
                  />
                </label>

                {/* EWS Toggle */}
                <label className="flex items-center justify-between p-2 rounded-lg border border-slate-850 hover:border-slate-800 bg-slate-950/40 cursor-pointer select-none">
                  <span className="text-xs text-slate-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-500" />
                    EWS Certificate Holder
                  </span>
                  <input
                    type="checkbox"
                    checked={ewsCertificate}
                    onChange={(e) => setEwsCertificate(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
                  />
                </label>

                {/* AKTU Toggle */}
                <label className="flex items-center justify-between p-2 rounded-lg border border-slate-850 hover:border-slate-800 bg-slate-950/40 cursor-pointer select-none">
                  <span className="text-xs text-slate-300 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    AKTU Registered Candidate
                  </span>
                  <input
                    type="checkbox"
                    checked={aktuRegistered}
                    onChange={(e) => setAktuRegistered(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
                  />
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 inline-flex items-center justify-center gap-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 px-4 py-3 rounded-xl font-semibold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? 'Scanning Schemes...' : 'Find Scholarships'}
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
                <span className="font-medium">Matching scholarship rules...</span>
              </div>
            ) : !hasSearched ? (
              <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3 h-64 flex flex-col items-center justify-center">
                <HelpCircle className="w-10 h-10 text-slate-700" />
                <p className="text-sm">
                  Submit the questionnaire to view your qualified financial aid schemes.
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2 h-64 flex flex-col items-center justify-center">
                <p className="text-base font-bold text-white">No eligible schemes found</p>
                <p className="text-xs text-slate-500">
                  Try adjusting your profile options or income values to view other scholarship
                  opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Your Recommended Aid ({results.length})
                </h3>

                <div className="space-y-4">
                  {results.map((scheme) => (
                    <div
                      key={scheme.id}
                      className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-indigo-500/20 transition-all"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border mb-1.5 ${
                              scheme.type === 'Government'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : scheme.type === 'Merit'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : scheme.type === 'University'
                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            }`}
                          >
                            {scheme.type} Scholarship
                          </span>
                          <h4 className="font-extrabold text-white text-lg leading-snug">
                            {scheme.name}
                          </h4>
                          <span className="text-xs text-indigo-400 font-bold block mt-1">
                            Reward: {scheme.coverage}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                          Qualification Reason:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {scheme.explanation}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          onClick={() => navigate('/')}
                          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                        >
                          Apply Online
                        </button>
                        <button
                          onClick={() => navigate('/chat')}
                          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Query AI Advisor
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

export default Scholarships;
