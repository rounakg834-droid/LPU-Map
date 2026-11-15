import React from 'react';
import {
  X,
  Navigation2,
  Footprints,
  Bike,
  Car,
  Accessibility,
  List,
  Compass,
} from 'lucide-react';
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
  isNorthUp?: boolean;
  onToggleNorthUp?: () => void;
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
  isNorthUp = false,
  onToggleNorthUp,
}) => {
  // Format current time + remaining minutes for ETA
  const getETAString = () => {
    const now = new Date();
    const arrival = new Date(now.getTime() + Math.max(1, remainingMinutes) * 60000);
    return arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'walking':
        return <Footprints className="w-3.5 h-3.5 text-blue-600" />;
      case 'bike':
        return <Bike className="w-3.5 h-3.5 text-blue-600" />;
      case 'car':
        return <Car className="w-3.5 h-3.5 text-blue-600" />;
      case 'wheelchair':
        return <Accessibility className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  const formattedDistance =
    remainingDistanceMeters >= 1000
      ? `${(remainingDistanceMeters / 1000).toFixed(1)} km`
      : `${Math.round(remainingDistanceMeters)} m`;

  return (
    <>
      {/* Floating Recenter & Orientation Bar - Appears above bottom bar when user drags away */}
      <div className="fixed bottom-24 sm:bottom-28 inset-x-4 sm:inset-x-auto sm:left-6 sm:w-[400px] z-40 pointer-events-none flex items-center justify-between">
        {/* Recenter Button: Prominent Google Maps Floating Pill */}
        {!isFollowing ? (
          <button
            onClick={onRecenter}
            className="pointer-events-auto shadow-2xl bg-white hover:bg-slate-50 text-blue-600 border border-blue-200/80 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 active:scale-95 transition-all animate-in slide-in-from-bottom-2 duration-200"
          >
            <Navigation2 className="w-4 h-4 fill-blue-600" />
            <span>Re-center</span>
          </button>
        ) : <div />}

        {/* North-Up vs Heading-Up Perspective Toggle Button */}
        {onToggleNorthUp && (
          <button
            onClick={onToggleNorthUp}
            className="pointer-events-auto shadow-lg bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
            title={isNorthUp ? 'Switch to Forward-Facing 3D View' : 'Lock to North-Up View'}
          >
            <Compass className={`w-4 h-4 ${isNorthUp ? 'text-red-500' : 'text-slate-600'}`} />
            <span>{isNorthUp ? 'North-Up' : 'Forward 3D'}</span>
          </button>
        )}
      </div>

      {/* Google Maps Compact Bottom Navigation Bar (<15% height) */}
      <div className="fixed bottom-2.5 sm:bottom-4 inset-x-3 sm:inset-x-auto sm:left-6 sm:w-[400px] z-40 pointer-events-auto pb-safe-bottom select-none animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white/98 backdrop-blur-2xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.18)] border border-slate-200/90 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: ETA, Remaining Distance & Mode */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#137333] tracking-tight leading-none">
                  {Math.max(1, remainingMinutes)}
                  <span className="text-sm font-bold ml-1 text-emerald-700">min</span>
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-500 truncate">
                  ETA {getETAString()}
                </span>
              </div>

              {/* Distance and Mode subtitle */}
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                <span className="font-bold text-slate-800">{formattedDistance}</span>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                  {getModeIcon()}
                  <span className="capitalize">{mode}</span>
                </span>
              </div>
            </div>

            {/* Middle: GPS Speed Indicator Pill */}
            <div className="flex flex-col items-center justify-center px-2 py-1 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-mono font-black text-slate-800 leading-tight">
                {speedKmh !== null && speedKmh >= 0 ? speedKmh.toFixed(1) : '0.0'}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                km/h
              </span>
            </div>

            {/* Right: Turn List Toggle & Red Exit Button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Route directions list toggle */}
              <button
                onClick={onToggleDirectionsList}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition active:scale-95 ${
                  isListOpen
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="View full turn list"
                aria-label="View turn list"
              >
                <List className="w-4 h-4" />
              </button>

              {/* Google Maps Style Circular Red Close / Exit Button */}
              <button
                onClick={onStopNavigation}
                className="w-9 h-9 rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-95 transition shadow-md shadow-red-600/30 flex items-center justify-center"
                title="Exit navigation"
                aria-label="Exit navigation"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};