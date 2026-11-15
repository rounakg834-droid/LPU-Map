import React from 'react';
import { AlertTriangle, Lock, MapPinOff, X } from 'lucide-react';
import { GeolocationStatus } from '../../types/navigation';

interface ErrorNoticeProps {
  status: GeolocationStatus;
  message: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const ErrorNotice: React.FC<ErrorNoticeProps> = ({
  status,
  message,
  onDismiss,
  onRetry,
}) => {
  if (!message || status === 'idle' || status === 'granted' || status === 'requesting') {
    return null;
  }

  const isHttpsNotice = status === 'insecure_context';
  const isDenied = status === 'denied';

  return (
    <div className="mx-4 mt-2 p-3 bg-amber-50/95 border border-amber-200 text-amber-900 rounded-2xl shadow-md text-xs sm:text-sm flex items-start gap-2.5 backdrop-blur-sm z-30 transition-all">
      <div className="p-1.5 bg-amber-100 rounded-lg text-amber-800 flex-shrink-0 mt-0.5">
        {isHttpsNotice ? (
          <Lock className="w-4 h-4" />
        ) : isDenied ? (
          <MapPinOff className="w-4 h-4" />
        ) : (
          <AlertTriangle className="w-4 h-4" />
        )}
      </div>

      <div className="flex-1 space-y-1">
        <div className="font-semibold text-amber-950 flex items-center justify-between">
          <span>
            {isHttpsNotice
              ? 'HTTPS Required for Mobile GPS'
              : isDenied
              ? 'Location Permission Needed'
              : 'GPS Notice'}
          </span>
        </div>
        <p className="text-amber-800 leading-relaxed">{message}</p>
        {isHttpsNotice && (
          <p className="text-[11px] text-amber-700/90 pt-1">
            Browser security rules require HTTPS to share device GPS. Test on localhost or host behind an SSL/HTTPS proxy.
          </p>
        )}
        {onRetry && !isHttpsNotice && (
          <button
            onClick={onRetry}
            className="mt-1 inline-flex items-center text-xs font-semibold text-brand-700 hover:text-brand-800 underline active:opacity-70"
          >
            Try GPS again
          </button>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="p-1 rounded-lg text-amber-700 hover:bg-amber-100/80 active:scale-95 transition"
        aria-label="Dismiss error notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
