import { useState, useEffect, useCallback } from 'react';

export function useDeviceOrientation() {
  const [heading, setHeading] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  const handleOrientation = useCallback((event: Event) => {
    const e = event as DeviceOrientationEvent;
    const iosEvent = e as unknown as { webkitCompassHeading?: number };
    if (typeof iosEvent.webkitCompassHeading === 'number') {
      setHeading(Math.round(iosEvent.webkitCompassHeading));
      setIsSupported(true);
    } else if (e.alpha !== null && e.alpha !== undefined) {
      const alpha = 360 - e.alpha;
      setHeading(Math.round(alpha % 360));
      setIsSupported(true);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const winRecord = window as unknown as Record<string, unknown>;
    const DeviceOrientation = winRecord.DeviceOrientationEvent as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    } | undefined;

    if (typeof DeviceOrientation?.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    } else {
      if ('ondeviceorientationabsolute' in winRecord) {
        window.addEventListener('deviceorientationabsolute' as unknown as keyof WindowEventMap, handleOrientation, true);
      } else if ('ondeviceorientation' in winRecord) {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
      return true;
    }
  }, [handleOrientation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const winRecord = window as unknown as Record<string, unknown>;
    const DeviceOrientation = winRecord.DeviceOrientationEvent as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    } | undefined;

    if (typeof DeviceOrientation?.requestPermission !== 'function') {
      if ('ondeviceorientationabsolute' in winRecord) {
        window.addEventListener('deviceorientationabsolute' as unknown as keyof WindowEventMap, handleOrientation, true);
      } else if ('ondeviceorientation' in winRecord) {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute' as unknown as keyof WindowEventMap, handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  return { heading, isSupported, requestPermission };
}
