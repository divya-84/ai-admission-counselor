import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Check,
  CheckCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Info,
  CheckCircle,
} from 'lucide-react';

interface NotificationModel {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  // Simulator form states
  const [simTitle, setSimTitle] = useState<string>('Admission Update');
  const [simContent, setSimContent] = useState<string>(
    'Your marksheet verification is complete. Please schedule counseling.',
  );
  const [channels, setChannels] = useState<string[]>(['IN_APP', 'EMAIL']);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isListing, setIsListing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/list');
      const result = await response.json();
      if (response.ok) {
        setNotifications(result.data.notifications);
      }
    } catch {
      setError('Could not retrieve notifications inbox.');
    } finally {
      setIsListing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleChannelChange = (ch: string) => {
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]));
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (channels.length === 0) {
      setError('Select at least one dispatch channel');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setSimLogs([]);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: simTitle,
          content: simContent,
          channels,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccess('Multi-channel dispatch finished successfully.');
        setSimLogs(result.data.log);
        fetchNotifications();
      } else {
        setError(result.message || 'Notification simulator failed');
      }
    } catch {
      setError('An error occurred connecting to notification dispatcher.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/read/${id}`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch {
      setError('Error updating notification status.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch {
      setError('Error updating notifications.');
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'UNREAD') return !notif.isRead;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-2">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-indigo-500" />
            Notification Center
          </h1>
          <p className="text-slate-400 text-sm">
            View in-app alerts, audit broadcast dispatches, and trigger test simulations across SMS,
            Email, and WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1 & 2: Alerts Inbox */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('ALL')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filter === 'ALL'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('UNREAD')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filter === 'UNREAD'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Unread ({notifications.filter((n) => !n.isRead).length})
                </button>
              </div>

              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all as read
                </button>
              )}
            </div>

            {isListing ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-16 text-slate-500 text-sm">
                <div className="w-7 h-7 border-2 border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="font-medium">Loading notifications inbox...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-3 flex flex-col items-center justify-center">
                <HelpCircle className="w-10 h-10 text-slate-800" />
                <p className="text-sm font-medium">Your notifications inbox is clear!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-all flex gap-3 ${
                      notif.isRead
                        ? 'bg-slate-950/20 border-slate-900 text-slate-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 h-fit ${
                        notif.isRead
                          ? 'bg-slate-900 text-slate-600 border border-slate-850'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4
                          className={`text-sm font-bold leading-snug ${notif.isRead ? 'text-slate-400' : 'text-white'}`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-medium shrink-0">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{notif.content}</p>
                    </div>

                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-850 text-indigo-400 cursor-pointer shrink-0 self-center"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 3: Dispatch Simulator */}
          <div className="space-y-6">
            {/* Status Messages */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> {success}
                </span>
              </div>
            )}

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Dispatch Simulator
              </h3>

              <form onSubmit={handleSimulate} className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Message Title
                  </label>
                  <input
                    type="text"
                    value={simTitle}
                    onChange={(e) => setSimTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    required
                  />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Content
                  </label>
                  <textarea
                    rows={3}
                    value={simContent}
                    onChange={(e) => setSimContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none"
                    required
                  />
                </div>

                {/* Channels Checkboxes */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Select Channels to Dispatch
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* In-App */}
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                        channels.includes('IN_APP')
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={channels.includes('IN_APP')}
                        onChange={() => handleChannelChange('IN_APP')}
                        className="hidden"
                      />
                      <Bell className="w-3.5 h-3.5" />
                      In-App Alert
                    </label>

                    {/* Email */}
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                        channels.includes('EMAIL')
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={channels.includes('EMAIL')}
                        onChange={() => handleChannelChange('EMAIL')}
                        className="hidden"
                      />
                      <Mail className="w-3.5 h-3.5" />
                      Email Link
                    </label>

                    {/* SMS */}
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                        channels.includes('SMS')
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={channels.includes('SMS')}
                        onChange={() => handleChannelChange('SMS')}
                        className="hidden"
                      />
                      <Smartphone className="w-3.5 h-3.5" />
                      SMS Text
                    </label>

                    {/* WhatsApp */}
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                        channels.includes('WHATSAPP')
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={channels.includes('WHATSAPP')}
                        onChange={() => handleChannelChange('WHATSAPP')}
                        className="hidden"
                      />
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp Msg
                    </label>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 px-4 py-2.5 rounded-lg font-semibold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Broadcasting...' : 'Simulate Send'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Simulation Result Logs */}
              {simLogs.length > 0 && (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Channel Dispatch Logs:
                  </span>
                  <div className="space-y-1 font-mono text-[10px] text-slate-400">
                    {simLogs.map((log, idx) => (
                      <p
                        key={idx}
                        className="border-b border-slate-900 pb-1 last:border-b-0 leading-normal"
                      >
                        {log}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
