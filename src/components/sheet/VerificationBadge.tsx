import React from 'react';
import { ShieldCheck, AlertCircle, Compass } from 'lucide-react';
import { VerificationStatus } from '../../types/location';

interface VerificationBadgeProps {
  status: VerificationStatus;
  source?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status, source }) => {
  if (status === 'verified_osm') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>OSM Verified Location</span>
      </div>
    );
  }

  if (status === 'approximate_osm') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-medium">
        <Compass className="w-3.5 h-3.5 text-blue-600" />
        <span>Campus Zone Layout</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
      <span>Ground Survey Pending (Phase 2)</span>
      {source && <span className="opacity-75">· {source}</span>}
    </div>
  );
};
