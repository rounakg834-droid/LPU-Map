import React from 'react';
import { X, Bookmark, MapPin, Trash2, ChevronRight } from 'lucide-react';
import { CampusLocation } from '../../types/location';
import { VerificationBadge } from './VerificationBadge';

interface SavedPlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedLocations: CampusLocation[];
  onSelectLocation: (loc: CampusLocation) => void;
  onRemoveSaved: (id: string) => void;
}

export const SavedPlacesModal: React.FC<SavedPlacesModalProps> = ({
  isOpen,
  onClose,
  savedLocations,
  onSelectLocation,
  onRemoveSaved,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col max-h-[80dvh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Bookmark className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Saved Campus Places</h2>
              <p className="text-xs text-slate-500">
                {savedLocations.length} bookmarked {savedLocations.length === 1 ? 'place' : 'places'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
            aria-label="Close saved places"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {savedLocations.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">No saved places yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Tap the bookmark icon on any campus location details sheet to save blocks, hostels, and facilities for quick navigation.
              </p>
            </div>
          ) : (
            savedLocations.map((loc) => (
              <div
                key={loc.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200/60 transition flex items-center justify-between gap-3 group"
              >
                <div
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {loc.category.replace('_', ' ')}
                    </span>
                    <VerificationBadge status={loc.verificationStatus} />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition">
                    {loc.name}
                  </h4>
                  {loc.blockNumber && (
                    <span className="text-xs text-slate-500 block">
                      Block: {loc.blockNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onRemoveSaved(loc.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-white transition"
                    title="Remove from saved"
                    aria-label="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className="p-2 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-white transition"
                    title="View on map"
                    aria-label="View on map"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-600" />
          <span>Saved locations are stored locally on your device</span>
        </div>
      </div>
    </div>
  );
};
