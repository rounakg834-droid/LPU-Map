import React from 'react';
import { X, Navigation, Gauge, Footprints, Bike, Car, Accessibility, List } from 'lucide-react';
import { NavigationMode } from '../../types/navigation';

interface NavigationBottomBarProps {
  remainingDistanceMeters: number;
  remainingMinutes: number;
  speedKmh: number | null;
  mode: NavigationMode;
  isFollowing: boolean;
  onRecenter: () => void;
  onStopNavigation: () => void;
  onToggleDirectionsList: () => void;
  isListOpen: boolean;
}

export const NavigationBottomBar: React.FC<NavigationBottomBarProps> = ({
  remainingDistanceMeters,
  remainingMinutes,
  speedKmh,
  mode,
  isFollowing,
  onRecenter,
  onStopNavigation,
  onToggleDirectionsList,
  isListOpen,
}) => {
  // Format current time + remaining minutes for estimated arrival time
  const getETAString = () => {
    const now = new Date();
    const arrival = new Date(now.getTime() + remainingMinutes * 60000);
    return arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'walking':
        return <Footprints className="w-3.5 h-3.5" />;
      case 'bike':
        return <Bike className="w-3.5 h-3.5" />;
      case 'car':
        return <Car className="w-3.5 h-3.5" />;
      case 'wheelchair':
        return <Accessibility className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed bottom-2.5 sm:bottom-4 inset-x-3 sm:inset-x-auto sm:left-6 sm:w-[380px] z-40 pointer-events-auto pb-safe-bottom animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white/98 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
        {/* Main Navigation Metrics Row */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                {remainingMinutes} min
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500">
                (ETA {getETAString()})
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-bold text-slate-800">
                {remainingDistanceMeters > 1000
                  ? `${(remainingDistanceMeters / 1000).toFixed(2)} km`
                  : `${remainingDistanceMeters} m`}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                {getModeIcon()}
                {mode}
              </span>
            </div>
          </div>

          {/* Real GPS Speed Pill */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 shadow-xs">
              <Gauge className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-mono font-bold">
                {speedKmh !== null && speedKmh >= 0 ? speedKmh.toFixed(1) : '0.0'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">km/h</span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5">GPS Speed</span>
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          {/* Recenter / Camera Tracking button */}
          <button
            onClick={onRecenter}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 ${
              isFollowing
                ? 'bg-brand-50 text-brand-700 border border-brand-200/80 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isFollowing ? 'fill-brand-600' : ''}`} />
            <span>{isFollowing ? 'Tracking On' : 'Recenter'}</span>
          </button>

          {/* Steps List Toggle */}
          <button
            onClick={onToggleDirectionsList}
            className={`p-2.5 rounded-xl border transition active:scale-95 ${
              isListOpen
                ? 'bg-brand-600 text-white border-brand-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="View full turn list"
            aria-label="View turn list"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Stop / Exit Navigation button (Red prominent button) */}
          <button
            onClick={onStopNavigation}
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 active:scale-95 transition shadow-md shadow-red-500/25 flex items-center justify-center gap-1.5"
            aria-label="Stop navigation"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
