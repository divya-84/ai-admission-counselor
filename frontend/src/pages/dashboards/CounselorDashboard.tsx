import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  Users,
  Calendar,
  Clock,
  Sparkles,
  Search,
  UserCheck,
  ClipboardList,
  MessageSquare,
} from 'lucide-react';

export const CounselorDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Mock data for counselor dashboard
  const students = [
    {
      id: '1',
      name: 'Alice Watson',
      course: 'M.S. in Computer Science',
      gpa: '3.90',
      status: 'Pending Review',
      country: 'USA',
    },
    {
      id: '2',
      name: 'Bob Carter',
      course: 'B.B.A. in Marketing',
      gpa: '3.65',
      status: 'Documents Requested',
      country: 'UK',
    },
    {
      id: '3',
      name: 'Diana Prince',
      course: 'Ph.D. in Chemistry',
      gpa: '3.95',
      status: 'Approved',
      country: 'Canada',
    },
  ];

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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
                Assigned Students List
              </h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Intended Course</th>
                    <th className="pb-3 text-center">GPA</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map((student) => (
                    <tr key={student.id} className="group hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 font-semibold text-white">{student.name}</td>
                      <td className="py-3.5 text-slate-300">
                        {student.course}
                        <span className="block text-slate-500 text-xs">
                          Destination: {student.country}
                        </span>
                      </td>
                      <td className="py-3.5 text-center text-slate-300 font-mono">{student.gpa}</td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            student.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : student.status === 'Pending Review'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex gap-1.5">
                          <button className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all cursor-pointer">
                            Review
                          </button>
                          <button className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

            {/* Availability Settings Quick-Link */}
            <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
                <UserCheck className="w-4 h-4" />
                <span>Duty Calendar</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Update your active counseling timings and sync with appointments scheduling
                platform.
              </p>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
                Manage Availability &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorDashboard;
