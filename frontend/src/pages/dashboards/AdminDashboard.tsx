import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Building2,
  Award,
  ShieldAlert,
  Cpu,
  Database,
  FileCheck,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Lock,
} from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'STUDENT' | 'COUNSELOR' | 'HOD' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  durationYears: number;
  tuitionFee: number;
  requirements: string | null;
  departmentId: string;
  department?: {
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
  description: string | null;
}

interface Scholarship {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  requirements: string | null;
}

interface Document {
  id: string;
  name: string;
  type: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  notes: string | null;
  student?: {
    user?: {
      name: string;
      email: string;
    };
  };
}

interface KBChunk {
  id: string;
  fileName: string;
  sizeBytes: number;
  chunksCount: number;
  embeddingDimension: number;
  status: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'users' | 'courses' | 'departments' | 'scholarships' | 'rules' | 'ai' | 'kb' | 'docs'
  >('users');

  // Lists
  const [usersList, setUsersList] = useState<User[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [scholarshipsList, setScholarshipsList] = useState<Scholarship[]>([]);
  const [documentsList, setDocumentsList] = useState<Document[]>([]);
  const [kbChunks, setKbChunks] = useState<KBChunk[]>([]);

  // Settings
  const [aiModel, setAiModel] = useState<string>('gpt-4o');
  const [aiTemp, setAiTemp] = useState<number>(0.7);
  const [aiTokens, setAiTokens] = useState<number>(1024);
  const [aiPrompt, setAiPrompt] = useState<string>('');

  const [ruleMinPercent, setRuleMinPercent] = useState<number>(50);
  const [ruleMinAge, setRuleMinAge] = useState<number>(17);
  const [ruleCutoff, setRuleCutoff] = useState<number>(50000);
  const [ruleSubjects, setRuleSubjects] = useState<string>('Physics, Chemistry, Mathematics');

  // Creation forms
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseDur, setNewCourseDur] = useState(4);
  const [newCourseFee, setNewCourseFee] = useState(80000);
  const [newCourseReq, setNewCourseReq] = useState('');
  const [newCourseDeptId, setNewCourseDeptId] = useState('');

  const [newScholarshipName, setNewScholarshipName] = useState('');
  const [newScholarshipDesc, setNewScholarshipDesc] = useState('');
  const [newScholarshipAmt, setNewScholarshipAmt] = useState(15000);
  const [newScholarshipReq, setNewScholarshipReq] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchTabDetails = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (activeTab === 'users') {
        const response = await fetch('/api/admin/users');
        const res = await response.json();
        if (response.ok) setUsersList(res.data.users);
      } else if (activeTab === 'courses') {
        const response = await fetch('/api/admin/courses');
        const res = await response.json();
        if (response.ok) setCoursesList(res.data.courses);

        // Also fetch departments to populate courses dropdown
        const deptResponse = await fetch('/api/admin/departments');
        const deptRes = await deptResponse.json();
        if (deptResponse.ok) {
          setDepartmentsList(deptRes.data.departments);
          if (deptRes.data.departments.length > 0) {
            setNewCourseDeptId(deptRes.data.departments[0].id);
          }
        }
      } else if (activeTab === 'departments') {
        const response = await fetch('/api/admin/departments');
        const res = await response.json();
        if (response.ok) setDepartmentsList(res.data.departments);
      } else if (activeTab === 'scholarships') {
        const response = await fetch('/api/admin/scholarships');
        const res = await response.json();
        if (response.ok) setScholarshipsList(res.data.scholarships);
      } else if (activeTab === 'docs') {
        const response = await fetch('/api/admin/documents');
        const res = await response.json();
        if (response.ok) setDocumentsList(res.data.documents);
      } else if (activeTab === 'kb') {
        const response = await fetch('/api/admin/kb');
        const res = await response.json();
        if (response.ok) setKbChunks(res.data.chunks);
      } else if (activeTab === 'ai' || activeTab === 'rules') {
        const response = await fetch('/api/admin/settings');
        const res = await response.json();
        if (response.ok) {
          const { aiSettings, admissionRules } = res.data;
          setAiModel(aiSettings.model);
          setAiTemp(aiSettings.temperature);
          setAiTokens(aiSettings.maxTokens);
          setAiPrompt(aiSettings.systemPrompt);

          setRuleMinPercent(admissionRules.minPercentage);
          setRuleMinAge(admissionRules.minAge);
          setRuleCutoff(admissionRules.cutoffRank);
          setRuleSubjects(admissionRules.requiredSubjects.join(', '));
        }
      }
    } catch {
      setError('Could not retrieve console configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTabDetails();
  }, [activeTab]);

  // Operations
  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (response.ok) {
        setSuccess('Role updated successfully.');
        fetchTabDetails();
      }
    } catch {
      setError('Failed to update role.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete this user? This action is irreversible.')) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccess('User removed.');
        fetchTabDetails();
      }
    } catch {
      setError('Failed to delete user.');
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeptName, description: newDeptDesc }),
      });
      if (response.ok) {
        setSuccess('Department registered.');
        setNewDeptName('');
        setNewDeptDesc('');
        fetchTabDetails();
      }
    } catch {
      setError('Failed to create department.');
    }
  };

  const handleDeleteDept = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/departments/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccess('Department removed.');
        fetchTabDetails();
      }
    } catch {
      setError('Failed to remove department.');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCourseCode,
          name: newCourseName,
          description: newCourseDesc,
          durationYears: Number(newCourseDur),
          tuitionFee: Number(newCourseFee),
          requirements: newCourseReq,
          departmentId: newCourseDeptId,
        }),
      });
      if (response.ok) {
        setSuccess('Course catalog registered.');
        setNewCourseCode('');
        setNewCourseName('');
        setNewCourseDesc('');
        setNewCourseReq('');
        fetchTabDetails();
      }
    } catch {
      setError('Failed to create course.');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccess('Course catalog asset deleted.');
        fetchTabDetails();
      }
    } catch {
      setError('Failed to delete course.');
    }
  };

  const handleCreateScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newScholarshipName,
          description: newScholarshipDesc,
          amount: Number(newScholarshipAmt),
          requirements: newScholarshipReq,
        }),
      });
      if (response.ok) {
        setSuccess('Scholarship scheme saved.');
        setNewScholarshipName('');
        setNewScholarshipDesc('');
        fetchTabDetails();
      }
    } catch {
      setError('Failed to create scholarship.');
    }
  };

  const handleDeleteScholarship = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/scholarships/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccess('Scholarship removed.');
        fetchTabDetails();
      }
    } catch {
      setError('Failed to remove scholarship.');
    }
  };

  const handleUpdateAISettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: aiModel,
          temperature: Number(aiTemp),
          maxTokens: Number(aiTokens),
          systemPrompt: aiPrompt,
        }),
      });
      if (response.ok) {
        setSuccess('AI parameters updated successfully.');
      }
    } catch {
      setError('Failed to save AI configuration settings.');
    }
  };

  const handleUpdateRules = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minPercentage: Number(ruleMinPercent),
          minAge: Number(ruleMinAge),
          cutoffRank: Number(ruleCutoff),
          requiredSubjects: ruleSubjects.split(',').map((s) => s.trim()),
        }),
      });
      if (response.ok) {
        setSuccess('Admission rules updated successfully.');
      }
    } catch {
      setError('Failed to update admission rules.');
    }
  };

  const handleVerifyDocument = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/admin/documents/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes: `Manual review status updated to ${status} by admin.`,
        }),
      });
      if (response.ok) {
        setSuccess(`Document marked as ${status}.`);
        fetchTabDetails();
      }
    } catch {
      setError('Verification toggle failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Title Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-indigo-500" />
              Administrative Control Console
            </h1>
            <p className="text-slate-400 text-sm">
              Manage system permissions, register academic courses, configure entrance limits,
              adjust AI prompts, and audit uploaded files.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
            <Lock className="w-4 h-4" /> System Secured
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-4">
          {(
            [
              { id: 'users', label: 'Users', icon: Users },
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'departments', label: 'Departments', icon: Building2 },
              { id: 'scholarships', label: 'Scholarships', icon: Award },
              { id: 'rules', label: 'Admission Rules', icon: ShieldAlert },
              { id: 'ai', label: 'AI Settings', icon: Cpu },
              { id: 'kb', label: 'Knowledge Base', icon: Database },
              { id: 'docs', label: 'Documents', icon: FileCheck },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 border-indigo-650 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left/Status side alerts */}
          <div className="lg:col-span-1 space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}
            <div className="p-4 bg-slate-900/20 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Info</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Changes applied through this console configure the parameters queried by the
                eligibility rules checker, scholarship engine, and RAG semantic retrieval vector
                database filters instantly.
              </p>
            </div>
          </div>

          {/* Right Main panel details */}
          <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 min-h-[450px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-24 text-slate-500 text-xs">
                <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
                <span>Retrieving administrative state...</span>
              </div>
            ) : (
              <>
                {/* 1. Tab: Users */}
                {activeTab === 'users' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">
                      Manage User Roles
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="py-2.5">Name</th>
                            <th className="py-2.5">Email</th>
                            <th className="py-2.5">Role</th>
                            <th className="py-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersList.map((usr) => (
                            <tr key={usr.id} className="border-b border-slate-900 text-slate-300">
                              <td className="py-3 font-semibold text-white">
                                {usr.name || 'Anonymous'}
                              </td>
                              <td className="py-3">{usr.email}</td>
                              <td className="py-3">
                                <select
                                  value={usr.role}
                                  onChange={(e) => handleUpdateRole(usr.id, e.target.value)}
                                  className="bg-slate-950 border border-slate-850 rounded px-1.5 py-0.5 text-xs text-indigo-400 focus:outline-none cursor-pointer"
                                >
                                  <option value="STUDENT">STUDENT</option>
                                  <option value="COUNSELOR">COUNSELOR</option>
                                  <option value="HOD">HOD</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleDeleteUser(usr.id)}
                                  className="p-1 rounded text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. Tab: Courses */}
                {activeTab === 'courses' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">
                        Course Catalog
                      </h3>
                    </div>

                    <form
                      onSubmit={handleCreateCourse}
                      className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="space-y-1 md:col-span-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                          Add New Course
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Course Code</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CS-501"
                          value={newCourseCode}
                          onChange={(e) => setNewCourseCode(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Course Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. B.Tech in Computer Science"
                          value={newCourseName}
                          onChange={(e) => setNewCourseName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Department</label>
                        <select
                          value={newCourseDeptId}
                          onChange={(e) => setNewCourseDeptId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        >
                          {departmentsList.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">
                          Tuition Fee per Year (₹)
                        </label>
                        <input
                          type="number"
                          required
                          value={newCourseFee}
                          onChange={(e) => setNewCourseFee(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Duration in Years</label>
                        <input
                          type="number"
                          required
                          value={newCourseDur}
                          onChange={(e) => setNewCourseDur(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] text-slate-400">
                          Prerequisite Subjects (Comma Separated)
                        </label>
                        <input
                          type="text"
                          placeholder="Physics, Chemistry, Mathematics"
                          value={newCourseReq}
                          onChange={(e) => setNewCourseReq(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="md:col-span-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Add Course
                        </button>
                      </div>
                    </form>

                    <div className="space-y-2">
                      {coursesList.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">{c.code}</span> -{' '}
                            <span className="text-slate-300">{c.name}</span>
                            <div className="flex gap-2 text-[10px] text-slate-500 mt-1">
                              <span>Dept: {c.department?.name || 'Engineering'}</span>
                              <span>•</span>
                              <span>Fee: ₹{Number(c.tuitionFee).toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCourse(c.id)}
                            className="p-1.5 rounded bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/10 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Tab: Departments */}
                {activeTab === 'departments' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">
                      Departments
                    </h3>

                    <form
                      onSubmit={handleCreateDept}
                      className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Department Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Applied Science"
                          value={newDeptName}
                          onChange={(e) => setNewDeptName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Physics and Mathematics divisions"
                          value={newDeptDesc}
                          onChange={(e) => setNewDeptDesc(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Save Department
                        </button>
                      </div>
                    </form>

                    <div className="space-y-2">
                      {departmentsList.map((d) => (
                        <div
                          key={d.id}
                          className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between items-center text-xs"
                        >
                          <div>
                            <p className="font-bold text-white">{d.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {d.description || 'No description provided'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteDept(d.id)}
                            className="p-1.5 rounded bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/10 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Tab: Scholarships */}
                {activeTab === 'scholarships' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">
                      Scholarship Schemes
                    </h3>

                    <form
                      onSubmit={handleCreateScholarship}
                      className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Scholarship Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Merit Scholarship for minority"
                          value={newScholarshipName}
                          onChange={(e) => setNewScholarshipName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Disbursed Amount (₹)</label>
                        <input
                          type="number"
                          required
                          value={newScholarshipAmt}
                          onChange={(e) => setNewScholarshipAmt(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] text-slate-400">
                          Heuristics / Eligibility Criteria description
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Cutoff GPA > 8.0, Income limits < 2.5L"
                          value={newScholarshipReq}
                          onChange={(e) => setNewScholarshipReq(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="md:col-span-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Save Scheme
                        </button>
                      </div>
                    </form>

                    <div className="space-y-2">
                      {scholarshipsList.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between items-center text-xs"
                        >
                          <div>
                            <p className="font-bold text-white">{s.name}</p>
                            <p className="text-[10px] text-indigo-400 mt-0.5">
                              Value: ₹{Number(s.amount).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteScholarship(s.id)}
                            className="p-1.5 rounded bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/10 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Tab: Admission Rules */}
                {activeTab === 'rules' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">
                      Admission cutoff thresholds
                    </h3>

                    <form onSubmit={handleUpdateRules} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            Minimum Board Percentage (%)
                          </label>
                          <input
                            type="number"
                            value={ruleMinPercent}
                            onChange={(e) => setRuleMinPercent(Number(e.target.value))}
                            className="w-full bg-slate-955 border border-slate-850 rounded px-2.5 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            Minimum Age limit
                          </label>
                          <input
                            type="number"
                            value={ruleMinAge}
                            onChange={(e) => setRuleMinAge(Number(e.target.value))}
                            className="w-full bg-slate-955 border border-slate-850 rounded px-2.5 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            Entrance exam cutoff rank Limit
                          </label>
                          <input
                            type="number"
                            value={ruleCutoff}
                            onChange={(e) => setRuleCutoff(Number(e.target.value))}
                            className="w-full bg-slate-955 border border-slate-850 rounded px-2.5 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            Mandatory subjects
                          </label>
                          <input
                            type="text"
                            value={ruleSubjects}
                            onChange={(e) => setRuleSubjects(e.target.value)}
                            className="w-full bg-slate-955 border border-slate-850 rounded px-2.5 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Save className="w-4 h-4" /> Save Admission Rules
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 6. Tab: AI Settings */}
                {activeTab === 'ai' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">
                      OpenAI Counselor Settings
                    </h3>

                    <form onSubmit={handleUpdateAISettings} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            Model Name
                          </label>
                          <select
                            value={aiModel}
                            onChange={(e) => setAiModel(e.target.value)}
                            className="w-full bg-slate-955 border border-slate-850 rounded px-2.5 py-2 text-xs text-white cursor-pointer"
                          >
                            <option value="gpt-4o">gpt-4o (Primary)</option>
                            <option value="gpt-4o-mini">gpt-4o-mini (Cost-efficient)</option>
                            <option value="gpt-4">gpt-4 (Legacy)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            Temperature ({aiTemp})
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1.5"
                            step="0.1"
                            value={aiTemp}
                            onChange={(e) => setAiTemp(Number(e.target.value))}
                            className="w-full cursor-pointer accent-indigo-500 mt-2"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            System Instructions / Prompts
                          </label>
                          <textarea
                            rows={5}
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="w-full bg-slate-955 border border-slate-850 rounded px-3 py-2 text-xs text-white resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Save className="w-4 h-4" /> Save AI settings
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 7. Tab: Knowledge Base */}
                {activeTab === 'kb' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">
                      RAG Document Index
                    </h3>

                    <div className="space-y-3">
                      {kbChunks.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-3"
                        >
                          <div className="space-y-1">
                            <span className="font-bold text-white text-xs block">{c.fileName}</span>
                            <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                              <span>Size: {(c.sizeBytes / 1024).toFixed(1)} KB</span>
                              <span>•</span>
                              <span>Chunks: {c.chunksCount}</span>
                              <span>•</span>
                              <span>Vectors: {c.embeddingDimension}d</span>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 font-bold shrink-0 self-start md:self-auto">
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. Tab: Documents Vault (Manual Review) */}
                {activeTab === 'docs' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">
                      Student Verification Vault
                    </h3>

                    <div className="space-y-3">
                      {documentsList.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs">
                          No uploaded verification documents found.
                        </div>
                      ) : (
                        documentsList.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className="font-bold text-white text-xs">{doc.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  Type: <strong className="text-indigo-400">{doc.type}</strong> |
                                  Student: {doc.student?.user?.name || 'Anonymous'} (
                                  {doc.student?.user?.email})
                                </p>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  doc.verificationStatus === 'VERIFIED'
                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                    : doc.verificationStatus === 'REJECTED'
                                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}
                              >
                                {doc.verificationStatus}
                              </span>
                            </div>

                            {doc.notes && (
                              <div className="p-2.5 bg-slate-900/30 border border-slate-900 rounded-lg text-[10px] text-slate-450 leading-relaxed font-mono">
                                Extract: {doc.notes}
                              </div>
                            )}

                            {doc.verificationStatus === 'PENDING' && (
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  onClick={() => handleVerifyDocument(doc.id, 'REJECTED')}
                                  className="px-2.5 py-1 text-[10px] font-bold rounded bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                                >
                                  Reject File
                                </button>
                                <button
                                  onClick={() => handleVerifyDocument(doc.id, 'VERIFIED')}
                                  className="px-2.5 py-1 text-[10px] font-bold rounded bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all cursor-pointer"
                                >
                                  Approve & Verify
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
