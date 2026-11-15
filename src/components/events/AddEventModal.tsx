import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Image,
  User,
  GraduationCap,
} from 'lucide-react';
import { CreateEventInput, EventCategory, EVENT_CATEGORIES } from '../../types/events';
import { CAMPUS_LOCATIONS } from '../../data/locations';
import { eventService } from '../../services/eventService';
import { authService } from '../../services/authService';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocationId?: string;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  initialLocationId,
  onShowToast,
}) => {
  const currentUser = authService.getCurrentUser();

  // Student details
  const [fullName, setFullName] = useState<string>(currentUser?.fullName || '');
  const [course, setCourse] = useState<string>(currentUser?.course || '');
  const [yearOfStudy, setYearOfStudy] = useState<string>(currentUser?.yearOfStudy || '1st Year');

  // Event details
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<EventCategory>('cultural');
  const [description, setDescription] = useState<string>('');
  const [locationId, setLocationId] = useState<string>(initialLocationId || 'unipolis');
  const [imageUrl, setImageUrl] = useState<string>('');

  // Start time (default: rounded to next 30 mins)
  const [startDateTime, setStartDateTime] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    d.setMinutes(d.getMinutes() >= 30 ? 60 : 30, 0, 0);
    // Format to yyyy-MM-ddTHH:mm
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  // End time (default: start + 2 hours)
  const [endDateTime, setEndDateTime] = useState<string>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    d.setMinutes(d.getMinutes() >= 30 ? 60 : 30, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync initial location when modal opens
  useEffect(() => {
    if (initialLocationId) {
      setLocationId(initialLocationId);
    }
  }, [initialLocationId]);

  // Compute event duration
  const startMs = new Date(startDateTime).getTime();
  const endMs = new Date(endDateTime).getTime();
  const durationMs = endMs - startMs;
  const durationHours = durationMs / (1000 * 60 * 60);

  // Validate on change
  useEffect(() => {
    if (isNaN(startMs) || isNaN(endMs)) {
      setValidationError('Please select valid start and end dates.');
    } else if (endMs <= startMs) {
      setValidationError('Event end time must be after start time.');
    } else if (durationHours > 6) {
      setValidationError('Maximum event duration is 6 hours.');
    } else {
      setValidationError(null);
    }
  }, [startDateTime, endDateTime, startMs, endMs, durationHours]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const selectedLoc = CAMPUS_LOCATIONS.find((l) => l.id === locationId);
    if (!selectedLoc || !selectedLoc.coordinates) {
      setValidationError('Please choose a valid campus location.');
      return;
    }

    const payload: CreateEventInput = {
      title,
      category,
      description,
      locationId: selectedLoc.id,
      locationName: selectedLoc.shortName || selectedLoc.name,
      coordinates: selectedLoc.coordinates,
      startTime: new Date(startDateTime).toISOString(),
      endTime: new Date(endDateTime).toISOString(),
      imageUrl: imageUrl.trim() || undefined,
      studentFullName: fullName,
      studentCourse: course,
      studentYear: yearOfStudy,
    };

    setIsSubmitting(true);
    try {
      await eventService.createEvent(payload);
      onShowToast(`Event "${title}" published live on campus map!`, 'success');
      onClose();
    } catch (err) {
      setValidationError((err as Error).message || 'Failed to publish event');
      onShowToast((err as Error).message || 'Submission failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92dvh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-purple-700 to-brand-700 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">Post Campus Event</h3>
              <p className="text-[11px] text-purple-100">
                Share live & upcoming happenings across LPU campus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Privacy & Guidelines Banner */}
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200/80 text-xs text-purple-900 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Privacy Guaranteed</span>
              <p className="text-[11px] text-purple-800 leading-snug">
                Your Course and Year of Study are kept in a protected administrative record for campus security. Other students only see your display name.
              </p>
            </div>
          </div>

          {/* Student Profile Section */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Student Creator Identity (Required)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Course / Program *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech CSE / MBA"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                Year of Study *
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Postgraduate / PhD">Postgraduate / PhD</option>
              </select>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Event Details Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
              Event Details
            </h4>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. One World Cultural Fest, Hackathon 2026..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-600" />
                  Campus Location *
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  {CAMPUS_LOCATIONS.filter((l) => l.coordinates !== undefined).map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.shortName || loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Description & Agenda *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe what's happening, guest artists, rules, entry details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
              />
            </div>

            {/* Time Pickers (Asia/Kolkata) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-purple-600" />
                  Start Date & Time (IST) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-600" />
                  End Date & Time (IST) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Duration Feedback */}
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                durationHours > 0 && durationHours <= 6
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              <span className="font-medium">
                {durationHours > 0
                  ? `Duration: ${durationHours.toFixed(1)} hours (Max: 6.0 hours)`
                  : 'Invalid duration'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded">
                Asia/Kolkata
              </span>
            </div>

            {/* Optional Event Photo URL */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-slate-400" />
                Event Photo / Poster URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/event-poster.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(validationError)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publishing Event...' : 'Publish Campus Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
