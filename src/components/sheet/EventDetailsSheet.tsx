import React, { useState, useRef } from 'react';
import {
  X,
  Navigation,
  Share2,
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  User,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { PublicCampusEvent, EVENT_CATEGORIES } from '../../types/events';
import { Coordinates } from '../../types/location';
import { NavigationMode, RoutePlan } from '../../types/navigation';
import { ModeSelector } from '../navigation/ModeSelector';
import { authService } from '../../services/authService';
import { eventService } from '../../services/eventService';
import { CAMPUS_LOCATIONS } from '../../data/locations';

interface EventDetailsSheetProps {
  event: PublicCampusEvent;
  onClose: () => void;
  userCoords: Coordinates | null;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onStartNavigation?: (plan: RoutePlan) => void;
  onRequestGps?: () => void;
  onOpenReportModal: (event: PublicCampusEvent) => void;
}

export const EventDetailsSheet: React.FC<EventDetailsSheetProps> = ({
  event,
  onClose,
  userCoords,
  onShowToast,
  onStartNavigation,
  onRequestGps,
  onOpenReportModal,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showDirections, setShowDirections] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<NavigationMode>('walking');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);

  const currentUser = authService.getCurrentUser();
  const isAuthor = currentUser?.uid === event.creatorUid;
  const isAdmin = authService.isAdmin();
  const canManage = isAuthor || isAdmin;

  const catMeta = EVENT_CATEGORIES.find((c) => c.id === event.category) || EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];

  // Resolve matching campus location from directory for navigation
  const targetLocation =
    CAMPUS_LOCATIONS.find((l) => l.id === event.locationId) || {
      id: event.locationId || 'event-loc',
      name: event.locationName,
      shortName: event.locationName,
      category: 'auditorium_events' as const,
      coordinates: event.coordinates,
      verificationStatus: 'verified_osm' as const,
      isVerified: true,
      description: event.description,
      source: 'Campus Event Node',
      tags: ['event'],
    };

  // Format dates in Asia/Kolkata (IST)
  const formatTimeIST = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const formatDateIST = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const handleShare = async () => {
    const text = `Join ${event.title} at ${event.locationName} (${formatTimeIST(event.startTime)} - ${formatTimeIST(event.endTime)} IST) on LPU Navigator!`;
    const shareData = {
      title: `${event.title} - LPU Campus Navigator`,
      text,
      url: window.location.href,
    };

    if (navigator.share && typeof navigator.canShare === 'function' && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        onShowToast('Event shared successfully', 'success');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyLink();
        }
      }
    } else {
      copyLink();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}?event=${event.id}`).then(
      () => onShowToast('Event link copied to clipboard', 'success'),
      () => onShowToast('Failed to copy link', 'warning')
    );
  };

  const handleCancelEvent = async () => {
    if (!window.confirm('Are you sure you want to cancel this event?')) return;
    setIsCancelling(true);
    try {
      await eventService.cancelEvent(event.id, event.creatorUid);
      onShowToast('Event cancelled successfully', 'info');
      onClose();
    } catch (err) {
      onShowToast((err as Error).message || 'Failed to cancel event', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const isLive = event.status === 'live';

  return (
    <div
      className={`fixed z-40 bg-white transition-all duration-300 ease-out flex flex-col shadow-2xl border-slate-200/90
        /* Mobile: Responsive bottom sheet */
        inset-x-0 bottom-0 rounded-t-3xl border-t
        ${isExpanded ? 'h-[78dvh] max-h-[82dvh]' : 'h-[32dvh] min-h-[240px] max-h-[36dvh]'}
        /* Desktop: Compact 380px floating side panel */
        md:top-20 md:left-5 md:bottom-auto md:inset-x-auto md:w-[380px] md:h-auto md:max-h-[calc(100dvh-6.5rem)] md:rounded-3xl md:border
      `}
    >
      {/* Draggable Drag Handle (Mobile touch bar) */}
      <div
        onTouchStart={(e) => {
          touchStartY.current = e.touches[0].clientY;
          touchCurrentY.current = e.touches[0].clientY;
        }}
        onTouchMove={(e) => {
          touchCurrentY.current = e.touches[0].clientY;
        }}
        onTouchEnd={() => {
          const deltaY = touchCurrentY.current - touchStartY.current;
          if (deltaY < -45) setIsExpanded(true);
          else if (deltaY > 45) {
            if (isExpanded) setIsExpanded(false);
            else onClose();
          }
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full pt-2.5 pb-1.5 cursor-pointer flex flex-col items-center justify-center select-none active:opacity-70 md:hidden"
      >
        <div className="w-10 h-1 bg-slate-300 rounded-full" />
      </div>

      {/* Event Header */}
      <div className="px-4 py-2 sm:px-5 flex items-start justify-between gap-2.5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Category Icon Badge */}
          <div
            className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0 shadow-md relative"
            style={{ backgroundColor: catMeta.color }}
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-[8px] font-bold tracking-tight uppercase leading-none mt-0.5 text-white/90">
              {event.category}
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {isLive ? (
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                  LIVE NOW
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                  UPCOMING EVENT
                </span>
              )}
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                style={{ backgroundColor: catMeta.bgColor, color: catMeta.color }}
              >
                {catMeta.label}
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
              {event.title}
            </h2>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
              <MapPin className="w-3 h-3 text-brand-600 flex-shrink-0" />
              <span className="font-medium text-slate-700">{event.locationName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0 -mr-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition md:hidden"
            aria-label={isExpanded ? 'Collapse sheet' : 'Expand sheet'}
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition active:scale-95"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Action Bar (Directions, Share, Report, Cancel) */}
      <div className="px-4 py-2.5 sm:px-5 flex items-center gap-2 overflow-x-auto border-b border-slate-100 no-scrollbar flex-shrink-0">
        <button
          onClick={() => {
            setShowDirections(!showDirections);
            setIsExpanded(true);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition active:scale-95 whitespace-nowrap shadow-sm ${
            showDirections
              ? 'bg-brand-600 text-white ring-2 ring-brand-500/30'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 fill-white" />
          <span>Directions</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition active:scale-95 whitespace-nowrap"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        <button
          onClick={() => onOpenReportModal(event)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition active:scale-95 whitespace-nowrap"
          title="Report fake or inappropriate event"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" />
          <span>Report</span>
        </button>

        {canManage && (
          <button
            onClick={handleCancelEvent}
            disabled={isCancelling}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition active:scale-95 whitespace-nowrap ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isCancelling ? 'Cancelling...' : 'Cancel Event'}</span>
          </button>
        )}
      </div>

      {/* Expandable Event Body */}
      <div
        className={`flex-1 overflow-y-auto px-4 py-3 sm:px-5 space-y-3.5 pb-safe-bottom ${
          isExpanded ? 'block' : 'hidden md:block'
        }`}
      >
        {/* Event Photograph Banner (if provided) */}
        {event.imageUrl && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-48">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-44 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Schedule Card (Asia/Kolkata IST) */}
        <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              {formatDateIST(event.startTime)}
            </span>
            <span className="font-semibold text-brand-700 bg-white border border-brand-200/60 px-2 py-0.5 rounded-md text-[11px]">
              Asia/Kolkata (IST)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-200/60">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              {formatTimeIST(event.startTime)} – {formatTimeIST(event.endTime)}
            </span>
          </div>
        </div>

        {/* Public Author Card (Strict Privacy Rule: Display name ONLY!) */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Added By</span>
              <span className="font-semibold text-slate-800">{event.creatorName}</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
            Student Verified
          </span>
        </div>

        {/* Directions / Navigation Mode Selector Drawer */}
        {showDirections && (
          <ModeSelector
            currentMode={currentMode}
            onSelectMode={(mode) => setCurrentMode(mode)}
            destination={targetLocation}
            userCoords={userCoords}
            onStartNavigation={(plan) => {
              if (onStartNavigation) {
                onStartNavigation(plan);
              }
            }}
            onRequestGps={() => {
              if (onRequestGps) {
                onRequestGps();
              }
            }}
          />
        )}

        {/* Event Description */}
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Event Description
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </div>

        {/* Campus Location Card */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            Venue Coordinates
          </span>
          <p className="text-slate-600 text-[11px]">
            {event.locationName} ({event.coordinates.lat.toFixed(5)}, {event.coordinates.lng.toFixed(5)})
          </p>
        </div>
      </div>
    </div>
  );
};
