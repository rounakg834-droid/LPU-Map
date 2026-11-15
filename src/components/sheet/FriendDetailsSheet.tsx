import React, { useState, useEffect } from 'react';
import {
  X,
  Navigation,
  Clock,
  Footprints,
  Bike,
  Car,
  Accessibility,
  AlertCircle
} from 'lucide-react';
import { LiveLocationShare } from '../../types/locationSharing';
import { NavigationMode } from '../../types/navigation';

interface FriendDetailsSheetProps {
  friendShare: LiveLocationShare | null;
  onClose: () => void;
  onNavigateToFriend: (friendShare: LiveLocationShare, mode: NavigationMode) => void;
  selectedMode: NavigationMode;
  onSelectMode: (mode: NavigationMode) => void;
  isNavigating: boolean;
}

export const FriendDetailsSheet: React.FC<FriendDetailsSheetProps> = ({
  friendShare,
  onClose,
  onNavigateToFriend,
  selectedMode,
  onSelectMode,
  isNavigating
}) => {
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  useEffect(() => {
    if (!friendShare) return;
    const calc = () => {
      const diff = Math.floor((Date.now() - new Date(friendShare.coords.updatedAt).getTime()) / 1000);
      setSecondsAgo(Math.max(0, diff));
    };
    calc();
    const interval = setInterval(calc, 2000);
    return () => clearInterval(interval);
  }, [friendShare?.coords?.updatedAt]);

  if (!friendShare) return null;

  const isExpired = new Date(friendShare.expiresAt).getTime() <= Date.now() || friendShare.revoked;

  const modeOptions: { mode: NavigationMode; label: string; icon: any }[] = [
    { mode: 'walking', label: 'Walk', icon: Footprints },
    { mode: 'bike', label: 'Bike', icon: Bike },
    { mode: 'car', label: 'Drive', icon: Car },
    { mode: 'wheelchair', label: 'Ramp', icon: Accessibility }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-auto md:left-4 md:bottom-4 md:w-96 animate-slide-up">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-3xl md:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-black/[0.06] dark:border-white/[0.08] overflow-hidden">
        {/* Drag handle on mobile */}
        <div className="w-9 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2 md:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {friendShare.isLive ? 'Live Tracking Active' : 'Fixed Friend Location'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {isExpired ? (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sharing Expired or Stopped</p>
                <p className="text-[11px] text-rose-600/90 dark:text-rose-400">
                  This location share link has expired or was stopped by your friend.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Friend Title & Info */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {friendShare.creatorDisplayName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
                  </span>
                  <span>·</span>
                  <span>Accuracy: ±{Math.round(friendShare.coords.accuracy)}m</span>
                </div>
              </div>

              {/* Note if present */}
              {friendShare.note && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 italic">
                  "{friendShare.note}"
                </div>
              )}

              {/* Travel Mode Pills */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Travel Mode
                </span>
                <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                  {modeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSel = selectedMode === opt.mode;
                    return (
                      <button
                        key={opt.mode}
                        onClick={() => onSelectMode(opt.mode)}
                        className={`flex items-center justify-center gap-1 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSel
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigate Action Button */}
              <button
                onClick={() => onNavigateToFriend(friendShare, selectedMode)}
                className="w-full py-2.5 rounded-full bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Navigation className="w-3.5 h-3.5 fill-white" />
                <span>{isNavigating ? 'Recalculate Route to Friend' : 'Navigate Toward Friend'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
