import React from 'react';
import { X, CornerUpLeft, CornerUpRight, ArrowUp, MapPin, ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { TurnInstruction, ManeuverType } from '../../types/navigation';

interface NavigationStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructions: TurnInstruction[];
  destinationName: string;
}

export const NavigationStepsModal: React.FC<NavigationStepsModalProps> = ({
  isOpen,
  onClose,
  instructions,
  destinationName,
}) => {
  if (!isOpen) return null;

  const getManeuverIcon = (maneuver: ManeuverType, className = 'w-4 h-4') => {
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col max-h-[75dvh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Route Directions</h3>
            <p className="text-xs text-slate-500">To {destinationName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
            aria-label="Close directions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {instructions.map((step, idx) => (
            <div key={step.id || idx} className={`pt-3 first:pt-0 flex items-start gap-3`}>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getManeuverIcon(step.maneuver)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  {step.instruction}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  {step.distanceMeters > 0 && <span>{step.distanceMeters} m</span>}
                  <span>·</span>
                  <span className="truncate">{step.pathName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
