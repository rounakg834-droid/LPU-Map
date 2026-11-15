import React from 'react';
import { Compass } from 'lucide-react';

interface CompassHeadingProps {
  heading: number | null;
  onResetNorth?: () => void;
  onRequestPermission?: () => void;
  className?: string;
}

export const CompassHeading: React.FC<CompassHeadingProps> = ({
  heading,
  onResetNorth,
  onRequestPermission,
  className,
}) => {
  const rotation = heading !== null ? heading : 0;

  const handleClick = () => {
    if (heading === null && onRequestPermission) {
      onRequestPermission();
    } else if (onResetNorth) {
      onResetNorth();
    }
  };

  const defaultClasses =
    'w-10 h-10 sm:w-11 sm:h-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-sm border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center text-slate-700 active:scale-95 transition-all duration-200 hover:bg-slate-50 focus:outline-none';

  return (
    <button
      onClick={handleClick}
      aria-label={heading !== null ? `Compass heading ${heading} degrees. Click to reset North` : 'Reset map North'}
      title={heading !== null ? `${heading}° - Tap to align North` : 'Tap to orient North'}
      className={className || defaultClasses}
    >
      <div
        className="transition-transform duration-300 ease-out flex items-center justify-center"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          <Compass className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          {/* North needle tip in Apple red */}
          <div className="absolute top-0.5 w-1 h-1.5 bg-red-500 rounded-full shadow-xs" />
        </div>
      </div>
    </button>
  );
};
