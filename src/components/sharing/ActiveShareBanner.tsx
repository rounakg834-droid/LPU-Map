import React, { useState, useEffect } from 'react';
import { StopCircle } from 'lucide-react';
import { LiveLocationShare } from '../../types/locationSharing';

interface ActiveShareBannerProps {
  share: LiveLocationShare;
  onStop: () => void;
  onOpenModal: () => void;
}

export const ActiveShareBanner: React.FC<ActiveShareBannerProps> = ({
  share,
  onStop,
  onOpenModal
}) => {
  const [minutesRemaining, setMinutesRemaining] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const diff = new Date(share.expiresAt).getTime() - Date.now();
      setMinutesRemaining(Math.max(0, Math.ceil(diff / 60000)));
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, [share.expiresAt]);

  return (
    <div className="absolute top-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-20 animate-slide-down">
      <div className="flex items-center justify-between p-2.5 px-3 bg-slate-900/90 backdrop-blur-md text-white rounded-2xl shadow-xl border border-emerald-500/40">
        <button
          onClick={onOpenModal}
          className="flex items-center gap-2.5 text-left flex-1 min-w-0 mr-2"
        >
          <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div className="truncate">
            <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
              <span>Sharing Live Location</span>
            </div>
            <div className="text-[10px] text-slate-300">
              Expires in {minutesRemaining} min · Tap for link
            </div>
          </div>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onStop();
          }}
          className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-[11px] font-bold text-white transition-colors flex-shrink-0 shadow-sm"
        >
          <StopCircle className="w-3.5 h-3.5" />
          Stop
        </button>
      </div>
    </div>
  );
};
