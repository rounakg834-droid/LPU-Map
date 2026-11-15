import { PublicCampusEvent, EventReport } from '../types/events';
import { eventService } from './eventService';

/**
 * Architecture re-export for backward compatibility with Phase 1 stubs.
 * Live functionality is now managed by eventService.
 */
export class EventServiceArchitecture {
  public static validateEventDuration(startTimeIso: string, endTimeIso: string) {
    const start = new Date(startTimeIso).getTime();
    const end = new Date(endTimeIso).getTime();
    if (isNaN(start) || isNaN(end)) return { isValid: false, error: 'Invalid start or end timestamp.' };
    if (end <= start) return { isValid: false, error: 'End time must be after start time.' };
    const durationMs = end - start;
    if (durationMs > 6 * 60 * 60 * 1000) {
      return { isValid: false, error: 'Campus events cannot exceed 6 hours in duration.' };
    }
    return { isValid: true };
  }

  public static sanitizeForPublic(event: PublicCampusEvent): PublicCampusEvent {
    return event;
  }

  public static filterActiveEvents(events: PublicCampusEvent[]): PublicCampusEvent[] {
    const now = Date.now();
    return events.filter((e) => {
      const endTime = new Date(e.endTime).getTime();
      return endTime > now && (e.status === 'live' || e.status === 'upcoming');
    });
  }

  public static createModerationReport(
    eventId: string,
    eventTitle: string,
    reason: EventReport['reason'],
    details?: string
  ): EventReport {
    return {
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventId,
      eventTitle,
      reason,
      details,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
  }
}

export { eventService };
