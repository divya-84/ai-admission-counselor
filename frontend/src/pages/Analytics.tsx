import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  FileCheck,
  Percent,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  Award,
  MapPin,
  Building2,
} from 'lucide-react';

interface DailyEnrollment {
  date: string;
  admissions: number;
}

interface PopularCourse {
  course: string;
  count: number;
}

interface StateMetric {
  state: string;
  count: number;
}

interface DepartmentStat {
  name: string;
  enrollment: number;
  capacity: number;
}

interface ScholarshipStat {
  type: string;
  matched: number;
  fundsAllocatedLakhs: number;
}

interface AnalyticsData {
  summary: {
    totalStudents: number;
    totalUsers: number;
    totalDocuments: number;
    conversionRate: number;
  };
  dailyAdmissions: DailyEnrollment[];
  popularCourses: PopularCourse[];
  stateAdmissions: StateMetric[];
  departmentStats: DepartmentStat[];
  scholarshipStats: ScholarshipStat[];
}

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive Hover states
  const [activeDailyIndex, setActiveDailyIndex] = useState<number | null>(null);
  const [activeCourseIndex, setActiveCourseIndex] = useState<number | null>(null);
  const [activeStateIndex, setActiveStateIndex] = useState<number | null>(null);
  const [activeDeptIndex, setActiveDeptIndex] = useState<number | null>(null);
  const [activeScholarshipIndex, setActiveScholarshipIndex] = useState<number | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analytics/stats');
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to retrieve statistics.');
      }
    } catch {
      setError('An error occurred connecting to the analytics server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-400">
          Loading AI enrollment intelligence...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-400 font-bold">{error || 'Unable to retrieve statistics'}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const {
    summary,
    dailyAdmissions,
    popularCourses,
    stateAdmissions,
    departmentStats,
    scholarshipStats,
  } = data;

  // Calculation parameters for SVG Line Chart (Daily Admissions)
  const lineChartWidth = 500;
  const lineChartHeight = 200;
  const maxAdmissions = Math.max(...dailyAdmissions.map((d) => d.admissions), 1);
  const padding = 30;
  const points = dailyAdmissions.map((d, index) => {
    const x = padding + (index * (lineChartWidth - 2 * padding)) / (dailyAdmissions.length - 1);
    const y =
      lineChartHeight - padding - (d.admissions * (lineChartHeight - 2 * padding)) / maxAdmissions;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${lineChartHeight - padding} L ${points[0].x} ${lineChartHeight - padding} Z`
      : '';

  // Conversion rate radial params
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (summary.conversionRate / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-indigo-500" />
              Enrollment Analytics
            </h1>
            <p className="text-slate-400 text-sm">
              Real-time audit overview of academic conversions, courses popularity, regional
              density, and aid disbursements.
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="self-start md:self-auto px-4 py-2 border border-slate-850 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Data
          </button>
        </div>

        {/* KPI Summaries Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Total Users */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Registered Users
              </span>
              <p className="text-3xl font-extrabold text-white">{summary.totalUsers}</p>
            </div>
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Students Created */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Student Profiles
              </span>
              <p className="text-3xl font-extrabold text-white">{summary.totalStudents}</p>
            </div>
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Documents Loaded */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Vault Files
              </span>
              <p className="text-3xl font-extrabold text-white">{summary.totalDocuments}</p>
            </div>
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Conversion Rate */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Conversion Ratio
              </span>
              <p className="text-3xl font-extrabold text-indigo-400">{summary.conversionRate}%</p>
            </div>
            <div className="shrink-0 relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#6366f1"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <Percent className="w-4 h-4 text-indigo-400 absolute" />
            </div>
          </div>
        </div>

        {/* Charts Section: Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chart 1: Daily Admissions Line Chart */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                Daily Admissions Trend
              </h3>
              {activeDailyIndex !== null && (
                <span className="text-xs font-mono text-indigo-400">
                  {points[activeDailyIndex].date}:{' '}
                  <strong className="text-white">{points[activeDailyIndex].admissions}</strong>{' '}
                  registrations
                </span>
              )}
            </div>

            <div className="relative w-full h-[200px]">
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                  const y = padding + r * (lineChartHeight - 2 * padding);
                  return (
                    <line
                      key={idx}
                      x1={padding}
                      y1={y}
                      x2={lineChartWidth - padding}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                  );
                })}

                {/* Grid Areas */}
                <path d={areaD} fill="url(#areaGrad)" />
                <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" />

                {/* Interactive Points */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={activeDailyIndex === idx ? 7 : 4}
                    fill={activeDailyIndex === idx ? '#818cf8' : '#6366f1'}
                    stroke="#0b0f19"
                    strokeWidth="2"
                    onMouseEnter={() => setActiveDailyIndex(idx)}
                    onMouseLeave={() => setActiveDailyIndex(null)}
                    className="transition-all cursor-pointer"
                  />
                ))}
              </svg>
            </div>

            {/* Axis labels */}
            <div className="flex justify-between px-7 text-[10px] text-slate-500 font-bold uppercase">
              {dailyAdmissions.map((d, i) => (
                <span key={i}>{d.date}</span>
              ))}
            </div>
          </div>

          {/* Chart 2: Popular Courses Horizontal Bar Chart */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4.5 h-4.5 text-indigo-400" />
              Popular Engineering Courses
            </h3>

            <div className="space-y-4">
              {popularCourses.map((c, index) => {
                const maxCount = Math.max(...popularCourses.map((c) => c.count), 1);
                const percent = (c.count / maxCount) * 100;
                return (
                  <div
                    key={index}
                    className="space-y-1.5"
                    onMouseEnter={() => setActiveCourseIndex(index)}
                    onMouseLeave={() => setActiveCourseIndex(null)}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-350">{c.course}</span>
                      <span className="font-bold text-white">{c.count} seats booked</span>
                    </div>
                    <div className="h-2.5 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500 ${
                          activeCourseIndex === index
                            ? 'opacity-100 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                            : 'opacity-85'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Charts Section: Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Chart 3: State-wise Admissions Vertical Bars */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4 md:col-span-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4.5 h-4.5 text-indigo-400" />
                State-wise Distribution
              </h3>
              {activeStateIndex !== null && (
                <span className="text-xs font-mono text-indigo-400">
                  {stateAdmissions[activeStateIndex].state}:{' '}
                  <strong className="text-white">{stateAdmissions[activeStateIndex].count}</strong>{' '}
                  admissions
                </span>
              )}
            </div>

            <div className="h-[200px] flex items-end justify-between gap-2 pt-6">
              {stateAdmissions.map((s, index) => {
                const maxStateCount = Math.max(...stateAdmissions.map((s) => s.count), 1);
                const heightPercent = (s.count / maxStateCount) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                    onMouseEnter={() => setActiveStateIndex(index)}
                    onMouseLeave={() => setActiveStateIndex(null)}
                  >
                    <div
                      className="w-full bg-slate-950 border border-slate-850 rounded-t-lg overflow-hidden relative flex flex-col justify-end"
                      style={{ height: '80%' }}
                    >
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-md transition-all duration-300 ${
                          activeStateIndex === index
                            ? 'opacity-100 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                            : 'opacity-80'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight text-center truncate w-full">
                      {s.state.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 4: Department Capacity vs Enrollment */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4.5 h-4.5 text-indigo-400" />
              Department Load Factor
            </h3>

            <div className="space-y-4">
              {departmentStats.map((d, index) => {
                const loadPercent = Math.min(100, (d.enrollment / d.capacity) * 100);
                return (
                  <div
                    key={index}
                    className="space-y-1.5"
                    onMouseEnter={() => setActiveDeptIndex(index)}
                    onMouseLeave={() => setActiveDeptIndex(null)}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-350">{d.name}</span>
                      <span className="text-slate-500">
                        <strong className="text-white">{d.enrollment}</strong> / {d.capacity} Cap
                      </span>
                    </div>
                    <div className="h-2 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${loadPercent}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          loadPercent > 80
                            ? 'bg-gradient-to-r from-red-600 to-red-400'
                            : 'bg-gradient-to-r from-indigo-600 to-indigo-400'
                        } ${activeDeptIndex === index ? 'opacity-100' : 'opacity-85'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 5: Scholarship Disbursements Grid */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-indigo-400" />
              Scholarship Allocation Analytics
            </h3>
            {activeScholarshipIndex !== null && (
              <span className="text-xs font-mono text-indigo-400">
                Total Funds:{' '}
                <strong className="text-white">
                  ₹{scholarshipStats[activeScholarshipIndex].fundsAllocatedLakhs} Lakhs
                </strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {scholarshipStats.map((s, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border text-left transition-all space-y-2 select-none cursor-default ${
                  activeScholarshipIndex === index
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
                onMouseEnter={() => setActiveScholarshipIndex(index)}
                onMouseLeave={() => setActiveScholarshipIndex(null)}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-white">{s.type}</span>
                  <Award className="w-4 h-4 text-indigo-400 shrink-0" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Matched Applicants
                  </p>
                  <p className="text-xl font-extrabold text-white leading-none">{s.matched}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Funds Disbursed:</span>
                  <span className="font-bold text-indigo-300">₹{s.fundsAllocatedLakhs}L</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
