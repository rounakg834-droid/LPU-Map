import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { PublicCampusEvent, EVENT_CATEGORIES } from '../../types/events';

interface EventMarkersProps {
  events: PublicCampusEvent[];
  selectedEvent: PublicCampusEvent | null;
  onSelectEvent: (event: PublicCampusEvent) => void;
  isVisible: boolean;
}

export const EventMarkers: React.FC<EventMarkersProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  isVisible,
}) => {
  if (!isVisible) return null;

  // Render a custom Leaflet DivIcon with category color and pulsating ripple for LIVE events
  const createEventIcon = (event: PublicCampusEvent, isSelected: boolean) => {
    const isLive = event.status === 'live';
    const catMeta = EVENT_CATEGORIES.find((c) => c.id === event.category) || EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];

    const iconHtml = `
      <div class="relative flex items-center justify-center cursor-pointer select-none">
        ${
          isLive
            ? `
          <div class="absolute -inset-1.5 rounded-full animate-ping opacity-75" style="background-color: ${catMeta.color};"></div>
          <div class="absolute -top-3.5 px-1.5 py-0.2 bg-red-600 text-white font-extrabold text-[8px] uppercase tracking-wider rounded-full shadow-md border border-white flex items-center gap-0.5 z-20">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            LIVE
          </div>
          `
            : ''
        }
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg transition-transform duration-200 ${
          isSelected ? 'scale-125 ring-2 ring-brand-500 ring-offset-1 z-30' : 'hover:scale-110'
        }" style="background-color: ${catMeta.color};">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            ${getCategorySvgPath(event.category)}
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-event-marker-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <>
      {events.map((event) => {
        const isSelected = selectedEvent?.id === event.id;
        const icon = createEventIcon(event, isSelected);

        return (
          <Marker
            key={event.id}
            position={[event.coordinates.lat, event.coordinates.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onSelectEvent(event),
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -18]}
              opacity={0.96}
              className="custom-map-tooltip"
            >
              <div className="px-1.5 py-0.5 text-center space-y-0.5">
                <div className="flex items-center justify-center gap-1">
                  {event.status === 'live' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                  <span className="text-[10px] font-bold text-slate-800">
                    {event.title}
                  </span>
                </div>
                <div className="text-[9px] text-slate-500">
                  {event.locationName} • {event.creatorName}
                </div>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
};

function getCategorySvgPath(category: string): string {
  switch (category) {
    case 'concert':
      return '<path d="M9 18V5l12-2v13M9 9l12-2M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>';
    case 'party':
      return '<path d="M12 2l2.4 5 5.6.8-4 4 1 5.6-5-2.6-5 2.6 1-5.6-4-4 5.6-.8L12 2z"/>';
    case 'cultural':
      return '<path d="M2 10s3-3 5-3 5 3 5 3-3 3-5 3-5-3-5-3zm10 4s3-3 5-3 5 3 5 3-3 3-5 3-5-3-5-3z"/>';
    case 'workshop':
      return '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>';
    case 'sports':
      return '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1h10v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34M7 4h10v6a5 5 0 0 1-10 0V4Z"/>';
    case 'activity':
      return '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>';
    default:
      return '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>';
  }
}
