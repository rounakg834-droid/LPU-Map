import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Clock,
  Radio,
  MapPin,
  Copy,
  Check,
  AlertTriangle,
  StopCircle,
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import {
  ShareDurationMinutes,
  LiveLocationShare
} from '../../types/locationSharing';
import { locationSharingService } from '../../services/locationSharingService';

interface ShareLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoords: { lat: number; lng: number; accuracy: number; heading?: number | null; speed?: number | null } | null;
  onShareStarted: (share: LiveLocationShare) => void;
  onShareStopped: () => void;
  activeShare: LiveLocationShare | null;
}

export const ShareLocationModal: React.FC<ShareLocationModalProps> = ({
  isOpen,
  onClose,
  currentCoords,
  onShareStarted,
  onShareStopped,
  activeShare
}) => {
  const [durationMinutes, setDurationMinutes] = useState<ShareDurationMinutes>(60);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen) return null;

  const handleStartShare = async () => {
    if (!currentCoords) {
      setError('GPS coordinates unavailable. Please enable device location.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const share = await locationSharingService.createShare(
        {
          durationMinutes,
          isLive,
          note
        },
        currentCoords
      );
      onShareStarted(share);
    } catch (err: any) {
      setError(err?.message || 'Failed to start location sharing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStopShare = async () => {
    if (!activeShare) return;
    try {
      setIsSubmitting(true);
      await locationSharingService.revokeShare(activeShare.token);
      onShareStopped();
    } catch (err: any) {
      setError(err?.message || 'Failed to stop sharing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getShareLink = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lpunav.in';
    return `${origin}/?share=${token}`;
  };

  const handleCopyLink = async (token: string) => {
    const link = getShareLink(token);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        setCopied(true);
      }
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const handleWhatsAppShare = (share: LiveLocationShare) => {
    const url = locationSharingService.generateWhatsAppShareUrl(share);
    window.open(url, '_blank');
  };

  const handleNativeShare = async (share: LiveLocationShare) => {
    const link = getShareLink(share.token);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My LPU Live Location',
          text: `Track my live location on LPU Smart Campus Navigator: ${link}`,
          url: link
        });
      } catch (err) {
        console.warn('Native share cancelled:', err);
      }
    } else {
      handleCopyLink(share.token);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Share Campus Location</h2>
              <p className="text-xs text-slate-500">Private link for friends & WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Active Share State */}
          {activeShare ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Currently Broadcasting
                    </span>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {activeShare.isLive ? 'Live GPS Moving' : 'Fixed Pin'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    Expires at:{' '}
                    <span className="font-semibold text-slate-800">
                      {new Date(activeShare.expiresAt).toLocaleTimeString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}{' '}
                      IST
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Your friend will see your real-time moving blue dot and can navigate directly to you.
                  </p>
                </div>

                {/* Share Link Field */}
                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-200">
                  <input
                    type="text"
                    readOnly
                    value={getShareLink(activeShare.token)}
                    className="flex-1 text-xs font-mono text-slate-600 bg-transparent outline-none truncate"
                  />
                  <button
                    onClick={() => handleCopyLink(activeShare.token)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleWhatsAppShare(activeShare)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Share on WhatsApp
                  </button>
                  <button
                    onClick={() => handleNativeShare(activeShare)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Other Apps
                  </button>
                </div>
              </div>

              {/* Stop Button */}
              <button
                onClick={handleStopShare}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                Stop Sharing Location Now
              </button>
            </div>
          ) : (
            /* Create Share Form */
            <div className="space-y-4">
              {/* Type Toggle: Live vs Pin */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsLive(true)}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    isLive ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Live GPS (Moving)
                </button>
                <button
                  type="button"
                  onClick={() => setIsLive(false)}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    !isLive ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  One-Time Pin
                </button>
              </div>

              {/* Duration Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Auto-Expiry Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 15, label: '15 Minutes', sub: 'Quick meetup' },
                    { val: 60, label: '1 Hour', sub: 'Class/Lunch' },
                    { val: 480, label: '8 Hours', sub: 'Full day' }
                  ].map((dur) => (
                    <button
                      key={dur.val}
                      type="button"
                      onClick={() => setDurationMinutes(dur.val as ShareDurationMinutes)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        durationMinutes === dur.val
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">{dur.label}</div>
                      <div className="text-[10px] text-slate-500">{dur.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Meeting Note <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Waiting at UniMall Cafe ground floor"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800"
                />
              </div>

              {/* Privacy Notice */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-[11px] text-blue-900">
                <div className="flex items-center gap-1.5 font-bold text-blue-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Privacy & Encryption
                </div>
                <p className="text-blue-700 leading-relaxed">
                  Only friends who have your unique link can track your position. The link self-destructs automatically when the duration expires.
                </p>
              </div>

              {/* Background GPS Limitation Honesty Note */}
              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2 text-[10px] text-amber-900 leading-snug">
                <Smartphone className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Browser Notice:</strong> Mobile browsers restrict GPS tracking when the screen locks or tab minimizes. Keep this tab open while actively sharing.
                </p>
              </div>

              {/* Start Button */}
              <button
                type="button"
                onClick={handleStartShare}
                disabled={isSubmitting || !currentCoords}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {isSubmitting ? 'Generating Secure Link...' : 'Generate WhatsApp Share Link'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
