import React, { useState, useRef, useEffect } from 'react';
import { Layers, ShieldCheck, Car, Footprints, Building2, DoorOpen, Check, X } from 'lucide-react';

export interface ActiveLayersState {
  boundary: boolean;
  roads: boolean;
  walkingPaths: boolean;
  buildings: boolean;
  entrances: boolean;
}

interface CampusLayerControlProps {
  layers: ActiveLayersState;
  onToggleLayer: (layerKey: keyof ActiveLayersState) => void;
  className?: string;
}

export const CampusLayerControl: React.FC<CampusLayerControlProps> = ({
  layers,
  onToggleLayer,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCount = Object.values(layers).filter(Boolean).length;

  const layerItems: { key: keyof ActiveLayersState; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      key: 'boundary',
      label: 'Campus Boundary',
      desc: 'Verified OSM Perimeter (Relation 21599790)',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      color: 'text-emerald-600',
    },
    {
      key: 'roads',
      label: 'Internal Roads',
      desc: 'Licensed OSM vehicular roadways',
      icon: <Car className="w-3.5 h-3.5" />,
      color: 'text-slate-700 dark:text-slate-300',
    },
    {
      key: 'walkingPaths',
      label: 'Walking Paths',
      desc: 'Licensed OSM pedestrian walkways',
      icon: <Footprints className="w-3.5 h-3.5" />,
      color: 'text-sky-600',
    },
    {
      key: 'buildings',
      label: 'Verified Buildings',
      desc: 'Core verified campus facilities',
      icon: <Building2 className="w-3.5 h-3.5" />,
      color: 'text-blue-600',
    },
    {
      key: 'entrances',
      label: 'Entrance Gates',
      desc: 'Building 41 & campus security gates',
      icon: <DoorOpen className="w-3.5 h-3.5" />,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div ref={containerRef} className={`relative pointer-events-auto ${className}`}>
      {/* Floating Toggle Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-95 transition"
        aria-label="Toggle 2D Map Layers"
        title="2D Geographic Base Map Layers"
      >
        <Layers className="w-3.5 h-3.5 text-blue-600" />
        <span>Layers</span>
        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
          {activeCount}
        </span>
      </button>

      {/* Layer Toggle Popover Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/[0.06] dark:border-white/[0.08] p-2.5 z-50 animate-in fade-in slide-in-from-top-2 space-y-1">
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              2D Base Map Layers
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5 pt-1">
            {layerItems.map((item) => {
              const isChecked = layers[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onToggleLayer(item.key)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition active:scale-98 ${
                    isChecked
                      ? 'bg-blue-50/70 dark:bg-blue-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <span className={`mt-0.5 ${item.color}`}>{item.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ml-2 ${
                      isChecked
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
