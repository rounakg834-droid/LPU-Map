import React from 'react';
import {
  X,
  PhoneCall,
  Navigation,
  Share2,
  ShieldAlert,
  HeartPulse,
  HeartHandshake
} from 'lucide-react';
import { VERIFIED_EMERGENCY_CONTACTS } from '../../types/emergency';
import { CampusLocation, Coordinates } from '../../types/location';
import { CAMPUS_LOCATIONS } from '../../data/locations';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoords: Coordinates | null;
  onNavigateToHospital: (hospitalLocation: CampusLocation) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  currentCoords,
  onNavigateToHospital
}) => {
  if (!isOpen) return null;

  const uniHospital = CAMPUS_LOCATIONS.find((l: CampusLocation) => l.id === 'unihospital') || null;

  const handleSendEmergencyWhatsApp = () => {
    const lat = currentCoords ? currentCoords.lat.toFixed(5) : '31.25492';
    const lng = currentCoords ? currentCoords.lng.toFixed(5) : '75.70462';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lpunav.in';
    const mapLink = `https://maps.google.com/?q=${lat},${lng}`;
    const campusLink = `${origin}/?lat=${lat}&lng=${lng}`;

    const text = `🚨 EMERGENCY SOS — LPU CAMPUS\nI need immediate assistance at Lovely Professional University.\n\n📍 My GPS Location: ${lat}, ${lng}\n🗺️ Google Maps: ${mapLink}\n🧭 Campus Navigator: ${campusLink}\n\nSecurity Control: 01824-517000 | UniHospital: 01824-517100`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-rose-600 text-white shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Emergency Assistance</h2>
              <p className="text-xs text-rose-100">Verified LPU University Contacts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick Actions (Navigate to Hospital & WhatsApp SOS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {uniHospital && (
              <button
                onClick={() => {
                  onNavigateToHospital(uniHospital);
                  onClose();
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs transition-all active:scale-[0.98]"
              >
                <Navigation className="w-4 h-4 text-rose-600" />
                Navigate to UniHospital
              </button>
            )}

            <button
              onClick={handleSendEmergencyWhatsApp}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs transition-all active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              WhatsApp SOS Alert
            </button>
          </div>

          {/* Emergency Contact List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              On-Campus Help & Helplines
            </h3>
            <div className="space-y-2">
              {VERIFIED_EMERGENCY_CONTACTS.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 mr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      {c.category === 'medical' ? (
                        <HeartPulse className="w-4 h-4 text-rose-600" />
                      ) : c.category === 'helpline' ? (
                        <HeartHandshake className="w-4 h-4 text-purple-600" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{c.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{c.role}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{c.availableHours}</div>
                    </div>
                  </div>

                  <a
                    href={`tel:${c.phone}`}
                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex-shrink-0"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Legal / Policy Disclaimer */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 leading-relaxed">
            <strong>Disclaimer:</strong> The numbers above connect directly to on-campus Lovely Professional University security and medical personnel. In life-threatening emergencies requiring national civil services, dial <strong>112</strong> (National Emergency Number).
          </div>
        </div>
      </div>
    </div>
  );
};
