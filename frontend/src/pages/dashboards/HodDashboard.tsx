import React from 'react';
import { GraduationCap, Users, Star, BookOpen, FolderLock } from 'lucide-react';

export const HodDashboard: React.FC = () => {
  // Mock data for HOD dashboard
  const courseDetails = [
    {
      id: '1',
      code: 'CS-501',
      name: 'M.S. in Computer Science',
      activeStudents: 140,
      totalSeats: 150,
      tuition: '$22,000',
    },
    {
      id: '2',
      code: 'SE-302',
      name: 'B.S. in Software Engineering',
      activeStudents: 85,
      totalSeats: 100,
      tuition: '$18,000',
    },
    {
      id: '3',
      code: 'AI-603',
      name: 'Ph.D. in Artificial Intelligence',
      activeStudents: 12,
      totalSeats: 15,
      tuition: '$25,000',
    },
  ];

  const counselors = [
    {
      id: '1',
      name: 'Dr. Sarah Jenkins',
      specialization: 'USA Admissions',
      caseload: 12,
      rating: 4.95,
    },
    {
      id: '2',
      name: 'Prof. Alan Turing',
      specialization: 'UK & Europe',
      caseload: 9,
      rating: 4.88,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              Academic Dashboard (HOD)
            </h1>
            <p className="text-slate-400 text-sm">
              Overview of department statistics, course seating metrics, and counselor feedback
              logs.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold">
            <FolderLock className="w-4 h-4" />
            Department: Computer Science & AI
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Department Enrolment
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-white">237</span>
              <span className="text-indigo-400 text-xs font-medium">92.9% Capacity</span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Total Seating Space
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-white">265 Seats</span>
              <span className="text-slate-400 text-xs font-medium">3 active courses</span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Department Counselors
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-white">2 Advisors</span>
              <span className="text-emerald-400 text-xs font-medium">21 Caseloads</span>
            </div>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Average advisor rating
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-amber-400">4.92 / 5.0</span>
              <span className="text-slate-400 text-xs font-medium">Caseload index: 10.5</span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses List */}
          <div className="lg:col-span-2 bg-slate-900/45 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Seating Capacity & Fees
            </h2>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="pb-3">Course Name</th>
                    <th className="pb-3 text-center">Active Enrolled</th>
                    <th className="pb-3 text-center">Total Seats</th>
                    <th className="pb-3 text-center">Usage</th>
                    <th className="pb-3 text-right">Tuition Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {courseDetails.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 font-semibold text-white">
                        {course.name}
                        <span className="block text-slate-500 text-xs font-mono">
                          {course.code}
                        </span>
                      </td>
                      <td className="py-3.5 text-center font-mono">{course.activeStudents}</td>
                      <td className="py-3.5 text-center font-mono">{course.totalSeats}</td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            course.activeStudents / course.totalSeats > 0.9
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {Math.round((course.activeStudents / course.totalSeats) * 100)}%
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-white">
                        {course.tuition}/yr
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Counselors */}
          <div className="bg-slate-900/45 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Advisor Audits
            </h2>

            <div className="space-y-4">
              {counselors.map((counselor) => (
                <div
                  key={counselor.id}
                  className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{counselor.name}</h4>
                      <p className="text-xs text-slate-500">Spec: {counselor.specialization}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-400 flex items-center gap-0.5 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {counselor.rating}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Active Cases: {counselor.caseload}</span>
                    <button className="text-indigo-400 hover:underline font-semibold cursor-pointer">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Metrics link */}
            <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
                <GraduationCap className="w-4 h-4" />
                <span>Department Syllabus</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review core requirements, test eligibility rules, and program prerequisites.
              </p>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
                Curriculum Setup &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
