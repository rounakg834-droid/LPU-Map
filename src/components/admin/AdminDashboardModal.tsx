import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Trash2,
  AlertTriangle,
  Lock,
  Unlock,
  Radio,
  Search,
  QrCode,
  Download,
  Copy,
  Check,
  Ban,
  Plus
} from 'lucide-react';
import { PublicCampusEvent, ProtectedStudentMetadata, EventReport } from '../../types/events';
import { eventService } from '../../services/eventService';
import { authService } from '../../services/authService';
import { RoadClosure } from '../../types/roadClosure';
import { roadClosureService } from '../../services/roadClosureService';
import { CAMPUS_LOCATIONS } from '../../data/locations';
import { CampusLocation } from '../../types/location';
import { campusRouteGraph } from '../../data/campusRouteGraph';
import { qrToSVG } from '../../utils/qrGenerator';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(authService.isAdmin());
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'events' | 'reports' | 'closures' | 'qr'>('events');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [events, setEvents] = useState<PublicCampusEvent[]>([]);
  const [metadata, setMetadata] = useState<ProtectedStudentMetadata[]>([]);
  const [reports, setReports] = useState<EventReport[]>([]);
  const [closures, setClosures] = useState<RoadClosure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Road Closure Form States
  const [closureTitle, setClosureTitle] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [closureSegment, setClosureSegment] = useState('');
  const [nodeA, setNodeA] = useState('n_unipolis_concourse');
  const [nodeB, setNodeB] = useState('n_boulevard_2');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );

  // QR Code States
  const [selectedQrLocationId, setSelectedQrLocationId] = useState<string>('block-34');
  const [qrCopied, setQrCopied] = useState(false);

  useEffect(() => {
    setIsAdmin(authService.isAdmin());
    if (authService.isAdmin() && isOpen) {
      loadData();
      const unsub = eventService.subscribeToAllEvents(() => {
        loadData();
      });
      return () => unsub();
    }
  }, [isOpen, isAdmin]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await eventService.getAdminDashboardData();
      setEvents(data.events);
      setMetadata(data.metadata);
      setReports(data.reports);
      setClosures(roadClosureService.getAllClosures());
    } catch (err) {
      onShowToast((err as Error).message || 'Failed to load admin data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await authService.signInAdminWithEmail(adminEmail, adminPassword);
      setIsAdmin(true);
      setAdminPassword('');
      onShowToast('Administrative privileges authenticated', 'success');
      loadData();
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication failed');
      onShowToast(err?.message || 'Authentication failed', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogoutAdmin = async () => {
    await authService.signOut();
    setIsAdmin(false);
    onShowToast('Exited administrative mode', 'info');
  };

  const handleRemoveEvent = async (eventId: string, title: string) => {
    const reason = prompt(`Enter reason for removing "${title}":`, 'Campus moderation policy violation');
    if (!reason || !reason.trim()) return;

    try {
      await eventService.adminRemoveEvent(eventId, reason.trim());
      onShowToast(`Event removed from campus map: ${title}`, 'success');
      await loadData();
    } catch (err) {
      onShowToast((err as Error).message || 'Failed to remove event from server', 'error');
    }
  };

  const handleCreateClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureTitle.trim() || !closureReason.trim() || !closureSegment.trim()) {
      onShowToast('Please fill all closure fields', 'warning');
      return;
    }

    try {
      await roadClosureService.createClosure({
        title: closureTitle.trim(),
        reason: closureReason.trim(),
        segmentDescription: closureSegment.trim(),
        nodeA,
        nodeB,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString()
      });
      onShowToast('Official road closure activated and routes updated', 'success');
      setClosureTitle('');
      setClosureReason('');
      setClosureSegment('');
      loadData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to create road closure', 'error');
    }
  };

  const handleApproveClosure = async (id: string) => {
    try {
      await roadClosureService.approveClosure(id);
      onShowToast('Student blockage report approved as active campus closure', 'success');
      loadData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to approve closure', 'error');
    }
  };

  const handleDeleteClosure = async (id: string) => {
    try {
      await roadClosureService.deleteClosure(id);
      onShowToast('Closure removed from campus network', 'info');
      loadData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to delete closure', 'error');
    }
  };

  const getQrUrl = (locId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lpunav.in';
    return `${origin}/?qr=${locId}`;
  };

  const handleCopyQrLink = async (locId: string) => {
    const url = getQrUrl(locId);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2000);
      onShowToast('QR Navigation link copied to clipboard', 'success');
    }
  };

  const handleDownloadQrSvg = (loc: CampusLocation) => {
    const url = getQrUrl(loc.id);
    const svgString = qrToSVG(url, { size: 400, color: '#0f172a' });
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `LPU_QR_${loc.id}.svg`;
    link.click();
    onShowToast(`Downloaded printable QR for ${loc.name}`, 'success');
  };

  if (!isOpen) return null;

  // KPI Metrics
  const totalEvents = events.length;
  const liveEvents = events.filter((e) => e.status === 'live').length;
  const upcomingEvents = events.filter((e) => e.status === 'upcoming').length;
  const expiredEvents = events.filter((e) => e.status === 'ended').length;
  const reportedEventsCount = reports.filter((r) => r.status === 'pending').length;

  const filteredEvents = events.filter((e) => {
    const q = searchQuery.toLowerCase();
    const meta = metadata.find((m) => m.eventId === e.id);
    return (
      e.title.toLowerCase().includes(q) ||
      e.locationName.toLowerCase().includes(q) ||
      e.creatorName.toLowerCase().includes(q) ||
      (meta && (meta.fullName.toLowerCase().includes(q) || meta.course.toLowerCase().includes(q)))
    );
  });

  const selectedQrLocation = CAMPUS_LOCATIONS.find((l: CampusLocation) => l.id === selectedQrLocationId) || CAMPUS_LOCATIONS[0];
  const graphNodeList = Object.values(campusRouteGraph.nodes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">LPU Navigator Administrator Console</h3>
                {isAdmin && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    Authorized
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Secure moderation, privacy audit & event governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={handleLogoutAdmin}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Exit Admin</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAdmin ? (
          /* Admin Login Gate */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200 shadow-inner">
              <Lock className="w-8 h-8 text-brand-600" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">
                {!authService.hasConfiguredAdmin() ? 'First-Time Setup Required' : 'Administrator Sign-In Required'}
              </h4>
              <p className="text-xs text-slate-500">
                {!authService.hasConfiguredAdmin()
                  ? 'No administrator account has been initialized yet. Please open the dedicated /admin portal to configure the master administrator.'
                  : 'Protected administrative records contain sensitive student academic identifiers. Please sign in with your authorized administrator account.'}
              </p>
            </div>

            {authService.hasConfiguredAdmin() ? (
              <form onSubmit={handleLogin} className="w-full space-y-3">
                <input
                  type="email"
                  placeholder="Administrator Email (e.g. admin@lpu.co.in)"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />

                {loginError && (
                  <p className="text-xs text-red-600 font-medium">{loginError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{isLoggingIn ? 'Authenticating...' : 'Sign In as Administrator'}</span>
                </button>
              </form>
            ) : null}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, '', '/admin');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow transition active:scale-95"
              >
                {!authService.hasConfiguredAdmin()
                  ? 'Go to First-Time Setup at /admin →'
                  : 'Open Full Dedicated /admin Dashboard →'}
              </button>
            </div>
          </div>
        ) : (
          /* Admin Main Console */
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 border-b border-slate-200/80 flex-shrink-0">
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Events</span>
                <span className="text-xl font-extrabold text-slate-900">{totalEvents}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-red-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5" /> Live Now
                </span>
                <span className="text-xl font-extrabold text-red-600">{liveEvents}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-purple-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 block">Upcoming</span>
                <span className="text-xl font-extrabold text-purple-600">{upcomingEvents}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Expired History</span>
                <span className="text-xl font-extrabold text-slate-700">{expiredEvents}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> Pending Reports
                </span>
                <span className="text-xl font-extrabold text-amber-600">{reportedEventsCount}</span>
              </div>
            </div>

            {/* Navigation Tabs & Search */}
            <div className="px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                    activeTab === 'events'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Events ({events.length})
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                    activeTab === 'reports'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reports ({reports.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('closures')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                    activeTab === 'closures'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5 text-rose-500" />
                  <span>Road Closures ({closures.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                    activeTab === 'qr'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-blue-500" />
                  <span>QR Navigation</span>
                </button>
              </div>

              {activeTab === 'events' && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search event, student, course..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}
            </div>

            {/* Main Table View */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  Loading administrative database records...
                </div>
              ) : activeTab === 'events' ? (
                <div className="space-y-3">
                  {filteredEvents.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-medium">
                      No campus events found matching query.
                    </div>
                  ) : (
                    filteredEvents.map((ev) => {
                      const meta = metadata.find((m) => m.eventId === ev.id);
                      const isLive = ev.status === 'live';

                      return (
                        <div
                          key={ev.id}
                          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 hover:border-slate-300 transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    isLive
                                      ? 'bg-red-100 text-red-700 border border-red-200'
                                      : ev.status === 'upcoming'
                                      ? 'bg-purple-100 text-purple-700'
                                      : ev.status === 'cancelled'
                                      ? 'bg-slate-100 text-slate-500 line-through'
                                      : ev.status === 'removed_by_admin' || ev.status === 'removed'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {ev.status === 'removed_by_admin' ? 'Removed by Admin' : ev.status}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  {ev.category}
                                </span>
                                {ev.reportCount > 0 && (
                                  <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                                    {ev.reportCount} Report(s)
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-slate-900">{ev.title}</h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <span>{ev.locationName}</span>
                                <span>•</span>
                                <span>{new Date(ev.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                              </div>
                            </div>

                            {ev.status !== 'removed' && ev.status !== 'removed_by_admin' && ev.status !== 'cancelled' && (
                              <button
                                onClick={() => handleRemoveEvent(ev.id, ev.title)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition border border-red-200 active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>

                          {/* Protected Student Academic Details (ADMIN ONLY!) */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Student Legal Name</span>
                              <span className="font-bold text-slate-800">{meta?.fullName || ev.creatorName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Course & Department</span>
                              <span className="font-semibold text-slate-800">{meta?.course || 'Pending sync'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Year of Study</span>
                              <span className="font-semibold text-slate-800">{meta?.yearOfStudy || 'Pending sync'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Account / UID</span>
                              <span className="font-mono text-[10px] text-slate-600 truncate block">
                                {meta?.accountIdentifier || ev.creatorUid}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : activeTab === 'reports' ? (
                /* Abuse Reports View */
                <div className="space-y-3">
                  {reports.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-medium">
                      No student abuse reports logged. Campus event feed is clean!
                    </div>
                  ) : (
                    reports.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-4 bg-white rounded-2xl border border-amber-200/90 shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase">
                                {rep.reason.replace('_', ' ')}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(rep.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">
                              Target Event: {rep.eventTitle}
                            </h4>
                            {rep.details && (
                              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl mt-1">
                                "{rep.details}"
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveEvent(rep.eventId, rep.eventTitle)}
                            className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                          >
                            Remove Event
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'closures' ? (
                /* Road Closures & Maintenance Management View */
                <div className="space-y-6">
                  {/* Create Closure Form */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                      <Plus className="w-4 h-4 text-brand-600" />
                      <span>Create Official Campus Path Closure</span>
                    </div>

                    <form onSubmit={handleCreateClosure} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Closure Title</label>
                          <input
                            type="text"
                            required
                            value={closureTitle}
                            onChange={(e) => setClosureTitle(e.target.value)}
                            placeholder="e.g. Unipolis Stage Rigging & Barricade"
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Segment Description</label>
                          <input
                            type="text"
                            required
                            value={closureSegment}
                            onChange={(e) => setClosureSegment(e.target.value)}
                            placeholder="e.g. Unipolis Grand Concourse East Wing"
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">From Intersection (Node A)</label>
                          <select
                            value={nodeA}
                            onChange={(e) => setNodeA(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            {graphNodeList.map((n) => (
                              <option key={n.id} value={n.id}>
                                {n.name} ({n.id})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">To Intersection (Node B)</label>
                          <select
                            value={nodeB}
                            onChange={(e) => setNodeB(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            {graphNodeList.map((n) => (
                              <option key={n.id} value={n.id}>
                                {n.name} ({n.id})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Start Time</label>
                          <input
                            type="datetime-local"
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">End Time (Auto-Reopen)</label>
                          <input
                            type="datetime-local"
                            required
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Reason / Notice</label>
                        <input
                          type="text"
                          required
                          value={closureReason}
                          onChange={(e) => setClosureReason(e.target.value)}
                          placeholder="e.g. Closed for convocation setup. Pedestrians routed via Academic Boulevard."
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Activate Road Closure & Recalculate Routes
                      </button>
                    </form>
                  </div>

                  {/* Active Closures Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Current Campus Road Closures & Blockages ({closures.length})
                    </h4>
                    {closures.length === 0 ? (
                      <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                        No active campus road closures. All verified pathways are open.
                      </div>
                    ) : (
                      closures.map((c) => (
                        <div
                          key={c.id}
                          className={`p-3.5 rounded-2xl border ${
                            c.approvedByAdmin
                              ? 'bg-white border-slate-200'
                              : 'bg-amber-50/70 border-amber-200'
                          } flex items-start justify-between gap-3`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  c.approvedByAdmin
                                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {c.approvedByAdmin ? 'Official Closure' : 'Pending Student Report'}
                              </span>
                              <span className="text-xs font-bold text-slate-900">{c.title}</span>
                            </div>
                            <div className="text-xs text-slate-600">{c.segmentDescription}</div>
                            <div className="text-[11px] text-slate-500 italic">"{c.reason}"</div>
                            <div className="text-[10px] text-slate-400">
                              Active until: {new Date(c.endTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {!c.approvedByAdmin && (
                              <button
                                onClick={() => handleApproveClosure(c.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClosure(c.id)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition"
                              title="Delete Closure"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* QR Campus Navigation Generator View */
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                        <QrCode className="w-4 h-4 text-blue-600" />
                        <span>Generate Physical QR Navigation Marker</span>
                      </div>
                      <span className="text-[11px] text-slate-500">28+ Verified Buildings</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Select Campus Building / Entrance</label>
                          <select
                            value={selectedQrLocationId}
                            onChange={(e) => setSelectedQrLocationId(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {CAMPUS_LOCATIONS.map((loc: CampusLocation) => (
                              <option key={loc.id} value={loc.id}>
                                {loc.name} ({loc.category})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Target Scannable URL</label>
                          <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
                            <input
                              type="text"
                              readOnly
                              value={getQrUrl(selectedQrLocation.id)}
                              className="flex-1 text-xs font-mono text-slate-600 bg-transparent outline-none truncate"
                            />
                            <button
                              onClick={() => handleCopyQrLink(selectedQrLocation.id)}
                              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            >
                              {qrCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadQrSvg(selectedQrLocation)}
                          className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download High-Res SVG for Pillar Signage</span>
                        </button>
                      </div>

                      {/* QR Visual Preview */}
                      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: qrToSVG(getQrUrl(selectedQrLocation.id), {
                              size: 160,
                              color: '#0f172a'
                            })
                          }}
                          className="rounded-xl overflow-hidden shadow-inner"
                        />
                        <div className="text-xs font-bold text-slate-800 mt-2">
                          {selectedQrLocation.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Scan to start navigation from this point
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Batch Verified Locations Grid */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Verified Campus Locations Ready for Signage
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
                      {CAMPUS_LOCATIONS.map((loc: CampusLocation) => (
                        <div
                          key={loc.id}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 hover:border-blue-300 transition"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">{loc.name}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{loc.category}</div>
                          </div>
                          <button
                            onClick={() => handleDownloadQrSvg(loc)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition flex-shrink-0"
                            title="Download SVG"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
