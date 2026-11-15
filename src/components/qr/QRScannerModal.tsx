import React from 'react';
import { QrCode, MapPin, X, ArrowRight, AlertTriangle } from 'lucide-react';
import { CampusLocation } from '../../types/location';
import { CAMPUS_LOCATIONS } from '../../data/locations';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  scannedLocation: CampusLocation | null;
  invalidLocationId?: string | null;
  onSelectDestination: (dest: CampusLocation) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  scannedLocation,
  invalidLocationId,
  onSelectDestination
}) => {
  if (!isOpen) return null;

  // Suggested popular campus destinations for instant navigation
  const popularDestinations = CAMPUS_LOCATIONS.filter((l: CampusLocation) =>
    ['unimall', 'central-library', 'unihospital', 'unipolis', 'block-34', 'bh-1', 'gh-1'].includes(
      l.id
    ) && l.id !== scannedLocation?.id
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-blue-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">QR Campus Navigation</h2>
              <p className="text-xs text-slate-500">Verified On-Site Campus Pillar</p>
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
        <div className="p-5 space-y-4 overflow-y-auto">
          {invalidLocationId ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-sm font-bold text-rose-900">Unverified QR Code</h3>
              <p className="text-xs text-rose-700 leading-relaxed">
                The scanned QR identifier (<code>{invalidLocationId}</code>) is not recognized in the verified LPU campus directory. Only official university QR markers are permitted.
              </p>
            </div>
          ) : scannedLocation ? (
            <>
              {/* Origin Notice */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-blue-900">You are at this verified entrance:</span>
                </div>
                <div className="text-base font-extrabold text-slate-900">
                  {scannedLocation.name}
                </div>
                {scannedLocation.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {scannedLocation.description}
                  </p>
                )}
                <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                  <span>✓ Origin set to this building</span>
                </div>
              </div>

              {/* Destination Selector */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Where would you like to go?
                </h3>
                <div className="space-y-1.5">
                  {popularDestinations.map((dest: CampusLocation) => (
                    <button
                      key={dest.id}
                      onClick={() => {
                        onSelectDestination(dest);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 text-left transition-all group"
                    >
                      <div className="min-w-0 mr-2">
                        <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                          {dest.name}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {dest.category.replace('_', ' ')}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
