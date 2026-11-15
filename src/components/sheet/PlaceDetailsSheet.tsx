import React, { useState, useRef } from 'react';
import {
  X,
  Navigation,
  Bookmark,
  Share2,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Building2,
  Camera,
  BookOpen,
  Layers,
  CheckCircle2,
  Compass,
  Sparkles,
} from 'lucide-react';
import { CampusLocation, Coordinates } from '../../types/location';
import { NavigationMode } from '../../types/navigation';
import { VerificationBadge } from './VerificationBadge';
import { ModeSelector } from '../navigation/ModeSelector';

interface PlaceDetailsSheetProps {
  location: CampusLocation;
  isSaved: boolean;
  onToggleSave: (locationId: string) => void;
  onClose: () => void;
  userCoords: Coordinates | null;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onStartNavigation?: (plan: import('../../types/navigation').RoutePlan) => void;
  onRequestGps?: () => void;
  onAddEvent?: (locationId: string) => void;
  preferEngine?: 'campus' | 'google';
}

export const PlaceDetailsSheet: React.FC<PlaceDetailsSheetProps> = ({
  location,
  isSaved,
  onToggleSave,
  onClose,
  userCoords,
  onShowToast,
  onStartNavigation,
  onRequestGps,
  onAddEvent,
  preferEngine = 'campus',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showDirections, setShowDirections] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<NavigationMode>('walking');
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  // Touch gesture tracking for mobile swipe up/down
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaY = touchCurrentY.current - touchStartY.current;
    // Swiped upward by > 45px -> Expand
    if (deltaY < -45) {
      setIsExpanded(true);
    }
    // Swiped downward by > 45px
    else if (deltaY > 45) {
      if (isExpanded) {
        setIsExpanded(false);
      } else {
        onClose(); // Swiped down from peek -> dismiss
      }
    }
  };

  const handleShare = async () => {
    const coordsText = location.coordinates
      ? `${location.coordinates.lat.toFixed(5)}, ${location.coordinates.lng.toFixed(5)}`
      : 'Coordinates pending survey';

    const shareData = {
      title: `${location.name} - LPU Navigator`,
      text: `${location.name} at Lovely Professional University. Coordinates: ${coordsText}`,
      url: window.location.href,
    };

    if (navigator.share && typeof navigator.canShare === 'function' && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        onShowToast('Location shared successfully', 'success');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const textToCopy = location.coordinates
      ? `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`
      : `${location.name} - Lovely Professional University`;

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        onShowToast('Location link copied to clipboard', 'success');
      },
      () => {
        onShowToast('Failed to copy to clipboard', 'warning');
      }
    );
  };

  const copyCoordinates = () => {
    if (!location.coordinates) return;
    const coordStr = `${location.coordinates.lat.toFixed(6)}, ${location.coordinates.lng.toFixed(6)}`;
    navigator.clipboard.writeText(coordStr).then(() => {
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
      onShowToast(`GPS Coordinates copied: ${coordStr}`, 'info');
    });
  };

  return (
    <div
      className={`fixed z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl transition-all duration-300 ease-out flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.12)] border-black/[0.06] dark:border-white/[0.08]
        /* Mobile: Responsive bottom sheet */
        inset-x-0 bottom-0 rounded-t-3xl border-t
        ${isExpanded ? 'h-[78dvh] max-h-[82dvh]' : 'h-[30dvh] min-h-[220px] max-h-[34dvh]'}
        /* Desktop: Compact 380px floating side panel on the left */
        md:top-20 md:left-5 md:bottom-auto md:inset-x-auto md:w-[380px] md:h-auto md:max-h-[calc(100dvh-6.5rem)] md:rounded-3xl md:border
      `}
    >
      {/* Draggable Drag Handle (Mobile touch bar with swipe listeners) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full pt-2.5 pb-1.5 cursor-pointer flex flex-col items-center justify-center select-none active:opacity-70 md:hidden"
      >
        <div className="w-9 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
      </div>

      {/* Place Header Card */}
      <div className="px-4 py-2 sm:px-5 flex items-start justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800/80 flex-shrink-0">
        {/* Left: Building Photo Thumbnail or Architectural Badge */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {location.selectedClassroom ? (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 flex flex-col items-center justify-center text-purple-600 flex-shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[9px] font-bold tracking-tight text-purple-800 dark:text-purple-300 leading-none mt-0.5">
                {location.selectedClassroom.roomNumber}
              </span>
            </div>
          ) : location.imageUrl ? (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0 bg-slate-100 shadow-xs">
              <img
                src={location.imageUrl}
                alt={location.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0 shadow-xs">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[9px] font-bold tracking-tight text-slate-700 dark:text-slate-300 leading-none mt-0.5">
                {location.blockNumber || 'LPU'}
              </span>
            </div>
          )}

          {/* Building Title & Verification Pills */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-md">
                {location.category.replace('_', ' ')}
              </span>
              {location.blockNumber && (
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-md">
                  Block {location.blockNumber}
                </span>
              )}
              <VerificationBadge status={location.verificationStatus} />
            </div>

            <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate">
              {location.name}
            </h2>

            <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
              {location.description}
            </p>
          </div>
        </div>

        {/* Right Header Action Controls */}
        <div className="flex items-center gap-1 flex-shrink-0 -mr-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition md:hidden"
            aria-label={isExpanded ? 'Collapse sheet' : 'Expand sheet'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition active:scale-95"
            aria-label="Close place details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Action Bar (Directions, Save, Share, GPS Fix) */}
      <div className="px-4 py-2.5 sm:px-5 flex items-center gap-2 overflow-x-auto border-b border-slate-100 dark:border-slate-800/80 no-scrollbar flex-shrink-0">
        <button
          onClick={() => {
            setShowDirections(!showDirections);
            setIsExpanded(true);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition active:scale-95 whitespace-nowrap shadow-sm ${
            showDirections
              ? 'bg-[#007AFF] text-white shadow-blue-500/25 ring-2 ring-blue-500/30'
              : 'bg-[#007AFF] text-white hover:bg-[#0071E3]'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 fill-white" />
          <span>Directions</span>
        </button>

        <button
          onClick={() => {
            onToggleSave(location.id);
            onShowToast(
              isSaved ? 'Removed from saved places' : 'Saved to your places',
              isSaved ? 'info' : 'success'
            );
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition active:scale-95 whitespace-nowrap ${
            isSaved
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 transition active:scale-95 whitespace-nowrap"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        {onAddEvent && (
          <button
            onClick={() => onAddEvent(location.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100/80 transition active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Add Event</span>
          </button>
        )}

        {location.coordinates && (
          <button
            onClick={copyCoordinates}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 transition active:scale-95 whitespace-nowrap"
            title="Copy coordinates"
          >
            {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <MapPin className="w-3.5 h-3.5" />}
            <span className="text-[11px]">GPS</span>
          </button>
        )}
      </div>

      {/* Expandable Building Information Body */}
      {/* On desktop: always visible and scrollable. On mobile: visible when expanded */}
      <div
        className={`flex-1 overflow-y-auto px-4 py-3 sm:px-5 space-y-3.5 pb-safe-bottom ${
          isExpanded ? 'block' : 'hidden md:block'
        }`}
      >
        {/* Dedicated Pedestrian Entrance Gate Section (Requirement 3: Separate Footprint & Entrance) */}
        {(location.entranceCoordinates || location.proposedEntrance) && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-slate-50 to-blue-50/40 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Pedestrian Entrance Gate
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                location.isEntranceConfirmed
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {location.isEntranceConfirmed ? 'Confirmed by Admin' : 'Field Survey Pending Admin Review'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white rounded-xl border border-slate-200/70 space-y-0.5">
                <span className="text-[10px] text-slate-400 block font-medium">Entrance Gate Target</span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">
                  {location.entranceCoordinates
                    ? `${location.entranceCoordinates.lat.toFixed(6)}, ${location.entranceCoordinates.lng.toFixed(6)}`
                    : location.proposedEntrance
                    ? `${location.proposedEntrance.lat.toFixed(6)}, ${location.proposedEntrance.lng.toFixed(6)}`
                    : 'N/A'}
                </span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200/70 space-y-0.5">
                <span className="text-[10px] text-slate-400 block font-medium">Structure Centroid</span>
                <span className="font-mono font-bold text-slate-600 text-[11px]">
                  {location.coordinates
                    ? `${location.coordinates.lat.toFixed(6)}, ${location.coordinates.lng.toFixed(6)}`
                    : 'Centroid'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Turn-by-turn navigation targets this pedestrian entrance gate. The building structure footprint is maintained as a separate 3D volume.
            </p>

            {location.id === 'building-41' && (
              <a
                href="https://maps.app.goo.gl/2YU1MkGznvViTyCp7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline pt-0.5"
              >
                <span>Verified Google Maps Entrance Pin</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Real Building Image Card or Polished Survey Pending Card */}
        {location.imageUrl ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
            <img
              src={location.imageUrl}
              alt={location.name}
              className="w-full h-44 object-cover"
              loading="lazy"
            />
            {location.imageAttribution && (
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/20">
                <Camera className="w-3 h-3" />
                <span>{location.imageAttribution}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
              <Building2 className="w-5 h-5 text-slate-500" />
              <span className="text-[8px] font-bold text-slate-600 mt-0.5 leading-none">
                {location.blockNumber || 'LPU'}
              </span>
            </div>
            <div className="flex-1 text-[11px] text-slate-500 leading-snug">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-800">
                  {location.shortName || location.name}
                </span>
                <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                  Photo Pending
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Official building photograph pending on-ground physical survey. No unverified stock photos are shown.
              </p>
            </div>
          </div>
        )}

        {/* Selected Classroom Information Card */}
        {location.selectedClassroom && (
          <div className="p-3.5 bg-gradient-to-br from-purple-50/90 via-white to-blue-50/70 rounded-2xl border border-purple-200/80 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                Classroom Finder Details
              </span>
              <span className="text-[10px] font-bold text-purple-800 bg-purple-100/80 border border-purple-200 px-2 py-0.5 rounded-full">
                {location.selectedClassroom.floorName}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2">
                <h4 className="text-base font-bold text-slate-900">
                  Room {location.selectedClassroom.id}
                </h4>
                <span className="text-xs font-semibold text-purple-700">
                  ({location.selectedClassroom.blockName})
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                {location.selectedClassroom.roomTypeName}
              </p>
              {location.selectedClassroom.department && (
                <p className="text-[11px] text-slate-500">
                  {location.selectedClassroom.department}
                </p>
              )}
            </div>

            {/* Indoor Directions Notice */}
            <div className="p-2.5 bg-white/90 rounded-xl border border-purple-100 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Building Entrance: Verified Geographic Node</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700 font-medium text-[11px]">
                <Compass className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Indoor Floor Directions: Ground entrance verified; Level {location.selectedClassroom.floorLevel} corridor map pending indoor LiDAR survey.</span>
              </div>
              <p className="text-slate-600 text-[11px] pt-1.5 border-t border-slate-100 leading-relaxed">
                {location.selectedClassroom.indoorGuideNote}
              </p>
            </div>
          </div>
        )}

        {/* Building Infrastructure & Verified Facilities */}
        {(location.totalFloors || location.hasElevator !== undefined || location.hasRestrooms || location.hasWaterDispenser) && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Building Infrastructure
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {location.totalFloors && (
                <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Floors</span>
                  <span className="font-semibold text-slate-800">{location.totalFloors} Levels (Ground + {location.totalFloors - 1})</span>
                </div>
              )}
              {location.hasElevator !== undefined && (
                <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Elevators / Lifts</span>
                  <span className="font-semibold text-slate-800">{location.hasElevator ? 'Operational' : 'Stairs Only'}</span>
                </div>
              )}
              {location.hasRestrooms !== undefined && (
                <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Restrooms</span>
                  <span className="font-semibold text-slate-800">{location.hasRestrooms ? 'Verified (All Floors)' : 'Pending Survey'}</span>
                </div>
              )}
              {location.hasWaterDispenser !== undefined && (
                <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Drinking Water</span>
                  <span className="font-semibold text-slate-800">{location.hasWaterDispenser ? 'Purified RO Water' : 'Pending Survey'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hosted Departments & Schools */}
        {location.departments && location.departments.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Departments & Schools
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {location.departments.map((dept, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-brand-800 text-[11px] font-semibold border border-blue-200/60"
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Directions / Navigation Mode Selector Drawer */}
        {showDirections && (
          <ModeSelector
            currentMode={currentMode}
            onSelectMode={(mode) => setCurrentMode(mode)}
            destination={location}
            userCoords={userCoords}
            preferEngine={preferEngine}
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

        {/* Factual Description (Strictly from verified directory) */}
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            About this Facility
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {location.description}
          </p>
        </div>

        {/* Verified Features Chips */}
        {location.features && location.features.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Features
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {location.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200/60"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gate Access / Campus Entry */}
        {location.gateAccess && (
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-0.5">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px]">
              <MapPin className="w-3 h-3 text-brand-600" />
              Campus Accessibility & Entry
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {location.gateAccess}
            </p>
          </div>
        )}

        {/* Verified Step-Free Accessibility */}
        {location.accessibilityNotes && (
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/60 text-xs text-emerald-900 space-y-0.5">
            <span className="font-semibold flex items-center gap-1.5 text-[11px]">
              <Check className="w-3 h-3 text-emerald-600" />
              Verified Step-Free Access
            </span>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              {location.accessibilityNotes}
            </p>
          </div>
        )}

        {/* Geographic Data Provenance */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-[10px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" />
              Geographic Provenance
            </span>
            {location.coordinates ? (
              <span className="font-mono text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {location.coordinates.lat.toFixed(5)}, {location.coordinates.lng.toFixed(5)}
              </span>
            ) : (
              <span className="text-amber-600 font-medium">Pending On-Ground GPS</span>
            )}
          </div>
          <p className="text-slate-500 leading-snug">
            Source: {location.source}
          </p>
        </div>

        {/* External Link to OpenStreetMap view */}
        {location.coordinates && (
          <div className="pt-1">
            <a
              href={`https://www.openstreetmap.org/?mlat=${location.coordinates.lat}&mlon=${location.coordinates.lng}#map=18/${location.coordinates.lat}/${location.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold active:opacity-75"
            >
              <span>View node on OpenStreetMap</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
