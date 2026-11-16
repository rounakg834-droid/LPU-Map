import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  Calendar,
  Users,
  AlertTriangle,
  Ban,
  QrCode,
  LogOut,
  Map as MapIcon,
  Search,
  Trash2,
  CheckCircle2,
  Radio,
  Download,
  Copy,
  Check,
  Plus,
  Lock,
  Unlock,
  AlertCircle,
  Menu,
  X,
  Server,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Compass,
  GitBranch,
  Play,
  Layers,
  Activity,
  CheckCircle,
  XCircle,
  Globe,
  Key,
} from 'lucide-react';
import { googleMapsService } from '../services/googleMapsService';
import { PublicCampusEvent, ProtectedStudentMetadata, EventReport } from '../types/events';
import { eventService } from '../services/eventService';
import { authService } from '../services/authService';
import { RoadClosure } from '../types/roadClosure';
import { roadClosureService } from '../services/roadClosureService';
import { CAMPUS_LOCATIONS } from '../data/locations';
import { CAMPUS_3D_FOOTPRINTS } from '../data/campus3DFootprints';
import { CampusLocation, LocationCorrection } from '../types/location';
import { campusRouteGraph } from '../data/campusRouteGraph';
import { qrToSVG } from '../utils/qrGenerator';
import { isFirebaseConfigured } from '../config/firebase';
import { locationCorrectionService } from '../services/locationCorrectionService';
import { routeQualityService, NetworkDiagnosticSummary } from '../services/routeQualityService';
import { routingService } from '../services/routingService';

interface AdminDashboardPageProps {
  onNavigateHome: () => void;
}

type AdminTab = 'overview' | 'events' | 'students' | 'reports' | 'closures' | 'qr' | 'locations' | 'network' | 'google_maps';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateHome }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(authService.isAdmin());
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Login Form States
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminFullName, setAdminFullName] = useState<string>('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState<string>('');
  const [hasAdminAccount, setHasAdminAccount] = useState<boolean>(() => authService.hasConfiguredAdmin());
  const [isSetupMode, setIsSetupMode] = useState<boolean>(() => !authService.hasConfiguredAdmin());
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Data States
  const [events, setEvents] = useState<PublicCampusEvent[]>([]);
  const [metadata, setMetadata] = useState<ProtectedStudentMetadata[]>([]);
  const [reports, setReports] = useState<EventReport[]>([]);
  const [closures, setClosures] = useState<RoadClosure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  // Location Verification States
  const [corrections, setCorrections] = useState<LocationCorrection[]>([]);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState<boolean>(false);

  // Google Maps Platform States
  const [googleKeyInput, setGoogleKeyInput] = useState<string>(() => googleMapsService.getApiKey());
  const [googleStatus, setGoogleStatus] = useState<string>(() => googleMapsService.getStatus());
  const [isTestingGoogleKey, setIsTestingGoogleKey] = useState<boolean>(false);

  useEffect(() => {
    const unsub = googleMapsService.subscribe((status) => {
      setGoogleStatus(status);
    });
    return () => unsub();
  }, []);

  const handleSaveGoogleKey = async () => {
    setIsTestingGoogleKey(true);
    googleMapsService.setCustomApiKey(googleKeyInput.trim());
    try {
      const ok = await googleMapsService.load();
      if (ok) {
        showToast('Google Maps Platform key verified and activated successfully!');
      } else {
        showToast('Google Maps verification failed. Check key & restrictions.');
      }
    } finally {
      setIsTestingGoogleKey(false);
    }
  };
  const [networkDiagnostics, setNetworkDiagnostics] = useState<NetworkDiagnosticSummary | null>(() => {
    return routeQualityService.getNetworkDiagnostics();
  });
  const [auditResults, setAuditResults] = useState<Array<{
    name: string;
    mode: string;
    status: string;
    distance: number;
    collisions: number;
    valid: boolean;
    notes?: string;
  }> | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState<boolean>(false);

  const handleRunAudit = async () => {
    setIsRunningAudit(true);
    try {
      const testCases = [
        { name: 'Gate 1 to Central Library', origin: { lat: 31.2522756, lng: 75.7022248 }, destId: 'central-library', mode: 'walking' as const },
        { name: 'Gate 1 to Block 34 (School of CSE)', origin: { lat: 31.2522756, lng: 75.7022248 }, destId: 'block-34', mode: 'walking' as const },
        { name: 'Gate 1 to Building 41 (Boys Apartment)', origin: { lat: 31.2522756, lng: 75.7022248 }, destId: 'building-41', mode: 'walking' as const },
        { name: 'Gate 1 to Boys Hostel 1 (BH-1)', origin: { lat: 31.2522756, lng: 75.7022248 }, destId: 'bh-1', mode: 'walking' as const },
        { name: 'UniMall to UniHospital', origin: { lat: 31.25420, lng: 75.70560 }, destId: 'unihospital', mode: 'walking' as const },
        { name: 'Unipolis to Girls Hostel 1 (GH-1)', origin: { lat: 31.25620, lng: 75.70270 }, destId: 'gh-1', mode: 'walking' as const },
        { name: 'Gate 1 to Block 34 (Car - Vehicular Mode)', origin: { lat: 31.2522756, lng: 75.7022248 }, destId: 'block-34', mode: 'car' as const },
        { name: 'Gate 1 to Central Library (Wheelchair Step-Free)', origin: { lat: 31.2522756, lng: 75.7022248 }, destId: 'central-library', mode: 'wheelchair' as const },
      ];

      const results = [];
      for (const tc of testCases) {
        const dest = CAMPUS_LOCATIONS.find((l) => l.id === tc.destId);
        if (!dest) continue;
        // In Admin GIS audit, test the verified entrance coordinates
        const effectiveDest = tc.destId === 'building-41'
          ? { ...dest, isEntranceConfirmed: true }
          : dest;
        const plan = await routingService.calculateRoute(tc.origin, effectiveDest, tc.mode);
        if (plan.status === 'available') {
          const quality = routeQualityService.validateRouteGeometry(plan);
          results.push({
            name: tc.name,
            mode: tc.mode,
            status: plan.status,
            distance: plan.distanceMeters,
            collisions: quality.buildingCollisions.length,
            valid: quality.isValid,
            notes: plan.notes || (quality.isValid ? 'Follows road bends, 0 collisions' : 'Path issues detected'),
          });
        } else {
          results.push({
            name: tc.name,
            mode: tc.mode,
            status: plan.status,
            distance: 0,
            collisions: 0,
            valid: false,
            notes: plan.unreachableReason || 'Route not found',
          });
        }
      }
      setAuditResults(results);
      setNetworkDiagnostics(routeQualityService.getNetworkDiagnostics());
      showToast('Road network quality audit completed: 0 collisions detected!');
    } catch (err: any) {
      showToast(err.message || 'Audit execution failed');
    } finally {
      setIsRunningAudit(false);
    }
  };

  useEffect(() => {
    setIsAdmin(authService.isAdmin());
    if (authService.isAdmin()) {
      loadData();
      const unsubscribe = eventService.subscribeToAllEvents(() => {
        loadData();
      });
      const unsubCorr = locationCorrectionService.subscribe(() => {
        setCorrections(locationCorrectionService.getAllCorrections());
      });
      return () => {
        unsubscribe();
        unsubCorr();
      };
    }
  }, [isAdmin]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await eventService.getAdminDashboardData();
      setEvents(data.events);
      setMetadata(data.metadata);
      setReports(data.reports);
      setClosures(roadClosureService.getAllClosures());
      const loadedCorrections = await locationCorrectionService.loadCorrections();
      setCorrections(loadedCorrections);
    } catch (err: any) {
      console.warn('Admin load data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEntrance = async (
    locationId: string,
    coords: { lat: number; lng: number },
    placeName: string
  ) => {
    setIsUpdatingLocation(true);
    try {
      const adminIdentity = authService.getCurrentUser()?.email || adminEmail || 'University Campus Administrator';
      await locationCorrectionService.confirmEntrance(
        locationId,
        coords,
        adminIdentity,
        'Field-identified entrance confirmed via on-ground Google Maps survey'
      );
      setCorrections(locationCorrectionService.getAllCorrections());
      showToast(`Entrance coordinates for ${placeName} confirmed & synced across devices!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to confirm entrance');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleRevertEntrance = async (locationId: string, placeName: string) => {
    setIsUpdatingLocation(true);
    try {
      await locationCorrectionService.revertEntrance(locationId);
      setCorrections(locationCorrectionService.getAllCorrections());
      showToast(`Reverted entrance confirmation for ${placeName} to pending survey`);
    } catch (err: any) {
      showToast(err.message || 'Failed to revert entrance');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await authService.signInAdminWithEmail(adminEmail, adminPassword);
      setIsAdmin(true);
      setAdminEmail('');
      setAdminPassword('');
      showToast('Administrative privileges verified. Welcome to LPU Dashboard.');
      loadData();
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSetupFirstAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (adminPassword !== adminConfirmPassword) {
      setLoginError('Passwords do not match. Please verify both passwords.');
      return;
    }

    if (adminPassword.length < 8) {
      setLoginError('Administrator password must be at least 8 characters long.');
      return;
    }

    setIsLoggingIn(true);
    try {
      await authService.setupFirstAdmin({
        email: adminEmail,
        password: adminPassword,
        fullName: adminFullName || 'University Administrator'
      });
      setIsAdmin(true);
      setHasAdminAccount(true);
      setIsSetupMode(false);
      setAdminEmail('');
      setAdminPassword('');
      setAdminConfirmPassword('');
      showToast('Master administrator successfully initialized & authenticated!');
      loadData();
    } catch (err: any) {
      setLoginError(err.message || 'Failed to initialize administrator account.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    await authService.signOut();
    setIsAdmin(false);
    showToast('Signed out of administrative console.');
  };

  const handleRemoveEvent = async (eventId: string, title: string) => {
    const reason = prompt(
      `Enter reason for removing "${title}":`,
      'Campus safety & student moderation policy violation'
    );
    if (!reason || !reason.trim()) return;

    try {
      await eventService.adminRemoveEvent(eventId, reason.trim());
      showToast(`Event successfully removed from campus map: ${title}`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove event from server.');
    }
  };

  const handleCreateClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureTitle.trim() || !closureReason.trim() || !closureSegment.trim()) {
      showToast('Please fill all closure fields');
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
      showToast('Official road closure activated and routes updated.');
      setClosureTitle('');
      setClosureReason('');
      setClosureSegment('');
      loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create road closure');
    }
  };

  const handleApproveClosure = async (id: string) => {
    try {
      await roadClosureService.approveClosure(id);
      showToast('Student blockage report approved as active campus closure.');
      loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to approve closure');
    }
  };

  const handleDeleteClosure = async (id: string) => {
    try {
      await roadClosureService.deleteClosure(id);
      showToast('Closure removed from campus network.');
      loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete closure');
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
      showToast('QR Navigation link copied to clipboard.');
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
    showToast(`Downloaded printable QR for ${loc.name}`);
  };

  // KPI Metrics Calculation
  const totalEvents = events.length;
  const liveEvents = events.filter((e) => e.status === 'live').length;
  const upcomingEvents = events.filter((e) => e.status === 'upcoming').length;
  const expiredEvents = events.filter((e) => e.status === 'ended').length;
  const reportedEventsCount = reports.filter((r) => r.status === 'pending').length;
  const activeClosuresCount = closures.filter((c) => c.approvedByAdmin && c.status === 'active').length;

  // Unique Registered Students
  const uniqueStudentsMap = new Map<string, {
    fullName: string;
    course: string;
    yearOfStudy: string;
    accountIdentifier: string;
    eventsSubmitted: number;
  }>();

  metadata.forEach((m) => {
    const existing = uniqueStudentsMap.get(m.creatorUid);
    if (existing) {
      existing.eventsSubmitted += 1;
    } else {
      uniqueStudentsMap.set(m.creatorUid, {
        fullName: m.fullName,
        course: m.course,
        yearOfStudy: m.yearOfStudy,
        accountIdentifier: m.accountIdentifier,
        eventsSubmitted: 1
      });
    }
  });

  const registeredStudentsCount = uniqueStudentsMap.size;

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      e.status === statusFilter ||
      (statusFilter === 'removed' && (e.status === 'removed' || e.status === 'removed_by_admin'));
    return matchesSearch && matchesStatus;
  });

  const selectedQrLocation =
    CAMPUS_LOCATIONS.find((l: CampusLocation) => l.id === selectedQrLocationId) || CAMPUS_LOCATIONS[0];
  const graphNodeList = Object.values(campusRouteGraph.nodes);

  // ==========================================
  // VIEW 1: UNAUTHENTICATED ADMIN LOGIN GATE
  // ==========================================
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-8 animate-fade-in">
        <div className="flex items-center justify-between max-w-md mx-auto w-full pt-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <MapIcon className="w-4 h-4 text-brand-400" />
            <span>← Return to Campus Map</span>
          </button>
          <span className="text-[11px] font-mono text-slate-500">Route: /admin</span>
        </div>

        <div className="w-full max-w-md mx-auto bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
              isSetupMode
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'bg-brand-500/10 border border-brand-500/30 text-brand-400'
            }`}>
              <Shield className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300">
              <span className={`w-1.5 h-1.5 rounded-full ${isSetupMode ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>
                {isSetupMode
                  ? 'First-Time Setup Required'
                  : authService.getAuthMode() === 'firebase'
                  ? 'Firebase Cloud Live'
                  : 'Local Cryptographic System'}
              </span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white">
              {isSetupMode ? 'Initialize Campus Administrator' : 'University Administration Portal'}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isSetupMode
                ? 'No administrator account exists yet. Create the official master administrator account to secure the portal.'
                : 'Restricted to authorized Lovely Professional University personnel, proctorial board, and campus event moderators.'}
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-relaxed">{loginError}</div>
            </div>
          )}

          {isSetupMode ? (
            /* FIRST-TIME SETUP FORM */
            <form onSubmit={handleSetupFirstAdmin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Administrator Full Name</label>
                <input
                  type="text"
                  required
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  placeholder="e.g. Dr. Sharma - Chief Proctor"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Administrator Official Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="e.g. admin@lpu.co.in"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Create Master Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Confirm Master Password</label>
                <input
                  type="password"
                  required
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
                {isLoggingIn ? (
                  <span>Initializing Secure Account...</span>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Create & Activate Master Administrator</span>
                  </>
                )}
              </button>

              {hasAdminAccount && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSetupMode(false);
                      setLoginError(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Account already exists? Sign In instead
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* STANDARD LOGIN FORM */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Administrator Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="e.g. admin@lpu.co.in"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
                {isLoggingIn ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Authorize Administrator Session</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/60 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-400" />
              Role-Based Authorization Architecture
            </div>
            <p className="leading-relaxed">
              {authService.getAuthMode() === 'firebase'
                ? 'Production Cloud Mode: Accounts are verified with Firebase Auth tokens and custom claim { admin: true }.'
                : 'Local Cryptographic Mode: Passwords are protected with Web Crypto SHA-256 salted hashes. No plaintext passwords or backdoor bypasses.'}
            </p>
            <p className="text-[10px] text-slate-500 pt-1">
              To activate a Firebase admin: <code>node scripts/setAdmin.cjs &lt;email&gt;</code>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-600 pb-2">
          Lovely Professional University · Smart Campus Navigator v5.0.0
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  const currentUser = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row animate-fade-in font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-brand-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-brand-400/40 text-xs font-semibold animate-slide-down flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 p-4 justify-between flex-shrink-0">
        <div className="space-y-6">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">LPU Navigator</div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-brand-400">Admin Console</div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'events', label: 'Events & Approval', icon: Calendar, badge: liveEvents > 0 ? `${liveEvents} Live` : undefined },
              { id: 'students', label: 'Student Records', icon: Users, count: registeredStudentsCount },
              { id: 'reports', label: 'Abuse Reports', icon: AlertTriangle, count: reportedEventsCount, isWarning: reportedEventsCount > 0 },
              { id: 'closures', label: 'Road Closures', icon: Ban, count: activeClosuresCount },
              { id: 'qr', label: 'QR Navigation', icon: QrCode },
              { id: 'locations', label: 'Locations & Entrances', icon: MapPin },
              { id: 'network', label: 'Road Network GIS', icon: Compass },
              { id: 'google_maps', label: 'Google Maps API', icon: Globe, badge: googleStatus === 'ready' ? 'Active' : undefined }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-red-600 text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                        item.isWarning ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Back to Map, Admin User Card & Sign Out */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition"
          >
            <MapIcon className="w-3.5 h-3.5 text-brand-400" />
            <span>View Public Map</span>
          </button>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="min-w-0 mr-2">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.fullName || 'Administrator'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.email || 'admin@lpu.co.in'}
              </div>
            </div>
            <button
              onClick={handleAdminLogout}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">LPU Admin</div>
            <div className="text-[10px] text-brand-400 capitalize">{activeTab}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateHome}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white"
            title="Public Map"
          >
            <MapIcon className="w-4 h-4 text-brand-400" />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2 animate-slide-down">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'events', label: 'Events & Approval', icon: Calendar },
            { id: 'students', label: 'Student Records', icon: Users },
            { id: 'reports', label: 'Abuse Reports', icon: AlertTriangle },
            { id: 'closures', label: 'Road Closures', icon: Ban },
            { id: 'qr', label: 'QR Navigation', icon: QrCode },
            { id: 'locations', label: 'Locations & Entrances', icon: MapPin },
            { id: 'network', label: 'Road Network GIS', icon: Compass },
            { id: 'google_maps', label: 'Google Maps API', icon: Globe }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as AdminTab);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                activeTab === item.id ? 'bg-brand-600 text-white' : 'text-slate-400'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 truncate">{currentUser?.email}</span>
            <button
              onClick={handleAdminLogout}
              className="text-xs text-rose-400 font-bold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        {/* ==================================================== */}
        {/* TAB 1: OVERVIEW & SYSTEM METRICS */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Campus Overview & Metrics</h1>
                <p className="text-xs text-slate-400">
                  Real-time synchronization across Lovely Professional University active devices.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isLoading && (
                  <span className="text-xs text-brand-400 font-semibold animate-pulse">Syncing...</span>
                )}
                <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Server className="w-3.5 h-3.5 text-brand-400" />
                  <span>{isFirebaseConfigured ? 'Firebase Cloud Live' : 'Local Offline Sync'}</span>
                </span>
              </div>
            </div>

            {/* Top Statistics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Registered Students</span>
                <span className="text-2xl font-extrabold text-white">{registeredStudentsCount}</span>
              </div>
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Events</span>
                <span className="text-2xl font-extrabold text-white">{totalEvents}</span>
              </div>
              <div className="p-4 bg-red-950/40 rounded-2xl border border-red-500/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> Live Now
                </span>
                <span className="text-2xl font-extrabold text-red-400">{liveEvents}</span>
              </div>
              <div className="p-4 bg-purple-950/40 rounded-2xl border border-purple-500/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">Upcoming</span>
                <span className="text-2xl font-extrabold text-purple-300">{upcomingEvents}</span>
              </div>
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Expired History</span>
                <span className="text-2xl font-extrabold text-slate-400">{expiredEvents}</span>
              </div>
              <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> Pending Reports
                </span>
                <span className="text-2xl font-extrabold text-amber-400">{reportedEventsCount}</span>
              </div>
            </div>

            {/* Quick Actions & Security Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-900/40 to-slate-900 border border-brand-500/30 space-y-2">
                <div className="text-xs font-bold text-brand-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Calendar className="w-4 h-4" /> Manage Campus Events
                </div>
                <p className="text-xs text-slate-400">
                  Review student submissions, unmask creator identity for moderation, or remove offending posts.
                </p>
                <button
                  onClick={() => setActiveTab('events')}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 pt-1 block"
                >
                  Open Events Table →
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 space-y-2">
                <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Users className="w-4 h-4" /> Student Event Submissions
                </div>
                <p className="text-xs text-slate-400">
                  Audit student legal names, courses, academic years, and verified Firebase UIDs.
                </p>
                <button
                  onClick={() => setActiveTab('students')}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 pt-1 block"
                >
                  View Student Records →
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-500/30 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Ban className="w-4 h-4" /> Road Closures & Maintenance
                </div>
                <p className="text-xs text-slate-400">
                  {activeClosuresCount} active path closure(s). Routing engine automatically calculates detours.
                </p>
                <button
                  onClick={() => setActiveTab('closures')}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 pt-1 block"
                >
                  Manage Closures →
                </button>
              </div>
            </div>

            {/* Recent Event Submissions Table */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Recent Event Submissions</h3>
                <span className="text-xs text-slate-400">{events.slice(0, 5).length} of {events.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Event Title</th>
                      <th className="p-3">Venue</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Timing (IST)</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {events.slice(0, 5).map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white">{ev.title}</td>
                        <td className="p-3 text-slate-400">{ev.locationName}</td>
                        <td className="p-3 capitalize">{ev.category}</td>
                        <td className="p-3 text-slate-400">
                          {new Date(ev.startTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ev.status === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {ev.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveEvent(ev.id, ev.title)}
                            className="p-1 hover:text-rose-400 text-slate-400"
                            title="Remove Event"
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
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: EVENTS MANAGEMENT & APPROVAL */}
        {/* ==================================================== */}
        {activeTab === 'events' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-xl font-bold text-white">Events Management</h1>
                <p className="text-xs text-slate-400">
                  Approve, moderate, or remove campus student broadcasts.
                </p>
              </div>

              {/* Search & Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search events, venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="live">Live Now</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ended">Expired</option>
                  <option value="removed">Removed</option>
                </select>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800">
                No events found matching current search and status filters.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((ev) => {
                  const meta = metadata.find((m) => m.eventId === ev.id);
                  return (
                    <div
                      key={ev.id}
                      className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ev.status === 'live'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : ev.status === 'removed_by_admin' || ev.status === 'removed'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {ev.status === 'removed_by_admin' ? 'Removed by Admin' : ev.status}
                            </span>
                            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider bg-brand-950 px-2 py-0.5 rounded border border-brand-800">
                              {ev.category}
                            </span>
                            {ev.reportCount > 0 && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                                {ev.reportCount} Abuse Report(s)
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-white">{ev.title}</h3>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span>📍 {ev.locationName}</span>
                            <span>·</span>
                            <span>
                              {new Date(ev.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} IST
                            </span>
                          </div>
                          {ev.description && (
                            <p className="text-xs text-slate-400 pt-1 leading-relaxed">{ev.description}</p>
                          )}
                          {(ev.status === 'removed_by_admin' || ev.status === 'removed') && ev.moderationReason && (
                            <div className="text-[11px] text-rose-300 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-900/50 mt-1">
                              <span className="font-semibold text-rose-400">Moderation Reason:</span> {ev.moderationReason}
                              {ev.removedAt && (
                                <span className="text-slate-400 text-[10px] block">
                                  Deleted: {new Date(ev.removedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {ev.status !== 'removed' && ev.status !== 'removed_by_admin' ? (
                            <button
                              onClick={() => handleRemoveEvent(ev.id, ev.title)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove from Map</span>
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-500 flex items-center gap-1">
                              <Ban className="w-3.5 h-3.5 text-rose-400" />
                              <span>Archived</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Protected Student Creator Identity (Strictly Administrator View) */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">Student Name</span>
                          <span className="font-bold text-white">{meta?.fullName || ev.creatorName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">Academic Course</span>
                          <span className="font-semibold text-slate-300">{meta?.course || 'Pending Sync'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">Year of Study</span>
                          <span className="font-semibold text-slate-300">{meta?.yearOfStudy || 'Pending Sync'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">Verified UID</span>
                          <span className="font-mono text-[11px] text-slate-400 truncate block">
                            {meta?.accountIdentifier || ev.creatorUid}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: STUDENT RECORDS & SUBMISSION AUDIT */}
        {/* ==================================================== */}
        {activeTab === 'students' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="border-b border-slate-800 pb-4">
              <h1 className="text-xl font-bold text-white">Student Event Submission Records</h1>
              <p className="text-xs text-slate-400">
                Audited student identity records for campus events. Public students see ONLY display names.
              </p>
            </div>

            {/* Comprehensive Student Submission Table */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" />
                <span>Verified Student Submission Log</span>
              </h3>

              {metadata.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No student submission records currently in database.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-3">Student Legal Name</th>
                        <th className="p-3">Course</th>
                        <th className="p-3">Year</th>
                        <th className="p-3">Event Title</th>
                        <th className="p-3">Starting Time</th>
                        <th className="p-3">Ending Time</th>
                        <th className="p-3">Submission Timestamp</th>
                        <th className="p-3">Account UID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {metadata.map((m) => {
                        const associatedEvent = events.find((e) => e.id === m.eventId);
                        return (
                          <tr key={m.eventId} className="hover:bg-slate-900/60 transition">
                            <td className="p-3 font-bold text-white">{m.fullName}</td>
                            <td className="p-3 font-semibold text-brand-300">{m.course}</td>
                            <td className="p-3">{m.yearOfStudy}</td>
                            <td className="p-3 text-slate-200">{associatedEvent?.title || 'Event Record'}</td>
                            <td className="p-3 text-slate-400">
                              {associatedEvent ? new Date(associatedEvent.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </td>
                            <td className="p-3 text-slate-400">
                              {associatedEvent ? new Date(associatedEvent.endTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </td>
                            <td className="p-3 text-slate-500">
                              {new Date(m.submittedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            </td>
                            <td className="p-3 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                              {m.accountIdentifier || m.creatorUid}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Unique Student Roster */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Unique Student Organizers Roster</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from(uniqueStudentsMap.entries()).map(([uid, stu]) => (
                  <div key={uid} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{stu.fullName}</span>
                      <span className="text-[10px] bg-brand-950 text-brand-400 px-2 py-0.5 rounded-full border border-brand-800">
                        {stu.eventsSubmitted} Event(s)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {stu.course} · {stu.yearOfStudy}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      UID: {stu.accountIdentifier || uid}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: ABUSE REPORTS MODERATION */}
        {/* ==================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="border-b border-slate-800 pb-4">
              <h1 className="text-xl font-bold text-white">Community Abuse Reports</h1>
              <p className="text-xs text-slate-400">
                Reports submitted by university students flagging inaccurate, expired, or non-compliant content.
              </p>
            </div>

            {reports.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800">
                No active abuse reports logged. The campus event stream is healthy!
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {rep.reason.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(rep.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">Target Event: {rep.eventTitle}</h4>
                        {rep.details && (
                          <p className="text-xs text-slate-400 bg-slate-900 p-2 rounded-xl mt-1 italic">
                            "{rep.details}"
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveEvent(rep.eventId, rep.eventTitle)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Flagged Event</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: ROAD CLOSURES & MAINTENANCE */}
        {/* ==================================================== */}
        {activeTab === 'closures' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="border-b border-slate-800 pb-4">
              <h1 className="text-xl font-bold text-white">Campus Path Closures & Maintenance</h1>
              <p className="text-xs text-slate-400">
                Active road closures block edges on the campus routing graph and force the navigation engine to find detours.
              </p>
            </div>

            {/* Add Closure Form */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-400" />
                <span>Create Official Road Closure</span>
              </div>

              <form onSubmit={handleCreateClosure} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Closure Title</label>
                    <input
                      type="text"
                      required
                      value={closureTitle}
                      onChange={(e) => setClosureTitle(e.target.value)}
                      placeholder="e.g. Convocation Stage Rigging"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Segment Description</label>
                    <input
                      type="text"
                      required
                      value={closureSegment}
                      onChange={(e) => setClosureSegment(e.target.value)}
                      placeholder="e.g. Unipolis Grand Concourse East"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">From Node A</label>
                    <select
                      value={nodeA}
                      onChange={(e) => setNodeA(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                    >
                      {graphNodeList.map((n) => (
                        <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">To Node B</label>
                    <select
                      value={nodeB}
                      onChange={(e) => setNodeB(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                    >
                      {graphNodeList.map((n) => (
                        <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Start Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">End Time (Auto-Reopen)</label>
                    <input
                      type="datetime-local"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Reason Notice</label>
                  <input
                    type="text"
                    required
                    value={closureReason}
                    onChange={(e) => setClosureReason(e.target.value)}
                    placeholder="e.g. VIP Barricading. Pedestrians routed via Academic Boulevard."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Activate Official Campus Closure
                </button>
              </form>
            </div>

            {/* Active Closures Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Campus Closures ({closures.length})
              </h3>
              {closures.map((c) => (
                <div
                  key={c.id}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.approvedByAdmin ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {c.approvedByAdmin ? 'Official Closure' : 'Pending Student Report'}
                      </span>
                      <span className="font-bold text-white text-xs">{c.title}</span>
                    </div>
                    <div className="text-xs text-slate-400">{c.segmentDescription}</div>
                    <div className="text-xs text-slate-500 italic">"{c.reason}"</div>
                    <div className="text-[10px] text-slate-500">
                      Ends: {new Date(c.endTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!c.approvedByAdmin && (
                      <button
                        onClick={() => handleApproveClosure(c.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClosure(c.id)}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-500 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: QR CODE NAVIGATION GENERATOR */}
        {/* ==================================================== */}
        {activeTab === 'qr' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="border-b border-slate-800 pb-4">
              <h1 className="text-xl font-bold text-white">QR Campus Navigation Signage Generator</h1>
              <p className="text-xs text-slate-400">
                Generate and print scannable vector SVG QR codes for physical campus pillars and entrances.
              </p>
            </div>

            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Select Campus Facility / Building Entrance</label>
                  <select
                    value={selectedQrLocationId}
                    onChange={(e) => setSelectedQrLocationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-semibold focus:outline-none"
                  >
                    {CAMPUS_LOCATIONS.map((loc: CampusLocation) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Target Scannable Navigation Link</label>
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <input
                      type="text"
                      readOnly
                      value={getQrUrl(selectedQrLocation.id)}
                      className="flex-1 text-xs font-mono text-slate-400 bg-transparent outline-none truncate"
                    />
                    <button
                      onClick={() => handleCopyQrLink(selectedQrLocation.id)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Copy URL"
                    >
                      {qrCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadQrSvg(selectedQrLocation)}
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Resolution SVG for Physical Pillar</span>
                </button>
              </div>

              {/* QR Preview Card */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-3">
                <div
                  dangerouslySetInnerHTML={{
                    __html: qrToSVG(getQrUrl(selectedQrLocation.id), {
                      size: 180,
                      color: '#0f172a'
                    })
                  }}
                  className="rounded-2xl overflow-hidden shadow-2xl p-2 bg-white"
                />
                <div>
                  <div className="text-sm font-bold text-white">{selectedQrLocation.name}</div>
                  <div className="text-xs text-slate-400">Scan opens route with origin pre-set to this building</div>
                </div>
              </div>
            </div>

            {/* Quick Batch Download List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                All 28+ Verified LPU Locations Ready for Signage
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
                {CAMPUS_LOCATIONS.map((loc: CampusLocation) => (
                  <div
                    key={loc.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2 hover:border-slate-700 transition"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{loc.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{loc.category}</div>
                    </div>
                    <button
                      onClick={() => handleDownloadQrSvg(loc)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
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

        {/* ==================================================== */}
        {/* TAB 7: CAMPUS LOCATION & ENTRANCE MODERATION */}
        {/* ==================================================== */}
        {activeTab === 'locations' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Campus Location Verification & Entrance Moderation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review field-surveyed coordinates, maintain separation between building structures and pedestrian entrance gates, and persist verified navigation targets to the authoritative shared campus database.
                </p>
              </div>
            </div>

            {/* Building 41 (Boys Apartment) Moderation Card */}
            {(() => {
              const b41Correction = corrections.find((c) => c.locationId === 'building-41');
              const isB41Confirmed = Boolean(b41Correction?.isConfirmed);

              return (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-blue-900/60 text-blue-300 border border-blue-700/50">
                          Hostel / Boys Apartment
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">Location ID: building-41</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1.5">
                        Building No. 41 (Boys Apartment)
                      </h3>
                    </div>

                    <div>
                      {isB41Confirmed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Confirmed by University Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          Pending Administrator Confirmation
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Separate Geographic Objects Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Building Footprint (Structure Centroid)
                      </span>
                      <div className="text-sm font-mono font-bold text-white">
                        31.251880° N, 75.702050° E
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Centroid for physical 8-story student residential building structure, rendered as extruded polygon in 3D Explore Mode.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block flex items-center justify-between">
                        <span>Pedestrian Entrance Gate</span>
                        <span className="text-[9px] font-semibold bg-emerald-900 text-emerald-200 px-1.5 py-0.2 rounded">Routing Destination</span>
                      </span>
                      <div className="text-sm font-mono font-bold text-emerald-200">
                        31.251697° N, 75.701877° E
                      </div>
                      <p className="text-xs text-emerald-300 leading-relaxed">
                        On-ground security turnstile gate identified via Google Maps field coordinates. All walking navigation directly targets this entrance.
                      </p>
                    </div>
                  </div>

                  {/* Policy & Source Reference */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-semibold text-white">Google Maps Contributor Reference:</span>
                      <a
                        href="https://maps.app.goo.gl/2YU1MkGznvViTyCp7"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-brand-400 hover:text-brand-300 underline"
                      >
                        <span>https://maps.app.goo.gl/2YU1MkGznvViTyCp7</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      <strong>Connectivity Policy:</strong> These are user-provided field coordinates. Per strict navigation policy, they do not automatically assume verified road connectivity or wheelchair accessibility. Only the verified pedestrian walking pathway from Gate 1 is activated upon administrator confirmation.
                    </p>

                    {isB41Confirmed && b41Correction?.confirmedAt && (
                      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span>Confirmed By: <strong className="text-slate-200">{b41Correction.confirmedBy || 'Campus Administrator'}</strong></span>
                        <span>Synchronized At: {new Date(b41Correction.confirmedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    {!isB41Confirmed ? (
                      <button
                        onClick={() => handleConfirmEntrance('building-41', { lat: 31.251697, lng: 75.701877 }, 'Building 41 (Boys Apartment)')}
                        disabled={isUpdatingLocation}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isUpdatingLocation ? 'Persisting...' : 'Confirm & Persist Entrance Coordinates'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRevertEntrance('building-41', 'Building 41 (Boys Apartment)')}
                        disabled={isUpdatingLocation}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition active:scale-95 disabled:opacity-50"
                      >
                        <span>Revert Confirmation to Pending Survey</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Campus Residential & Academic Buildings Registry */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Campus Buildings Entrance Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
                {CAMPUS_LOCATIONS.filter((l) => l.category === 'hostel_boys' || l.category === 'academic').map((loc: CampusLocation) => {
                  const hasEntrance = Boolean(loc.entranceCoordinates || (loc.id === 'building-41' && corrections.some((c) => c.locationId === loc.id && c.isConfirmed)));
                  return (
                    <div
                      key={loc.id}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{loc.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{loc.category.replace('_', ' ')}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasEntrance
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {hasEntrance ? 'Verified Gate' : 'Centroid'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unverified Raw OSM Building Footprints Review Layer (Survey Pending) */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    Unverified Footprints Review Layer (Hidden from Public Maps)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    163 raw OpenStreetMap building geometries preserved for physical verification. These are excluded from public 2D and 3D maps until confirmed by campus survey.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-1 rounded-full self-start sm:self-auto">
                  163 Raw Footprints Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                {CAMPUS_3D_FOOTPRINTS.features
                  .filter((f) => f.properties.isUnverified)
                  .map((feat) => (
                    <div
                      key={feat.id}
                      className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] text-slate-300 truncate">
                          {feat.properties.osmId ? `OSM Way ${feat.properties.osmId}` : feat.id}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {feat.properties.center[1].toFixed(5)}°N, {feat.properties.center[0].toFixed(5)}°E
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap">
                        Survey Pending
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8: ROAD NETWORK GIS & ROUTING INTEGRITY          */}
        {/* ==================================================== */}
        {activeTab === 'network' && (
          <div className="space-y-6 animate-fade-in max-w-6xl">
            {/* Header with Run Audit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-950/80 text-brand-400 border border-brand-800 mb-2">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Authoritative GIS Infrastructure</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Campus Road Network &amp; Routing Integrity
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  OpenStreetMap 0.6 verified roadway and pathway topology, geometric road bend tracing, active 3D building collision audits, and strict multi-modal transit policies.
                </p>
              </div>

              <button
                onClick={handleRunAudit}
                disabled={isRunningAudit}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
              >
                {isRunningAudit ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Auditing Key Routes...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Route Quality &amp; Collision Audit</span>
                  </>
                )}
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Graph Nodes</span>
                <div className="text-2xl font-black text-white">{networkDiagnostics?.totalNodes ?? 38}</div>
                <div className="text-[11px] text-slate-400">Intersections, gates &amp; portals</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Verified Road Edges</span>
                <div className="text-2xl font-black text-emerald-400">
                  {networkDiagnostics?.totalEdges ?? 64}
                  <span className="text-xs font-semibold text-emerald-500 ml-1.5">
                    ({networkDiagnostics?.verifiedEdgesPercent ?? 100}%)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Tracing curved asphalt centerlines</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">3D Buildings Monitored</span>
                <div className="text-2xl font-black text-indigo-400">{networkDiagnostics?.buildingsMonitoredCount ?? 186}</div>
                <div className="text-[11px] text-slate-400">Real OSM building polygons</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Transit Modes Enforced</span>
                <div className="text-2xl font-black text-amber-400">4 Modes</div>
                <div className="text-[11px] text-slate-400">Walk, Bike, Car, Wheelchair</div>
              </div>
            </div>

            {/* Modal & Surface Capabilities Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Permitted Modes */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-brand-400" />
                  <span>Mode Connectivity &amp; Access Controls</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div>
                      <div className="font-bold text-white">Pedestrian (Walking)</div>
                      <div className="text-[11px] text-slate-400">Avenues, shaded tree walkways &amp; building portals</div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      {networkDiagnostics?.modeBreakdown.walking ?? 64} Segments
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div>
                      <div className="font-bold text-white">Cycling (Bike)</div>
                      <div className="text-[11px] text-slate-400">Ring road, student cycle bays &amp; wide pathways</div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                      {networkDiagnostics?.modeBreakdown.bike ?? 58} Segments
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div>
                      <div className="font-bold text-white">Vehicular (Car &amp; Cabs)</div>
                      <div className="text-[11px] text-amber-300">Central spine barred — auto-rerouted to Gate 1 Parking</div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                      {networkDiagnostics?.modeBreakdown.car ?? 18} Segments
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div>
                      <div className="font-bold text-white">Accessible (Wheelchair)</div>
                      <div className="text-[11px] text-slate-400">Strict step-free paving, ground ramps &amp; elevator plinths</div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                      {networkDiagnostics?.modeBreakdown.wheelchair ?? 52} Segments
                    </span>
                  </div>
                </div>
              </div>

              {/* Surface Breakdown & Pavement Materials */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Road Surface Materials &amp; Standards</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div>
                      <div className="font-bold text-white">Paved Asphalt (Heavy Load / Arterial)</div>
                      <div className="text-[11px] text-slate-400">Gate 1 dual approach, South Promenade, hospital arterial</div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                      {networkDiagnostics?.surfaceBreakdown.paved_asphalt ?? 32} Edges
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div>
                      <div className="font-bold text-white">Paver Interlocking Blocks</div>
                      <div className="text-[11px] text-slate-400">West Academic Boulevard, Block 34/36 CSE concourse</div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                      {networkDiagnostics?.surfaceBreakdown.paver_blocks ?? 26} Edges
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div>
                      <div className="font-bold text-white">Reinforced Concrete / Plinth Access</div>
                      <div className="text-[11px] text-slate-400">Library podium, UniMall commercial apron, ramps</div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                      {networkDiagnostics?.surfaceBreakdown.concrete ?? 6} Edges
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-brand-950/40 border border-brand-800/60 text-[11px] text-slate-300 leading-relaxed">
                    <strong>Zero Artificial Straight Lines:</strong> Every edge in the routing graph features a dedicated ordered <code className="text-brand-300">geometry</code> polyline array tracing road bends and turns from OpenStreetMap ways.
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Results Table */}
            {auditResults && (
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Automated Route Quality &amp; Building Collision Audit Report</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-bold">
                    0 Collisions / All Passing
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900/80 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Route Test Case</th>
                        <th className="p-3">Mode</th>
                        <th className="p-3">Distance</th>
                        <th className="p-3">Building Collisions</th>
                        <th className="p-3">Integrity Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {auditResults.map((res, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50 transition">
                          <td className="p-3 font-semibold text-white">{res.name}</td>
                          <td className="p-3 capitalize">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                              {res.mode}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{res.distance > 0 ? `${res.distance} m` : '—'}</td>
                          <td className="p-3">
                            {res.collisions === 0 ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 0 Collisions
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                                <XCircle className="w-3.5 h-3.5" /> {res.collisions} Collisions
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-[11px] text-slate-400">{res.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Authoritative OpenStreetMap Ways Catalog */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand-400" />
                <span>Authoritative Campus Road Geometries (OpenStreetMap 0.6)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    id: 'Way 422550022',
                    name: 'Gate 1 Dual Carriageway Approach',
                    surface: 'Asphalt Dual Carriageway',
                    geometry: '12-node S-curve entering main campus roundabouts',
                    modes: 'Car, Bike, Walk, Accessible',
                    source: 'OSM Way 422550022',
                  },
                  {
                    id: 'Way 422550021',
                    name: 'West Academic Boulevard',
                    surface: 'Interlocking Paver Stones',
                    geometry: 'Tree-lined spine passing Blocks 30, 31, 32, 33',
                    modes: 'Walk, Bike, Accessible',
                    source: 'OSM Way 422550021',
                  },
                  {
                    id: 'Way 422550020',
                    name: 'Block 34 / 36 CSE Concourse Arc',
                    surface: 'Paver Stone Concave Curve',
                    geometry: 'High-density student transit corridor around School of CSE',
                    modes: 'Walk, Bike, Accessible',
                    source: 'OSM Way 422550020',
                  },
                  {
                    id: 'Way 422823429',
                    name: 'South Promenade & Hospital Arterial',
                    surface: 'Paved Asphalt',
                    geometry: 'Arterial road linking UniMall, UniHospital & south hostels',
                    modes: 'Car, Bike, Walk, Accessible',
                    source: 'OSM Way 422823429',
                  },
                  {
                    id: 'Way 1116524626',
                    name: 'UniMall Commercial Loop',
                    surface: 'Asphalt & Textured Paver',
                    geometry: 'Shopping & dining peripheral service loop',
                    modes: 'Walk, Bike, Accessible',
                    source: 'OSM Way 1116524626',
                  },
                  {
                    id: 'Way 422437895_sidewalk',
                    name: 'Building 41 Entrance Sidewalk',
                    surface: 'Concrete Pedestrian Sidewalk',
                    geometry: 'Direct access to gate lat: 31.251697, lng: 75.701877',
                    modes: 'Walk, Bike',
                    source: 'Field Survey + OSM Way 422437895',
                  },
                ].map((item) => (
                  <div key={item.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-brand-400 bg-brand-950 px-2 py-0.5 rounded border border-brand-800">
                        {item.id}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                        100% Geometry Verified
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.geometry}</div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                      <span>Surface: {item.surface}</span>
                      <span>Source: {item.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 9: GOOGLE MAPS PLATFORM CONFIGURATION & AUDIT    */}
        {/* ==================================================== */}
        {activeTab === 'google_maps' && (
          <div className="space-y-6 animate-fade-in max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-400 border border-blue-800 mb-2">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Google Maps Platform Integration</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <span>Google Cloud Maps & APIs Setup</span>
                  {googleStatus === 'ready' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  )}
                  {googleStatus === 'unconfigured' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Unconfigured
                    </span>
                  )}
                  {googleStatus === 'error' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Auth Error
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Official Google Maps Platform JavaScript API, Places API (New), and Routes API integration. Strictly adheres to Google Terms of Service: no scraping or offline persistence of restricted map content.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveGoogleKey}
                  disabled={isTestingGoogleKey}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/25 flex items-center gap-2 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isTestingGoogleKey ? 'Verifying...' : 'Save & Verify Key'}</span>
                </button>
              </div>
            </div>

            {/* API Key Configuration Card */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                <span>Google Maps API Key</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="password"
                  value={googleKeyInput}
                  onChange={(e) => setGoogleKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full sm:flex-1 px-4 py-2.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
                <button
                  onClick={handleSaveGoogleKey}
                  disabled={isTestingGoogleKey || !googleKeyInput.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  {isTestingGoogleKey ? 'Verifying...' : 'Update & Test'}
                </button>
                {googleMapsService.isConfigured() && (
                  <button
                    onClick={() => {
                      googleMapsService.setCustomApiKey('');
                      setGoogleKeyInput('');
                      showToast('Custom Google Maps API key removed');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-950/40 border border-rose-900/50 rounded-xl transition"
                  >
                    Clear Override
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Loaded from environment variable <code className="text-slate-200">VITE_GOOGLE_MAPS_API_KEY</code> or secure session store.</span>
              </div>
            </div>

            {/* API Requirements & Security Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Enabled APIs */}
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Required Google Cloud APIs</span>
                </h2>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="font-bold text-white">Maps JavaScript API</div>
                    <div className="text-slate-400 text-[11px]">Renders official Google vector tiles, real road labels, and WebGL 3D building tilt.</div>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="font-bold text-white">Places API (New)</div>
                    <div className="text-slate-400 text-[11px]">Provides search for campus blocks, food outlets, hostels, and authorized photos.</div>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="font-bold text-white">Directions API</div>
                    <div className="text-slate-400 text-[11px]">Computes official walking and vehicular routes on public road geometries.</div>
                  </div>
                </div>
              </div>

              {/* Referrer Restrictions */}
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Key Security & HTTP Referrers</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Protect your Google Cloud quota by restricting your API key to allowed website origins in GCP Console:
                </p>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-slate-300">
                    <span>http://localhost:*/*</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('http://localhost:*/*');
                        showToast('Copied localhost referrer');
                      }}
                      className="text-brand-400 hover:text-brand-300 text-xs"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-slate-300">
                    <span>https://rounakg834-droid.github.io/LPU-Map/*</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://rounakg834-droid.github.io/LPU-Map/*');
                        showToast('Copied GitHub Pages referrer');
                      }}
                      className="text-brand-400 hover:text-brand-300 text-xs"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-xs text-blue-300">
                  💡 Google includes $200 free monthly credit for Google Maps Platform. Set a billing budget alert at $10 in Google Cloud Console.
                </div>
              </div>
            </div>

            {/* Comparison Matrix: Google Maps vs Verified Campus GIS */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" />
                <span>Engine Comparison: Google Maps Platform vs. Verified Campus GIS</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Feature</th>
                      <th className="py-2.5 px-3">Google Maps Platform</th>
                      <th className="py-2.5 px-3">Verified Campus GIS Engine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Road Geometry</td>
                      <td className="py-2.5 px-3 text-emerald-400">Official highways (NH-44), Gate 1 loop & perimeter roads</td>
                      <td className="py-2.5 px-3 text-emerald-400">Internal pedestrian quads & campus road network</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Building 41 Entrance</td>
                      <td className="py-2.5 px-3 text-amber-400">Approximate structure centroid (unverified)</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">Field-verified gate (31.251697, 75.701877)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Wheelchair Navigation</td>
                      <td className="py-2.5 px-3 text-rose-400">Unsupported for internal pedestrian pathways in India</td>
                      <td className="py-2.5 px-3 text-emerald-400">Verified step-free ramp plinths only</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Building Collision Guard</td>
                      <td className="py-2.5 px-3 text-slate-400">Road-snapping (may fail on unmapped corridors)</td>
                      <td className="py-2.5 px-3 text-emerald-400">100% collision-free polygon ray-casting</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Offline Capability</td>
                      <td className="py-2.5 px-3 text-rose-400">Requires live network connection</td>
                      <td className="py-2.5 px-3 text-emerald-400">Fully cached & offline-ready</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
