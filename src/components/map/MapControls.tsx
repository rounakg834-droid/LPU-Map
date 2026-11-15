import React from 'react';
import { Plus, Minus, Navigation, Map, Sparkles, Shield, Share2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { CompassHeading } from '../common/CompassHeading';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenterGps: () => void;
  onRecenterCampus: () => void;
  onResetNorth: () => void;
  onRequestOrientationPermission: () => void;
  isFollowing: boolean;
  hasGpsFix: boolean;
  heading: number | null;
  isPlaceDetailsOpen?: boolean;
  onOpenEventsModal?: () => void;
  onOpenAdminModal?: () => void;
  onOpenShareModal?: () => void;
  onOpenEmergencyModal?: () => void;
  onOpenReportClosureModal?: () => void;
  liveEventsCount?: number;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenterGps,
  onRecenterCampus,
  onResetNorth,
  onRequestOrientationPermission,
  isFollowing,
  hasGpsFix,
  heading,
  isPlaceDetailsOpen = false,
  onOpenEventsModal,
  onOpenAdminModal,
  onOpenShareModal,
  onOpenEmergencyModal,
  onOpenReportClosureModal,
  liveEventsCount = 0,
}) => {
  return (
    <>
      {/* 1. Apple Maps-Inspired Top Utility Capsule (Events, SOS, Share, Obstacle, Admin) */}
      <div className="fixed top-28 right-3 sm:right-6 z-20 pointer-events-auto flex items-center gap-1.5 animate-in fade-in duration-300">
        <div className="inline-flex items-center p-1 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-full border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          {/* Emergency Assistance SOS */}
          {onOpenEmergencyModal && (
            <button
              onClick={onOpenEmergencyModal}
              aria-label="Emergency SOS"
              title="Campus Emergency Assistance & SOS"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span className="font-bold tracking-tight">SOS</span>
            </button>
          )}

          {/* Campus Events */}
          {onOpenEventsModal && (
            <button
              onClick={onOpenEventsModal}
              aria-label="Campus Events"
              title="Campus Events & Fests"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Events</span>
              {liveEventsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                  {liveEventsCount}
                </span>
              )}
            </button>
          )}

          {/* Share Live Location */}
          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              aria-label="Share Location"
              title="Share Live Location via WhatsApp"
              className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Report Path Obstacle */}
          {onOpenReportClosureModal && (
            <button
              onClick={onOpenReportClosureModal}
              aria-label="Report Path Obstacle"
              title="Report Closed or Blocked Campus Path"
              className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 active:scale-95 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Admin Dashboard */}
          {onOpenAdminModal && (
            <button
              onClick={onOpenAdminModal}
              aria-label="Admin Console"
              title="Admin Moderation Console"
              className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 active:scale-95 transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Apple Maps Unified Vertical Navigation Capsule (Compass, GPS, Campus, Zoom) */}
      <div
        className={`fixed right-3 sm:right-6 z-30 pointer-events-auto transition-all duration-300 ease-out ${
          isPlaceDetailsOpen
            ? 'bottom-[calc(32dvh+14px)] md:bottom-8'
            : 'bottom-20 md:bottom-8'
        }`}
      >
        <div className="w-10 sm:w-11 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col items-center overflow-hidden py-1">
          {/* Compass */}
          <CompassHeading
            heading={heading}
            onResetNorth={onResetNorth}
            onRequestPermission={onRequestOrientationPermission}
            className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-95 transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/60 focus:outline-none"
          />

          <div className="w-6 h-px bg-black/[0.05] dark:bg-white/[0.08] my-0.5" />

          {/* Recenter GPS Location (Apple Maps Navigation Arrow) */}
          <button
            onClick={onRecenterGps}
            aria-label="My Location"
            title={
              isFollowing
                ? 'Following your location'
                : hasGpsFix
                ? 'Center on your location'
                : 'Acquire GPS location'
            }
            className="relative w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-95 transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/60 focus:outline-none"
          >
            <Navigation
              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
                isFollowing
                  ? 'fill-[#007AFF] text-[#007AFF]'
                  : hasGpsFix
                  ? 'text-[#007AFF]'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            />
            {isFollowing && (
              <span className="absolute w-1.5 h-1.5 rounded-full bg-[#007AFF] bottom-1" />
            )}
          </button>

          <div className="w-6 h-px bg-black/[0.05] dark:bg-white/[0.08] my-0.5" />

          {/* Recenter Campus Overview */}
          <button
            onClick={onRecenterCampus}
            aria-label="Overview of LPU Campus"
            title="Overview of LPU Campus"
            className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-900 active:scale-95 transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/60 focus:outline-none"
          >
            <Map className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-600 dark:text-slate-400" />
          </button>

          <div className="w-6 h-px bg-black/[0.05] dark:bg-white/[0.08] my-0.5" />

          {/* Zoom In */}
          <button
            onClick={onZoomIn}
            aria-label="Zoom in"
            title="Zoom in"
            className="w-10 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-900 active:scale-95 transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/60 focus:outline-none"
          >
            <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>

          <div className="w-6 h-px bg-black/[0.05] dark:bg-white/[0.08] my-0.5" />

          {/* Zoom Out */}
          <button
            onClick={onZoomOut}
            aria-label="Zoom out"
            title="Zoom out"
            className="w-10 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-900 active:scale-95 transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/60 focus:outline-none"
          >
            <Minus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </>
  );
};
