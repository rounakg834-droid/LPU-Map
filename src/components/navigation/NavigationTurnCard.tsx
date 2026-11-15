import React from 'react';
import {
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  MapPin,
  ArrowUpLeft,
  ArrowUpRight,
  Navigation,
} from 'lucide-react';
import { TurnInstruction, ManeuverType } from '../../types/navigation';

interface NavigationTurnCardProps {
  currentInstruction: TurnInstruction | null;
  nextInstruction: TurnInstruction | null;
  totalDistanceMeters: number;
  destinationName: string;
  distanceToNextManeuver?: number;
}

export const NavigationTurnCard: React.FC<NavigationTurnCardProps> = ({
  currentInstruction,
  nextInstruction,
  destinationName,
  distanceToNextManeuver,
}) => {
  if (!currentInstruction) return null;

  // Render high-contrast Google Maps turn maneuver icon
  const renderManeuverIcon = (maneuver: ManeuverType, className = 'w-9 h-9') => {
    switch (maneuver) {
      case 'turn_left':
      case 'sharp_left':
        return <CornerUpLeft className={className} strokeWidth={3} />;
      case 'turn_right':
      case 'sharp_right':
        return <CornerUpRight className={className} strokeWidth={3} />;
      case 'slight_left':
        return <ArrowUpLeft className={className} strokeWidth={3} />;
      case 'slight_right':
        return <ArrowUpRight className={className} strokeWidth={3} />;
      case 'arrive':
        return <MapPin className={className} strokeWidth={2.5} />;
      case 'straight':
      case 'depart':
      default:
        return <ArrowUp className={className} strokeWidth={3} />;
    }
  };

  // Small icon for the "Then..." preview
  const renderMiniManeuverIcon = (maneuver: ManeuverType) => {
    return renderManeuverIcon(maneuver, 'w-4 h-4 text-emerald-200');
  };

  // Format distance cleanly (meters or km)
  const formatMeters = (meters: number) => {
    if (meters <= 0) return 'Here';
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  };

  const effectiveDistance =
    typeof distanceToNextManeuver === 'number' && distanceToNextManeuver >= 0
      ? distanceToNextManeuver
      : currentInstruction.distanceMeters;

  return (
    <div className="fixed top-2.5 sm:top-4 inset-x-3 sm:inset-x-auto sm:left-6 sm:w-[400px] z-40 pointer-events-auto select-none animate-in slide-in-from-top-4 duration-300">
      {/* Google Maps Emerald Green Container */}
      <div className="bg-[#0B6623] text-white rounded-2xl shadow-[0_8px_30px_rgba(11,102,35,0.4)] border border-emerald-600/40 overflow-hidden">
        {/* Main Turn Direction Row */}
        <div className="p-3.5 sm:p-4 flex items-center gap-3.5">
          {/* High-Contrast Maneuver Icon */}
          <div className="w-14 h-14 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 text-white shadow-inner">
            {renderManeuverIcon(currentInstruction.maneuver)}
          </div>

          {/* Turn Text & Distance */}
          <div className="flex-1 min-w-0">
            {/* Distance Countdown */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">
                {formatMeters(effectiveDistance)}
              </span>
            </div>

            {/* Maneuver Road & Instruction */}
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate mt-1 leading-snug">
              {currentInstruction.pathName || destinationName}
            </h2>

            <p className="text-xs text-emerald-100/90 font-medium truncate mt-0.5">
              {currentInstruction.instruction}
            </p>
          </div>
        </div>

        {/* Next Maneuver Preview Banner ("Then...") */}
        {nextInstruction && (
          <div className="bg-[#074618] px-4 py-2 flex items-center justify-between text-xs font-semibold text-emerald-100 border-t border-emerald-700/50">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold flex-shrink-0">
                Then
              </span>
              <div className="flex-shrink-0">{renderMiniManeuverIcon(nextInstruction.maneuver)}</div>
              <span className="truncate text-white font-medium">{nextInstruction.instruction}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-300 flex-shrink-0 pl-2">
              <Navigation className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{destinationName}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};