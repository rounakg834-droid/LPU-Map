import React, { useEffect, useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Bookmark,
  Radio,
  AlertTriangle,
  PhoneCall,
  Shield,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Lock,
  Layers,
  Box,
  Globe
} from 'lucide-react';
import { authService } from '../../services/authService';
import { StudentAuthProfile } from '../../types/events';

interface NavigationMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
  onOpenEvents: () => void;
  onOpenSaved: () => void;
  onOpenShareLocation: () => void;
  onOpenEmergency: () => void;
  onOpenReportClosure: () => void;
  savedCount: number;
  isSharingActive: boolean;
  mapMode?: '2d' | '3d' | 'google';
  onToggleMapMode?: (mode: '2d' | '3d' | 'google') => void;
  onOpenGoogleConfig?: () => void;
}

export const NavigationMenuDrawer: React.FC<NavigationMenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateHome,
  onNavigateAdmin,
  onOpenEvents,
  onOpenSaved,
  onOpenShareLocation,
  onOpenEmergency,
  onOpenReportClosure,
  savedCount,
  isSharingActive,
  mapMode = '2d',
  onToggleMapMode,
  onOpenGoogleConfig,
}) => {
  const [currentUser, setCurrentUser] = useState<StudentAuthProfile | null>(
    authService.getCurrentUser()
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(authService.isAdmin());

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsAdmin(Boolean(user?.isAdmin));
    });
    return () => unsubscribe();
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAdminLogout = async () => {
    await authService.signOut();
    setIsAdmin(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col justify-between transform transition-transform ease-out duration-300 animate-in slide-in-from-left">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg shadow-inner">
                  LPU
                </div>
                <div>
                  <h2 className="text-base font-bold leading-tight">Campus Navigator</h2>
                  <p className="text-xs text-brand-100 font-medium">Lovely Professional University</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-brand-100 hover:text-white hover:bg-white/10 transition"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User or Admin Status Pill in Header */}
            {isAdmin ? (
              <div className="mt-3.5 p-2.5 rounded-xl bg-amber-500/20 border border-amber-300/30 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-amber-200">Authorized Administrator</p>
                    <p className="text-[11px] text-amber-100/80 truncate">
                      {currentUser?.email || currentUser?.fullName || 'Campus Security & DSW'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAdminLogout}
                  title="Sign out of Admin"
                  className="p-1 text-amber-200 hover:text-white hover:bg-white/10 rounded"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : currentUser ? (
              <div className="mt-3.5 p-2 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">{currentUser.fullName}</p>
                  <p className="text-[10px] text-brand-100/80 truncate">{currentUser.course} • Year {currentUser.yearOfStudy}</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Navigation Items List */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
            
            {/* Campus Map Link */}
            <button
              onClick={() => {
                onNavigateHome();
                if (onToggleMapMode && mapMode !== '2d') onToggleMapMode('2d');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left font-medium text-sm transition ${
                mapMode === '2d' ? 'bg-blue-50/80 text-blue-900' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${mapMode === '2d' ? 'bg-blue-600 text-white shadow-sm' : 'bg-brand-50 text-brand-600'}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-800 font-semibold">2D Navigation Map</span>
                    {mapMode === '2d' && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-100 text-blue-700 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Optimal for turn-by-turn routing</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* 3D Campus Explorer Mode */}
            <button
              onClick={() => {
                onNavigateHome();
                if (onToggleMapMode) onToggleMapMode('3d');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left font-medium text-sm transition ${
                mapMode === '3d' ? 'bg-indigo-50/80 text-indigo-900' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${mapMode === '3d' ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-800 font-semibold">3D Campus Explore</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded-full">
                      3D
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Building extrusions, pitch & tilt</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Google Maps Platform Mode */}
            <button
              onClick={() => {
                onNavigateHome();
                if (onToggleMapMode) onToggleMapMode('google');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left font-medium text-sm transition ${
                mapMode === 'google' ? 'bg-blue-50/90 text-blue-900' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${mapMode === 'google' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-600'}`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-800 font-semibold">Google Maps Engine</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-100 text-blue-800 rounded-full">
                      NEW
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Official Google roads & Places</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Live Campus Events */}
            <button
              onClick={() => {
                onOpenEvents();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-slate-700 hover:bg-slate-100 font-medium text-sm transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-800 font-semibold">Campus Events</span>
                  <p className="text-[11px] text-slate-400">Live student activities & fests</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Saved Bookmarks */}
            <button
              onClick={() => {
                onOpenSaved();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-slate-700 hover:bg-slate-100 font-medium text-sm transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-800 font-semibold">Saved Places</span>
                    {savedCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded-full font-bold">
                        {savedCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Your bookmarked buildings</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* WhatsApp Live Location Sharing */}
            <button
              onClick={() => {
                onOpenShareLocation();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-slate-700 hover:bg-slate-100 font-medium text-sm transition"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isSharingActive ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-800 font-semibold">Share Location</span>
                    {isSharingActive && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500 text-white rounded-full font-bold animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Temporary WhatsApp link</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Report Road Closure / Obstacle */}
            <button
              onClick={() => {
                onOpenReportClosure();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-slate-700 hover:bg-slate-100 font-medium text-sm transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-800 font-semibold">Report Obstacle</span>
                  <p className="text-[11px] text-slate-400">Report blocked pathway or road</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Emergency SOS */}
            <button
              onClick={() => {
                onOpenEmergency();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-slate-700 hover:bg-red-50 font-medium text-sm transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-200">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-red-700 font-bold">Emergency SOS</span>
                  <p className="text-[11px] text-red-500">UniHospital & Security helplines</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </button>

            <div className="pt-2 pb-1">
              <div className="border-t border-slate-200" />
            </div>

            {/* University Administration Section */}
            <div className="px-2 pt-1 pb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Campus Administration
              </p>
            </div>

            {/* Dedicated /admin route item */}
            <button
              onClick={() => {
                onNavigateAdmin();
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left font-medium text-sm transition ${
                isAdmin
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-900 hover:bg-amber-500/20'
                  : 'bg-slate-50 border border-slate-200/60 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    isAdmin ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900">Admin Dashboard</span>
                    {isAdmin ? (
                      <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-white rounded font-bold uppercase">
                        Admin
                      </span>
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isAdmin ? 'Manage events, reports & closures' : 'Dedicated /admin route portal'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Google Maps Platform Setup */}
            <button
              onClick={() => {
                if (onOpenGoogleConfig) onOpenGoogleConfig();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left bg-slate-50 border border-slate-200/60 text-slate-700 hover:bg-slate-100 font-medium text-sm transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900">Google Maps Platform</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    API key, referrers & live cloud settings
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Footer with App Info & Offline status */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-center">
            <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">LPU Smart Campus Navigator</span>
              <span>v2.1</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Phagwara, Punjab • Strict GIS Routing
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};