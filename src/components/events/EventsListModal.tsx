import React, { useState } from 'react';
import {
  X,
  Sparkles,
  MapPin,
  Clock,
  Plus,
  Radio,
  Filter,
} from 'lucide-react';
import { PublicCampusEvent, EventCategory, EVENT_CATEGORIES } from '../../types/events';

interface EventsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: PublicCampusEvent[];
  onSelectEvent: (event: PublicCampusEvent) => void;
  onOpenAddModal: () => void;
}

export const EventsListModal: React.FC<EventsListModalProps> = ({
  isOpen,
  onClose,
  events,
  onSelectEvent,
  onOpenAddModal,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<EventCategory | 'all' | 'live'>('all');

  if (!isOpen) return null;

  const filteredEvents = events.filter((ev) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'live') return ev.status === 'live';
    return ev.category === selectedFilter;
  });

  const liveCount = events.filter((e) => e.status === 'live').length;

  const formatTimeIST = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const formatDateIST = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85dvh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-purple-700 to-brand-700 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="text-base font-bold leading-tight">Campus Events</h3>
              <p className="text-[11px] text-purple-100">
                {liveCount > 0 ? `${liveCount} Event${liveCount > 1 ? 's' : ''} Live Now` : 'Explore upcoming LPU happenings'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenAddModal();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-purple-800 text-xs font-bold hover:bg-purple-50 transition shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0 bg-slate-50/70">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedFilter === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Events ({events.length})
          </button>

          <button
            onClick={() => setSelectedFilter('live')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              selectedFilter === 'live'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
            }`}
          >
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Live Now ({liveCount})</span>
          </button>

          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedFilter === cat.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100/80">
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Filter className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No events found</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                No events currently match this filter. Be the first to share an activity at LPU!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post an Event</span>
              </button>
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const isLive = ev.status === 'live';
              const catMeta = EVENT_CATEGORIES.find((c) => c.id === ev.category) || EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    onSelectEvent(ev);
                    onClose();
                  }}
                  className="pt-2.5 first:pt-0 p-3 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition cursor-pointer flex items-start justify-between gap-3 group"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isLive ? (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                          LIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          Upcoming
                        </span>
                      )}
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: catMeta.bgColor, color: catMeta.color }}
                      >
                        {catMeta.label}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition truncate">
                      {ev.title}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3 h-3 text-brand-600" />
                        {ev.locationName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDateIST(ev.startTime)} • {formatTimeIST(ev.startTime)} – {formatTimeIST(ev.endTime)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                      {ev.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
