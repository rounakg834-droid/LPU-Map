import React, { useState, useEffect } from 'react';
import {
  Footprints,
  Bike,
  Car,
  Accessibility,
  Info,
  Clock,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { NavigationMode, RoutePlan } from '../../types/navigation';
import { NAVIGATION_MODES } from '../../services/routingService';
import { CampusLocation, Coordinates } from '../../types/location';
import { routingService } from '../../services/routingService';

interface ModeSelectorProps {
  currentMode: NavigationMode;
  onSelectMode: (mode: NavigationMode) => void;
  destination: CampusLocation;
  userCoords: Coordinates | null;
  onStartNavigation: (routePlan: RoutePlan) => void;
  onRequestGps: () => void;
  preferEngine?: 'campus' | 'google';
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  destination,
  userCoords,
  onStartNavigation,
  onRequestGps,
  preferEngine = 'campus',
}) => {
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    routingService
      .calculateRoute(userCoords, destination, currentMode, preferEngine)
      .then((plan) => {
        if (!isCancelled) {
          setRoutePlan(plan);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [userCoords, destination, currentMode, preferEngine]);

  const getIcon = (id: NavigationMode, className = 'w-4 h-4') => {
    switch (id) {
      case 'walking':
        return <Footprints className={className} />;
      case 'bike':
        return <Bike className={className} />;
      case 'car':
        return <Car className={className} />;
      case 'wheelchair':
        return <Accessibility className={className} />;
    }
  };

  const currentModeConfig = NAVIGATION_MODES.find((m) => m.id === currentMode);

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-4 gap-1.5">
        {NAVIGATION_MODES.map((mode) => {
          const isSelected = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-100/80 border border-slate-200/70'
              }`}
            >
              <div className="mb-0.5">{getIcon(mode.id, 'w-4 h-4')}</div>
              <span className="text-[11px]">{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Route Status and Metrics Card */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/70 space-y-2 text-xs">
        {isLoading ? (
          <div className="py-4 flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            <span className="text-xs font-medium">Calculating verified campus route...</span>
          </div>
        ) : routePlan?.status === 'available' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">
                {currentModeConfig?.label} Route
              </span>
              <div className="flex items-center gap-2 font-medium">
                <span className="text-brand-700 font-extrabold text-sm">
                  {routePlan.distanceMeters > 1000
                    ? `${(routePlan.distanceMeters / 1000).toFixed(2)} km`
                    : `${routePlan.distanceMeters} m`}
                </span>
                <span className="flex items-center gap-0.5 text-slate-600 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  ~{routePlan.estimatedTimeMinutes} min
                </span>
              </div>
            </div>

            {routePlan.notes && (
              <p className="text-[11px] text-slate-600 leading-snug">
                {routePlan.notes}
              </p>
            )}

            {routePlan.accessibilityNotice && (
              <div className="p-2 bg-emerald-50 border border-emerald-200/80 rounded-lg text-emerald-900 text-[11px] flex items-start gap-1.5 leading-snug">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{routePlan.accessibilityNotice}</span>
              </div>
            )}

            {/* Start Navigation Action Button */}
            <button
              onClick={() => onStartNavigation(routePlan)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 transition"
            >
              <Navigation className="w-4 h-4 fill-white" />
              <span>Start Live GPS Navigation</span>
            </button>
          </div>
        ) : routePlan?.status === 'unavailable' ? (
          <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl space-y-1.5 text-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Route Unavailable for {currentModeConfig?.label} Mode</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              {routePlan.unreachableReason || routePlan.accessibilityNotice}
            </p>
            {currentMode === 'wheelchair' && (
              <p className="text-[10px] text-amber-700 pt-1 border-t border-amber-200/60">
                To prevent student hazard, wheelchair navigation strictly requires confirmed grade-level ramps.
              </p>
            )}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-600">
            <span className="font-semibold block text-xs">GPS Fix Required</span>
            <p className="text-[11px] leading-snug">
              Enable your GPS or recenter to calculate verified paths from your live position.
            </p>
            <button
              onClick={onRequestGps}
              className="mt-1 text-xs font-bold text-brand-700 hover:text-brand-800 underline block"
            >
              Acquire GPS Location
            </button>
          </div>
        )}

        <div className="pt-1.5 border-t border-slate-100 flex items-start gap-1 text-[10px] text-slate-400 leading-tight">
          <Info className="w-3 h-3 text-brand-600 flex-shrink-0 mt-0.5" />
          <span>
            {currentMode === 'car'
              ? 'Private vehicles restricted from central pedestrian corridors.'
              : currentMode === 'wheelchair'
              ? 'Ramp and elevator data strictly enforced.'
              : 'Routes use verified OpenStreetMap LPU campus network.'}
          </span>
        </div>
      </div>
    </div>
  );
};
