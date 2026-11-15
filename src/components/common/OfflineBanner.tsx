import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="absolute top-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-20 animate-slide-down">
      <div className="flex items-center gap-2.5 p-2.5 px-3 bg-amber-900/90 backdrop-blur-md text-amber-100 rounded-2xl shadow-xl border border-amber-500/40 text-xs">
        <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-amber-300">Offline Mode Active</div>
          <div className="text-[10px] text-amber-200/80 truncate">
            Campus search, routing & GPS work locally
          </div>
        </div>
      </div>
    </div>
  );
};
