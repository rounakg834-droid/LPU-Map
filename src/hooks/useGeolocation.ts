import { useState, useEffect, useCallback, useRef } from 'react';
import { GeolocationStatus, GeoPosition } from '../types/navigation';
import { geolocationService } from '../services/geolocation';

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  const clearCurrentWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      geolocationService.stopTracking();
      watchIdRef.current = null;
    }
  }, []);

  const startTracking = useCallback(() => {
    clearCurrentWatch();
    setStatus('requesting');
    setErrorMessage(null);
    setWarningMessage(null);

    const id = geolocationService.startTracking({
      onSuccess: (newPos) => {
        setPosition(newPos);
        setStatus('granted');
        setErrorMessage(null);
      },
      onError: (errStatus, message) => {
        setStatus(errStatus);
        setErrorMessage(message);
        clearCurrentWatch();
      },
      onWarning: (_warnStatus, message) => {
        setWarningMessage(message);
      },
    });

    watchIdRef.current = id;
  }, [clearCurrentWatch]);

  const stopTracking = useCallback(() => {
    clearCurrentWatch();
    setIsFollowing(false);
  }, [clearCurrentWatch]);

  const recenter = useCallback(() => {
    if (position) {
      setIsFollowing(true);
    } else {
      startTracking();
      setIsFollowing(true);
    }
  }, [position, startTracking]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      clearCurrentWatch();
    };
  }, [clearCurrentWatch]);

  return {
    position,
    status,
    errorMessage,
    warningMessage,
    isFollowing,
    isTracking: watchIdRef.current !== null,
    startTracking,
    stopTracking,
    setIsFollowing,
    recenter,
    clearError: () => setErrorMessage(null),
    clearWarning: () => setWarningMessage(null),
  };
}
