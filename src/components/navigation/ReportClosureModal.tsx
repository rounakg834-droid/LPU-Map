import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { roadClosureService } from '../../services/roadClosureService';

interface ReportClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportClosureModal: React.FC<ReportClosureModalProps> = ({ isOpen, onClose }) => {
  const [segmentDescription, setSegmentDescription] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!segmentDescription.trim() || !reason.trim()) {
      setError('Please provide the location description and reason for the blockage.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await roadClosureService.submitStudentReport({
        segmentDescription: segmentDescription.trim(),
        reason: reason.trim()
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSegmentDescription('');
        setReason('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-sm font-bold text-slate-800">Report Path Obstacle</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Report Submitted</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thank you. University administration will review the blockage report before updating campus navigation paths.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Blocked Campus Location</label>
              <input
                type="text"
                required
                value={segmentDescription}
                onChange={(e) => setSegmentDescription(e.target.value)}
                placeholder="e.g. Walkway between Block 34 and Central Library"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Reason / Obstacle Details</label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Tent construction, paving repair, or water logging preventing pedestrian passage"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 resize-none"
              />
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-snug">
              Reports are audited to prevent inaccurate routing disruptions.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Submitting...' : 'Submit to Admin Queue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
