import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Layers,
  Copy,
  Check,
  Lock,
  RefreshCw,
  Globe
} from 'lucide-react';
import { googleMapsService } from '../../services/googleMapsService';
import { GoogleMapsStatus } from '../../types/googleMaps';

interface GoogleMapsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export const GoogleMapsConfigModal: React.FC<GoogleMapsConfigModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [status, setStatus] = useState<GoogleMapsStatus>(googleMapsService.getStatus());
  const [errorMessage, setErrorMessage] = useState<string | null>(googleMapsService.getErrorMessage());
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [copiedReferrer, setCopiedReferrer] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(googleMapsService.getApiKey());
      setStatus(googleMapsService.getStatus());
      setErrorMessage(googleMapsService.getErrorMessage());
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = googleMapsService.subscribe((newStatus, error) => {
      setStatus(newStatus);
      setErrorMessage(error || null);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setIsTesting(true);
    googleMapsService.setCustomApiKey(apiKeyInput.trim());
    try {
      const ok = await googleMapsService.load();
      if (ok) {
        onKeyUpdated?.();
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    googleMapsService.setCustomApiKey('');
    setApiKeyInput('');
    onKeyUpdated?.();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReferrer(id);
    setTimeout(() => setCopiedReferrer(null), 2000);
  };

  const isConfigured = googleMapsService.isConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Google Maps Platform Integration</span>
                {status === 'ready' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                  </span>
                )}
                {status === 'loading' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Verifying...
                  </span>
                )}
                {status === 'unconfigured' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Key Required
                  </span>
                )}
                {status === 'error' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Auth Failed
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Google Maps Platform JavaScript, Places & Routes API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm">
          {/* API Key Input Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-blue-500" />
                <span>Google Maps API Key</span>
              </label>
              {isConfigured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-medium"
                >
                  Clear Key
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3.5 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSaveAndTest}
                disabled={isTesting || !apiKeyInput.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center space-x-1.5"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>{isTesting ? 'Verifying...' : 'Save & Test'}</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Key is securely stored in your browser session and `.env` (`VITE_GOOGLE_MAPS_API_KEY`). It is never sent to third-party tracking servers.
            </p>
          </div>

          {/* Setup Guide */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Google Cloud Platform Setup Guide
            </h3>

            {/* Step 1: APIs to Enable */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  1. Enable Required Google Cloud APIs
                </span>
                <a
                  href="https://console.cloud.google.com/apis/library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center space-x-1"
                >
                  <span>GCP Library</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                <li><strong className="text-slate-900 dark:text-white">Maps JavaScript API</strong> — Real Google roads, tiles, and 3D vector map</li>
                <li><strong className="text-slate-900 dark:text-white">Places API (New)</strong> — Campus building, hostel, and POI search</li>
                <li><strong className="text-slate-900 dark:text-white">Directions API</strong> — Official road and walking route calculation</li>
                <li><strong className="text-slate-900 dark:text-white">Geocoding API</strong> — Campus coordinates and reverse geocoding</li>
              </ul>
            </div>

            {/* Step 2: HTTP Referrer Restrictions */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  2. Restrict Key to HTTP Referrers (Security)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                In Google Cloud Console under Credentials &rarr; Key Restrictions &rarr; Set application restrictions to <strong>Websites</strong> and add:
              </p>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  <span>http://localhost:*/*</span>
                  <button
                    onClick={() => handleCopy('http://localhost:*/*', 'local')}
                    className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    {copiedReferrer === 'local' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  <span>https://rounakg834-droid.github.io/LPU-Map/*</span>
                  <button
                    onClick={() => handleCopy('https://rounakg834-droid.github.io/LPU-Map/*', 'gh')}
                    className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    {copiedReferrer === 'gh' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3: Billing & Cost Control */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                3. Billing & Free Tier Credit
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Google provides <strong className="text-slate-900 dark:text-white">$200 free monthly credit</strong> for Google Maps Platform, which is more than sufficient for campus navigation. Set a budget alert at $10 to ensure zero unexpected costs.
              </p>
            </div>

            {/* Step 4: Comparison Note */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-1.5">
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-200 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Dual Engine & Field-Verified Ground Data</span>
              </span>
              <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                Google Maps provides official highway and arterial road geometries. Our internal campus GIS network provides physical field-verified pedestrian turnstiles (such as the Building 41 Boys Apartment entrance gate at 31.251697, 75.701877) and verified wheelchair step-free ramp plinths which are unmapped by public commercial satellites. Both engines switch smoothly without losing user context.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 text-white rounded-xl shadow-sm transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
