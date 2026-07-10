import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  FileCheck,
  Bell,
  Mail,
} from 'lucide-react';

interface Counselor {
  id: string;
  name: string;
  specialization: string;
  bio: string;
  rating: number;
}

interface Appointment {
  id: string;
  counselorId: string;
  date: string;
  time: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  counselor?: {
    user?: {
      name: string;
    };
  };
}

export const Appointments: React.FC = () => {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Selection States
  const [selectedCounselor, setSelectedCounselor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to tomorrow
  );
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [isListing, setIsListing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Time Slots
  const availableSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
  ];

  const fetchCounselors = async () => {
    try {
      const response = await fetch('/api/appointments/counselors');
      const result = await response.json();
      if (response.ok) {
        setCounselors(result.data.counselors);
        if (result.data.counselors.length > 0) {
          setSelectedCounselor(result.data.counselors[0].id);
        }
      }
    } catch {
      setError('Could not retrieve counselor availability.');
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments/my-appointments');
      const result = await response.json();
      if (response.ok) {
        setAppointments(result.data.appointments);
      }
    } catch {
      setError('Could not retrieve your booked appointments.');
    } finally {
      setIsListing(false);
    }
  };

  useEffect(() => {
    fetchCounselors();
    fetchAppointments();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounselor) {
      setError('Please select a counselor');
      return;
    }
    if (!selectedTime) {
      setError('Please select a time slot');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          counselorId: selectedCounselor,
          date: selectedDate,
          time: selectedTime,
          notes,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccess('Slot booked! Mock Email confirmation dispatched and reminder scheduled.');
        setNotes('');
        setSelectedTime('');
        fetchAppointments();
      } else {
        setError(result.message || 'Slot booking failed');
      }
    } catch {
      setError('An error occurred booking the appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/appointments/cancel/${id}`, {
        method: 'POST',
      });
      if (response.ok) {
        setSuccess('Appointment cancelled successfully. Status updated.');
        fetchAppointments();
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to cancel appointment');
      }
    } catch {
      setError('Error cancelling appointment.');
    }
  };

  // Check if a specific slot is already booked for the selected counselor on the selected date
  const isSlotBooked = (time: string) => {
    return appointments.some(
      (apt) =>
        apt.counselorId === selectedCounselor &&
        apt.date.startsWith(selectedDate) &&
        apt.time === time &&
        apt.status === 'SCHEDULED',
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-2">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-indigo-500" />
            Counseling Session Scheduler
          </h1>
          <p className="text-slate-400 text-sm">
            Book slots with expert university advisors, configure email notifications, and schedule
            alert reminders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Booking Form */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              Book a New Counseling Session
            </h3>

            <form onSubmit={handleBook} className="space-y-6">
              {/* Counselor Selector */}
              <div className="space-y-3">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  Select Counselor
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {counselors.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCounselor(c.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-2 select-none ${
                        selectedCounselor === c.id
                          ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-white">{c.name}</span>
                        <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {c.rating}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-300 font-medium">{c.specialization}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        {c.bio}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800/80">
                {/* Date Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Choose Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime(''); // Reset selected time when date changes
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer"
                    required
                  />
                </div>

                {/* Time Slots Grid */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Select Available Time Slot
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSlots.map((time) => {
                      const booked = isSlotBooked(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={booked}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                            booked
                              ? 'bg-slate-900 border-slate-900 text-slate-600 cursor-not-allowed'
                              : selectedTime === time
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 cursor-pointer'
                          }`}
                        >
                          {time} {booked && '(Booked)'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Session Notes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  Session Agenda / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Need help matching AKTU scholarship waiver marks requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none resize-none"
                />
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 px-4 py-3 rounded-xl font-semibold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? 'Booking Counselor Slot...' : 'Confirm Booking'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Column 3: Scheduled Appointments Vault */}
          <div className="space-y-6">
            {/* Status Messages */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold space-y-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{success}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-indigo-300/80 pt-1 border-t border-indigo-500/10">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email sent
                  </span>
                  <span className="flex items-center gap-1">
                    <Bell className="w-3 h-3" /> Reminder set
                  </span>
                </div>
              </div>
            )}

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Your Sessions
              </h3>

              {isListing ? (
                <div className="flex flex-col items-center justify-center space-y-3 py-12 text-slate-500 text-xs">
                  <div className="w-6 h-6 border-2 border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span>Loading appointments...</span>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <HelpCircle className="w-8 h-8 text-slate-800 mx-auto" />
                  <p className="text-xs">No scheduled counseling sessions yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-white text-sm">
                            {apt.counselor?.user?.name || 'Dr. Ananya Mishra'}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {new Date(apt.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            at {apt.time}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            apt.status === 'SCHEDULED'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : apt.status === 'CANCELLED'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      {apt.notes && (
                        <p className="text-[10px] text-slate-500 bg-slate-900/30 p-2 rounded-lg border border-slate-900/50 leading-relaxed italic">
                          Agenda: "{apt.notes}"
                        </p>
                      )}

                      {apt.status === 'SCHEDULED' && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleCancel(apt.id)}
                            className="px-2.5 py-1 text-[10px] font-semibold rounded bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                          >
                            Cancel Session
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
