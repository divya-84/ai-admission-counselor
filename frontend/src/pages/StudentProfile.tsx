import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  GraduationCap,
  Users,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const navigate = useNavigate();

  // Profile fields state
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');

  const [academicLevel, setAcademicLevel] = useState('Undergraduate');
  const [highSchoolName, setHighSchoolName] = useState('');
  const [qualification, setQualification] = useState('');
  const [boardUniversity, setBoardUniversity] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [percentage, setPercentage] = useState('');
  const [gpa, setGpa] = useState('');
  const [backlogs, setBacklogs] = useState('0');

  const [preferredCountry, setPreferredCountry] = useState('');
  const [preferredIntake, setPreferredIntake] = useState('Fall 2026');
  const [preferredCampus, setPreferredCampus] = useState('');

  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [guardianContact, setGuardianContact] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/student/profile');
        const result = await res.json();
        if (res.ok && result.status === 'success') {
          const s = result.data.student;
          setFullname(s.user?.name || '');
          setEmail(s.user?.email || '');
          setPhone(s.phone || '');
          if (s.dateOfBirth) {
            setDateOfBirth(new Date(s.dateOfBirth).toISOString().substring(0, 10));
          }
          setGender(s.gender || '');
          setNationality(s.nationality || '');
          setAddress(s.address || '');
          setCity(s.city || '');
          setState(s.state || '');
          setPinCode(s.pinCode || '');
          setAcademicLevel(s.academicLevel || 'Undergraduate');
          setHighSchoolName(s.highSchoolName || '');
          setQualification(s.qualification || '');
          setBoardUniversity(s.boardUniversity || '');
          setPassingYear(s.passingYear ? String(s.passingYear) : '');
          setPercentage(s.percentage ? String(s.percentage) : '');
          setGpa(s.gpa ? String(s.gpa) : '');
          setBacklogs(s.backlogs !== undefined ? String(s.backlogs) : '0');
          setPreferredCountry(s.preferredCountry || '');
          setPreferredIntake(s.preferredIntake || 'Fall 2026');
          setPreferredCampus(s.preferredCampus || '');
          setFatherName(s.fatherName || '');
          setMotherName(s.motherName || '');
          setGuardianContact(s.guardianContact || '');
        } else {
          setError(result.message || 'Failed to retrieve profile data.');
        }
      } catch {
        setError('Error connecting to database to load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname,
          phone: phone || undefined,
          dateOfBirth: dateOfBirth || undefined,
          gender: gender || undefined,
          address: address || undefined,
          city: city || undefined,
          state: state || undefined,
          pinCode: pinCode || undefined,
          nationality: nationality || undefined,
          academicLevel,
          highSchoolName: highSchoolName || undefined,
          qualification: qualification || undefined,
          boardUniversity: boardUniversity || undefined,
          passingYear: passingYear ? Number(passingYear) : undefined,
          percentage: percentage ? Number(percentage) : undefined,
          gpa: gpa ? Number(gpa) : undefined,
          backlogs: backlogs ? Number(backlogs) : 0,
          preferredCountry: preferredCountry || undefined,
          preferredIntake,
          preferredCampus: preferredCampus || undefined,
          fatherName: fatherName || undefined,
          motherName: motherName || undefined,
          guardianContact: guardianContact || undefined,
        }),
      });

      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setSuccess('Profile details saved successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(result.message || 'Failed to update profile.');
      }
    } catch {
      setError('Connection error while updating profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header navigation back */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-400">Back to Dashboard</span>
        </div>

        {/* Welcome Section */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-2">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <User className="w-8 h-8 text-indigo-500" />
            Complete Registration Profile
          </h1>
          <p className="text-slate-400 text-sm">
            Please fill out all the registration fields below. The assigned counselor will review
            this profile to determine course eligibility.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {isLoading ? (
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-3 text-slate-400 text-sm h-64">
            <div className="w-7 h-7 border-2 border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
            <span className="font-medium">Loading your profile record...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Personal Information */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <User className="w-5 h-5 text-indigo-400" /> Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Email Address (Read-only)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-500 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Nationality
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. Indian"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Address Information */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <MapPin className="w-5 h-5 text-indigo-400" /> Address Details
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase">
                  Street Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 University Drive"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs text-slate-400 font-semibold uppercase">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">PIN Code</label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Academic Details */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" /> Academic & Enrollment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Academic Level
                  </label>
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="High School">High School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    High School Name
                  </label>
                  <input
                    type="text"
                    value={highSchoolName}
                    onChange={(e) => setHighSchoolName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Qualification Degree
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. Higher Secondary, Bachelor of Tech"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Board / University
                  </label>
                  <input
                    type="text"
                    value={boardUniversity}
                    onChange={(e) => setBoardUniversity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Passing Year
                  </label>
                  <input
                    type="number"
                    value={passingYear}
                    onChange={(e) => setPassingYear(e.target.value)}
                    placeholder="e.g. 2025"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    GPA score (Out of 4.0/10.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    placeholder="e.g. 3.85"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Aggregate Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="e.g. 88.5"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Number of Backlogs
                  </label>
                  <input
                    type="number"
                    value={backlogs}
                    onChange={(e) => setBacklogs(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Intended Country
                  </label>
                  <input
                    type="text"
                    value={preferredCountry}
                    onChange={(e) => setPreferredCountry(e.target.value)}
                    placeholder="e.g. USA"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Preferred Intake
                  </label>
                  <select
                    value={preferredIntake}
                    onChange={(e) => setPreferredIntake(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="Fall 2026">Fall 2026</option>
                    <option value="Spring 2027">Spring 2027</option>
                    <option value="Summer 2027">Summer 2027</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Preferred Campus Location
                  </label>
                  <input
                    type="text"
                    value={preferredCampus}
                    onChange={(e) => setPreferredCampus(e.target.value)}
                    placeholder="e.g. Main Campus, City Center"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Parent & Guardian Details */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Users className="w-5 h-5 text-indigo-400" /> Parent & Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Father's Full Name
                  </label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Mother's Full Name
                  </label>
                  <input
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">
                    Guardian Contact Number
                  </label>
                  <input
                    type="tel"
                    value={guardianContact}
                    onChange={(e) => setGuardianContact(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Actions Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition-all text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/20 disabled:bg-slate-800 cursor-pointer disabled:cursor-not-allowed text-sm transition-all"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving Changes...' : 'Save Profile details'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
