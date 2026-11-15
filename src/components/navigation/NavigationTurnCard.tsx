import React from 'react';
import {
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  MapPin,
  ArrowUpLeft,
  ArrowUpRight,
  Compass,
} from 'lucide-react';
import { TurnInstruction, ManeuverType } from '../../types/navigation';

interface NavigationTurnCardProps {
  currentInstruction: TurnInstruction | null;
  nextInstruction: TurnInstruction | null;
  totalDistanceMeters: number;
  destinationName: string;
}

export const NavigationTurnCard: React.FC<NavigationTurnCardProps> = ({
  currentInstruction,
  nextInstruction,
  destinationName,
}) => {
  if (!currentInstruction) return null;

  const getManeuverIcon = (maneuver: ManeuverType, className = 'w-7 h-7') => {
    switch (maneuver) {
      case 'turn_left':
      case 'sharp_left':
        return <CornerUpLeft className={className} />;
      case 'turn_right':
      case 'sharp_right':
        return <CornerUpRight className={className} />;
      case 'slight_left':
        return <ArrowUpLeft className={className} />;
      case 'slight_right':
        return <ArrowUpRight className={className} />;
      case 'arrive':
        return <MapPin className={className} />;
      case 'straight':
      case 'depart':
      default:
        return <ArrowUp className={className} />;
    }
  };

  return (
    <div className="fixed top-2.5 sm:top-4 inset-x-3 sm:inset-x-auto sm:left-6 sm:w-[380px] z-40 pointer-events-auto animate-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/80 text-white p-3.5 space-y-2">
        <div className="flex items-start gap-3">
          {/* Large Maneuver Direction Icon */}
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
            {getManeuverIcon(currentInstruction.maneuver, 'w-6 h-6 stroke-[2.5]')}
          </div>

          {/* Turn Text & Distance */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-400">
                {currentInstruction.distanceMeters > 0 ? (
                  currentInstruction.distanceMeters > 1000 ? (
                    `${(currentInstruction.distanceMeters / 1000).toFixed(1)} km`
                  ) : (
                    `${currentInstruction.distanceMeters} m`
                  )
                ) : (
                  'Here'
                )}
              </span>
              <span className="text-xs text-slate-400 font-medium truncate">
                {currentInstruction.pathName}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 mt-0.5">
              {currentInstruction.instruction}
            </h3>
          </div>
        </div>

        {/* Next step preview cue */}
        {nextInstruction && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[11px] text-slate-500">Then:</span>
              <span className="text-slate-300 truncate">{nextInstruction.instruction}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 flex-shrink-0">
              <Compass className="w-3 h-3 text-slate-500" />
              <span>To {destinationName.substring(0, 14)}...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
