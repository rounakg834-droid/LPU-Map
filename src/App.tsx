import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Router } from './router/Router';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NavigationMenuDrawer } from './components/common/NavigationMenuDrawer';
import { CampusMap } from './components/map/CampusMap';
import { Campus3DMap } from './components/map/Campus3DMap';
import { MapModeToggle, MapDisplayMode } from './components/map/MapModeToggle';
import { isWebGLSupported } from './utils/webglSupport';
import { SearchBar } from './components/search/SearchBar';
import { PlaceDetailsSheet } from './components/sheet/PlaceDetailsSheet';
import { EventDetailsSheet } from './components/sheet/EventDetailsSheet';
import { FriendDetailsSheet } from './components/sheet/FriendDetailsSheet';
import { SavedPlacesModal } from './components/sheet/SavedPlacesModal';
import { AddEventModal } from './components/events/AddEventModal';
import { EventsListModal } from './components/events/EventsListModal';
import { EventReportModal } from './components/events/EventReportModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { ShareLocationModal } from './components/sharing/ShareLocationModal';
import { ActiveShareBanner } from './components/sharing/ActiveShareBanner';
import { EmergencyModal } from './components/emergency/EmergencyModal';
import { QRScannerModal } from './components/qr/QRScannerModal';
import { ReportClosureModal } from './components/navigation/ReportClosureModal';
import { OfflineBanner } from './components/common/OfflineBanner';
import { NavigationTurnCard } from './components/navigation/NavigationTurnCard';
import { NavigationBottomBar } from './components/navigation/NavigationBottomBar';
import { NavigationStepsModal } from './components/navigation/NavigationStepsModal';
import { ErrorNotice } from './components/common/ErrorNotice';
import { Toast, ToastProps } from './components/common/Toast';
import { useGeolocation } from './hooks/useGeolocation';
import { useDeviceOrientation } from './hooks/useDeviceOrientation';
import { useSavedPlaces } from './hooks/useSavedPlaces';
import { CAMPUS_LOCATIONS } from './data/locations';
import { CampusLocation, LocationCategory } from './types/location';
import { NavigationMode, RoutePlan } from './types/navigation';
import { routingService } from './services/routingService';
import { eventService } from './services/eventService';
import { locationSharingService } from './services/locationSharingService';
import { roadClosureService } from './services/roadClosureService';
import { offlineService } from './services/offlineService';
import { isFirebaseConfigured } from './config/firebase';
import { PublicCampusEvent } from './types/events';
import { LiveLocationShare } from './types/locationSharing';
import { RoadClosure } from './types/roadClosure';

function CampusNavigatorView({ navigate }: { navigate: (path: string) => void }) {
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'all'>('all');
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState<boolean>(false);
  const [mapMode, setMapMode] = useState<MapDisplayMode>('2d');
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Navigation states
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [activeRoute, setActiveRoute] = useState<RoutePlan | null>(null);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState<number>(0);
  const [isStepsModalOpen, setIsStepsModalOpen] = useState<boolean>(false);
  const [selectedNavMode, setSelectedNavMode] = useState<NavigationMode>('walking');

  // Events states (Phase 4 Live Campus Events)
  const [events, setEvents] = useState<PublicCampusEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<PublicCampusEvent | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState<boolean>(false);
  const [addEventLocationId, setAddEventLocationId] = useState<string | undefined>(undefined);
  const [isEventsListModalOpen, setIsEventsListModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportingEvent, setReportingEvent] = useState<PublicCampusEvent | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Phase 5 & 7 States: Location Sharing & Meet My Friend
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [activeMyShare, setActiveMyShare] = useState<LiveLocationShare | null>(
    locationSharingService.getActiveBroadcast()
  );
  const [friendShare, setFriendShare] = useState<LiveLocationShare | null>(null);
  const [isFriendSheetOpen, setIsFriendSheetOpen] = useState<boolean>(true);
  const [isNavigatingToFriend, setIsNavigatingToFriend] = useState<boolean>(false);

  // Phase 5 States: Road Closures & Maintenance
  const [roadClosures, setRoadClosures] = useState<RoadClosure[]>([]);
  const [isReportClosureModalOpen, setIsReportClosureModalOpen] = useState<boolean>(false);

  // Phase 5 States: Emergency Assistance
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);

  // Phase 5 States: QR Campus Navigation
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [qrScannedLocation, setQrScannedLocation] = useState<CampusLocation | null>(null);
  const [qrInvalidLocationId, setQrInvalidLocationId] = useState<string | null>(null);

  // Phase 5 States: Network Offline/Online Status
  const [isOnline, setIsOnline] = useState<boolean>(offlineService.isCurrentlyOnline());

  // Geolocation hook
  const {
    position,
    status: geoStatus,
    errorMessage: geoError,
    warningMessage: geoWarning,
    isFollowing,
    setIsFollowing,
    recenter,
    clearError,
    startTracking,
  } = useGeolocation();

  // Device compass / orientation hook
  const { heading, requestPermission: requestOrientationPermission } = useDeviceOrientation();

  // Saved bookmarks hook
  const { savedIds, savedLocations, toggleSave, isSaved } = useSavedPlaces();

  // Toast dispatch
  const showToast = useCallback(
    (message: string, type: ToastProps['type'] = 'info') => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, type, onClose: removeToast }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 1. Subscribe to offline/online status (honestly report provider)
  const isInitialNetworkCheck = useRef(true);
  useEffect(() => {
    return offlineService.subscribe((online) => {
      setIsOnline(online);
      // Suppress noisy toast on first load; only notify when network changes
      if (isInitialNetworkCheck.current) {
        isInitialNetworkCheck.current = false;
        return;
      }
      if (!online) {
        showToast('Offline Mode: Campus directory, routing & GPS active', 'warning');
      } else {
        if (isFirebaseConfigured) {
          showToast('Online: Connected to Firebase Campus Cloud', 'info');
        } else {
          showToast('Online: Connected to Local Shared Campus Server', 'info');
        }
      }
    });
  }, [showToast]);

  // 2. Subscribe to real-time events synchronization (authoritative push)
  useEffect(() => {
    return eventService.subscribeToActiveEvents((active) => {
      setEvents(active);
      // Immediately close details card if the selected event was deleted by an admin
      setSelectedEvent((currentSelected) => {
        if (!currentSelected) return null;
        const stillActive = active.find((e) => e.id === currentSelected.id);
        return stillActive || null;
      });
    });
  }, []);

  // 3. Subscribe to active campus road closures
  useEffect(() => {
    return roadClosureService.subscribeToClosures((closures) => {
      setRoadClosures(closures.filter((c) => c.approvedByAdmin && c.status === 'active'));
    });
  }, []);

  // 4. Handle incoming URL parameters (?share=token and ?qr=locationId)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);

    // Meet My Friend: ?share=<token>
    const shareToken = params.get('share');
    if (shareToken) {
      showToast('Connecting to friend live GPS stream...', 'info');
      const unsub = locationSharingService.subscribeToFriendShare(
        shareToken,
        (friendData) => {
          if (!friendData) {
            showToast('Location share expired or not found', 'warning');
            setFriendShare(null);
            return;
          }
          setFriendShare(friendData);
          setIsFriendSheetOpen(true);
          if (friendData.revoked) {
            showToast(`${friendData.creatorDisplayName} stopped sharing location`, 'warning');
          }
        },
        (err) => {
          showToast(err, 'warning');
        }
      );
      return () => unsub();
    }

    // QR Campus Navigation: ?qr=<locationId>
    const qrParam = params.get('qr');
    if (qrParam) {
      const found = CAMPUS_LOCATIONS.find((l: CampusLocation) => l.id === qrParam.toLowerCase().trim());
      if (found) {
        setQrScannedLocation(found);
        setQrInvalidLocationId(null);
        setIsQrModalOpen(true);
        showToast(`QR Check-in: At ${found.name}`, 'success');
      } else {
        setQrScannedLocation(null);
        setQrInvalidLocationId(qrParam);
        setIsQrModalOpen(true);
      }
    }
  }, [showToast]);

  // 5. Update my active broadcasting location as GPS moves
  useEffect(() => {
    if (!activeMyShare || activeMyShare.revoked || !position) return;
    const now = Date.now();
    if (new Date(activeMyShare.expiresAt).getTime() <= now) {
      setActiveMyShare(null);
      return;
    }

    locationSharingService.updateShareCoords(activeMyShare.token, {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      speed: position.coords.speed
    });
  }, [activeMyShare, position]);

  // Filter locations by active category for map pins
  const displayedLocations = useMemo(() => {
    if (selectedCategory === 'all') {
      return CAMPUS_LOCATIONS;
    }
    return CAMPUS_LOCATIONS.filter((loc) => loc.category === selectedCategory);
  }, [selectedCategory]);

  const handleSelectLocation = useCallback(
    (loc: CampusLocation) => {
      if (isNavigating) return; // Do not switch place details during active navigation
      setSelectedLocation(loc);
      setSelectedEvent(null);
      setIsFollowing(false);
    },
    [isNavigating, setIsFollowing]
  );

  const handleSelectEvent = useCallback(
    (event: PublicCampusEvent) => {
      if (isNavigating) return;
      setSelectedEvent(event);
      setSelectedLocation(null);
      setIsFollowing(false);
    },
    [isNavigating, setIsFollowing]
  );

  const handleOpenAddEventFromLocation = useCallback((locId: string) => {
    setAddEventLocationId(locId);
    setIsAddEventModalOpen(true);
  }, []);

  const handleOpenReportModal = useCallback((event: PublicCampusEvent) => {
    setReportingEvent(event);
    setIsReportModalOpen(true);
  }, []);

  const handleRecenterGps = useCallback(() => {
    recenter();
    showToast('Centering on your location', 'info');
  }, [recenter, showToast]);

  const handleUserInteracted = useCallback(() => {
    if (isFollowing) {
      setIsFollowing(false);
    }
  }, [isFollowing, setIsFollowing]);

  const userCoords = position
    ? { lat: position.coords.latitude, lng: position.coords.longitude }
    : null;

  // Handle 2D / 3D Map Mode Transition
  const handleToggleMapMode = useCallback(
    (newMode: MapDisplayMode) => {
      if (newMode === '3d' && !isWebGLSupported()) {
        showToast('3D mode requires WebGL, which is unsupported on this device. Keeping 2D view.', 'warning');
        return;
      }
      setMapMode(newMode);
      showToast(
        newMode === '3d'
          ? '🏢 3D Explore: Tilt, rotate & view building extrusions'
          : '🗺️ 2D Navigation: Turn-by-turn routing & GPS guidance',
        'info'
      );
    },
    [showToast]
  );

  // Start live GPS navigation along calculated route
  const handleStartNavigation = useCallback(
    (plan: RoutePlan) => {
      setActiveRoute(plan);
      setCurrentInstructionIndex(0);
      setIsNavigating(true);
      setSelectedLocation(null);
      setSelectedEvent(null);
      setIsFollowing(true);
      startTracking();
      if (mapMode === '3d') {
        setMapMode('2d');
        showToast('Switched to 2D view for optimal turn-by-turn guidance', 'info');
      }
      showToast(
        `Navigation started to ${plan.destination.shortName || plan.destination.name}`,
        'success'
      );
    },
    [startTracking, showToast, setIsFollowing, mapMode]
  );

  // Stop active navigation
  const handleStopNavigation = useCallback(() => {
    setIsNavigating(false);
    setIsNavigatingToFriend(false);
    setActiveRoute(null);
    setIsStepsModalOpen(false);
    setCurrentInstructionIndex(0);
    showToast('Navigation ended', 'info');
  }, [showToast]);

  // Meet My Friend: Navigate Toward Friend
  const handleNavigateToFriend = useCallback(
    async (share: LiveLocationShare, mode: NavigationMode) => {
      if (!position) {
        showToast('Please enable device location to navigate toward friend', 'warning');
        startTracking();
        return;
      }

      const friendDest: CampusLocation = {
        id: `friend_${share.token}`,
        name: `${share.creatorDisplayName} (Friend)`,
        shortName: share.creatorDisplayName,
        category: 'administration',
        coordinates: {
          lat: share.coords.lat,
          lng: share.coords.lng
        },
        verificationStatus: 'verified_osm',
        isVerified: true,
        source: 'Live GPS Location Sharing',
        tags: ['friend', 'live_location'],
        description: share.note || 'Shared Live Location'
      };

      try {
        const plan = await routingService.calculateRoute(
          { lat: position.coords.latitude, lng: position.coords.longitude },
          friendDest,
          mode
        );
        if (plan.status === 'available') {
          handleStartNavigation(plan);
          setIsNavigatingToFriend(true);
        } else {
          showToast(plan.unreachableReason || 'Could not find path to friend', 'error');
        }
      } catch (e: any) {
        showToast(e?.message || 'Failed to calculate route to friend', 'error');
      }
    },
    [position, startTracking, handleStartNavigation, showToast]
  );

  // Dynamic Route Recalculation as Friend Moves in "Meet My Friend" Mode
  const lastFriendRecalc = useRef<number>(0);
  useEffect(() => {
    if (!isNavigatingToFriend || !friendShare || !position || !isNavigating) return;
    const now = Date.now();
    if (now - lastFriendRecalc.current < 10000) return; // 10s throttle

    const friendDest: CampusLocation = {
      id: `friend_${friendShare.token}`,
      name: `${friendShare.creatorDisplayName} (Friend)`,
      shortName: friendShare.creatorDisplayName,
      category: 'administration',
      coordinates: {
        lat: friendShare.coords.lat,
        lng: friendShare.coords.lng
      },
      verificationStatus: 'verified_osm',
      isVerified: true,
      source: 'Live GPS Location Sharing',
      tags: ['friend', 'live_location'],
      description: friendShare.note || 'Shared Live Location'
    };

    lastFriendRecalc.current = now;
    routingService
      .calculateRoute(
        { lat: position.coords.latitude, lng: position.coords.longitude },
        friendDest,
        selectedNavMode
      )
      .then((plan) => {
        if (plan.status === 'available') {
          setActiveRoute(plan);
        }
      });
  }, [friendShare?.coords?.lat, friendShare?.coords?.lng, isNavigatingToFriend, position, isNavigating, selectedNavMode]);

  // Handle friend stopping share while recipient is navigating toward them
  useEffect(() => {
    if (friendShare?.revoked && isNavigatingToFriend) {
      showToast(`${friendShare.creatorDisplayName} ended location sharing. Stopping navigation.`, 'warning');
      setIsNavigating(false);
      setIsNavigatingToFriend(false);
      setActiveRoute(null);
    }
  }, [friendShare?.revoked, friendShare?.creatorDisplayName, isNavigatingToFriend, showToast]);

  // Turn progress tracking: advance to next turn if user is within 15 meters of current maneuver waypoint
  useEffect(() => {
    if (!isNavigating || !activeRoute || !position) return;
    const instructions = activeRoute.instructions;
    if (currentInstructionIndex < instructions.length - 1) {
      const nextTurnCoords = instructions[currentInstructionIndex + 1].coordinates;
      const distToTurn = routingService.calculateStraightLineMeters(
        { lat: position.coords.latitude, lng: position.coords.longitude },
        nextTurnCoords
      );
      if (distToTurn <= 15) {
        setCurrentInstructionIndex((prev) => Math.min(prev + 1, instructions.length - 1));
      }
    }
  }, [isNavigating, activeRoute, position, currentInstructionIndex]);

  // Off-route dynamic recalculation
  const lastRecalculationTime = useRef<number>(0);
  const isRecalculating = useRef<boolean>(false);

  useEffect(() => {
    if (!isNavigating || !activeRoute || !position || isRecalculating.current) return;
    if (position.coords.accuracy > 35) return; // Ignore noisy GPS jitter

    const now = Date.now();
    if (now - lastRecalculationTime.current < 8000) return; // 8s debounce

    const userCoord = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    const distFromRoute = routingService.getDistanceFromRoute(
      userCoord,
      activeRoute.pathCoordinates
    );

    // If user is > 45 meters away from active path polyline within campus, recalculate
    if (distFromRoute > 45 && routingService.isWithinCampus(userCoord)) {
      isRecalculating.current = true;
      lastRecalculationTime.current = now;
      showToast('Off active route. Recalculating path...', 'info');

      routingService
        .calculateRoute(userCoord, activeRoute.destination, activeRoute.mode)
        .then((newPlan) => {
          if (newPlan.status === 'available') {
            setActiveRoute(newPlan);
            setCurrentInstructionIndex(0);
            showToast('Route updated from your location', 'success');
          }
        })
        .finally(() => {
          isRecalculating.current = false;
        });
    }
  }, [isNavigating, activeRoute, position, showToast]);

  // Real-time remaining metrics along actual route geometry
  const remainingDistanceMeters = useMemo(() => {
    if (!activeRoute) return 0;
    const userCoord = position
      ? { lat: position.coords.latitude, lng: position.coords.longitude }
      : null;
    return routingService.calculateRemainingDistance(
      userCoord,
      activeRoute,
      currentInstructionIndex
    );
  }, [activeRoute, position, currentInstructionIndex]);

  const remainingMinutes = useMemo(() => {
    if (!activeRoute) return 0;
    const speedKmh =
      activeRoute.mode === 'bike'
        ? 14
        : activeRoute.mode === 'car'
        ? 20
        : activeRoute.mode === 'wheelchair'
        ? 3.5
        : 4.5;
    const speedMps = (speedKmh * 1000) / 3600;
    return Math.max(1, Math.round(remainingDistanceMeters / speedMps / 60));
  }, [activeRoute, remainingDistanceMeters]);

  // Real GPS speed in km/h
  const speedKmh =
    position?.coords.speed !== null &&
    position?.coords.speed !== undefined &&
    position.coords.speed >= 0
      ? (position.coords.speed * 3600) / 1000
      : null;

  // Emergency: Navigate to Hospital
  const handleNavigateToHospital = useCallback(
    async (hospitalLoc: CampusLocation) => {
      try {
        const plan = await routingService.calculateRoute(userCoords, hospitalLoc, 'walking');
        if (plan.status === 'available') {
          handleStartNavigation(plan);
        } else {
          showToast(plan.unreachableReason || 'Hospital route unavailable', 'error');
        }
      } catch (err: any) {
        showToast(err?.message || 'Failed to route to UniHospital', 'error');
      }
    },
    [userCoords, handleStartNavigation, showToast]
  );

  return (
    <div className="relative w-full h-full h-screen-dvh overflow-hidden bg-slate-100 flex flex-col">
      {/* 2D Leaflet Campus Map OR 3D MapLibre WebGL Campus Map */}
      {mapMode === '2d' ? (
        <CampusMap
          locations={displayedLocations}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          userPosition={position}
          isFollowing={isFollowing}
          onUserInteracted={handleUserInteracted}
          onRecenterGps={handleRecenterGps}
          heading={heading}
          onRequestOrientationPermission={requestOrientationPermission}
          selectedCategory={selectedCategory}
          activeRoute={activeRoute}
          isNavigating={isNavigating}
          events={events}
          selectedEvent={selectedEvent}
          onSelectEvent={handleSelectEvent}
          onOpenEventsModal={() => setIsEventsListModalOpen(true)}
          onOpenAdminModal={() => navigate('/admin')}
          friendShare={friendShare}
          onSelectFriend={() => setIsFriendSheetOpen(true)}
          roadClosures={roadClosures}
          onSelectClosure={(closure) => {
            showToast(`⚠️ Closed: ${closure.title} - ${closure.reason}`, 'warning');
          }}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
          onOpenReportClosureModal={() => setIsReportClosureModalOpen(true)}
        />
      ) : (
        <Campus3DMap
          locations={displayedLocations}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          userPosition={position}
          heading={heading}
          selectedCategory={selectedCategory}
          activeRoute={activeRoute}
          isNavigating={isNavigating}
          events={events}
          selectedEvent={selectedEvent}
          onSelectEvent={handleSelectEvent}
          roadClosures={roadClosures}
          onRecenterGps={handleRecenterGps}
          friendShare={friendShare}
          onSelectFriend={() => setIsFriendSheetOpen(true)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
          onOpenEventsModal={() => setIsEventsListModalOpen(true)}
        />
      )}

      {/* Floating 2D / 3D Mode Selector Pill */}
      <div className="fixed top-28 left-3 sm:left-6 z-20 pointer-events-auto">
        <MapModeToggle
          mode={mapMode}
          onChangeMode={handleToggleMapMode}
        />
      </div>

      {/* Floating Active Location Broadcasting Indicator */}
      {activeMyShare && !activeMyShare.revoked && (
        <ActiveShareBanner
          share={activeMyShare}
          onStop={async () => {
            await locationSharingService.revokeShare(activeMyShare.token);
            setActiveMyShare(null);
            showToast('Stopped sharing your location', 'info');
          }}
          onOpenModal={() => setIsShareModalOpen(true)}
        />
      )}

      {/* Offline Status Banner */}
      <OfflineBanner isOnline={isOnline} />

      {/* Google Maps Style Navigation Menu Drawer */}
      <NavigationMenuDrawer
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        onNavigateHome={() => navigate('/')}
        onNavigateAdmin={() => navigate('/admin')}
        onOpenEvents={() => setIsEventsListModalOpen(true)}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        onOpenShareLocation={() => setIsShareModalOpen(true)}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenReportClosure={() => setIsReportClosureModalOpen(true)}
        savedCount={savedIds.length}
        isSharingActive={Boolean(activeMyShare && !activeMyShare.revoked)}
        mapMode={mapMode}
        onToggleMapMode={handleToggleMapMode}
      />

      {/* Floating Search Bar (hidden during active turn-by-turn navigation) */}
      {!isNavigating && (
        <SearchBar
          onSelectLocation={handleSelectLocation}
          onOpenSavedModal={() => setIsSavedModalOpen(true)}
          onOpenMenu={() => setIsNavMenuOpen(true)}
          savedCount={savedIds.length}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* GPS Error & Insecure Context Notice Banner */}
      {!isNavigating && (
        <div className="fixed top-28 inset-x-0 z-30 pointer-events-auto flex flex-col items-center">
          <div className="w-full max-w-lg">
            <ErrorNotice
              status={geoStatus}
              message={geoError || geoWarning}
              onDismiss={clearError}
              onRetry={startTracking}
            />
          </div>
        </div>
      )}

      {/* Active Navigation: Top Turn-by-Turn Maneuver Card */}
      {isNavigating && activeRoute && (
        <NavigationTurnCard
          currentInstruction={activeRoute.instructions[currentInstructionIndex] || null}
          nextInstruction={activeRoute.instructions[currentInstructionIndex + 1] || null}
          totalDistanceMeters={remainingDistanceMeters}
          destinationName={activeRoute.destination.shortName || activeRoute.destination.name}
        />
      )}

      {/* Active Navigation: Bottom Metrics Dashboard Bar */}
      {isNavigating && activeRoute && (
        <NavigationBottomBar
          remainingDistanceMeters={remainingDistanceMeters}
          remainingMinutes={remainingMinutes}
          speedKmh={speedKmh}
          mode={activeRoute.mode}
          isFollowing={isFollowing}
          onRecenter={handleRecenterGps}
          onStopNavigation={handleStopNavigation}
          onToggleDirectionsList={() => setIsStepsModalOpen(!isStepsModalOpen)}
          isListOpen={isStepsModalOpen}
        />
      )}

      {/* Turn-by-Turn Steps Modal */}
      {isNavigating && activeRoute && (
        <NavigationStepsModal
          isOpen={isStepsModalOpen}
          onClose={() => setIsStepsModalOpen(false)}
          instructions={activeRoute.instructions}
          destinationName={activeRoute.destination.shortName || activeRoute.destination.name}
        />
      )}

      {/* Bottom Sheet for Selected Campus Place Details */}
      {!isNavigating && selectedLocation && (
        <PlaceDetailsSheet
          location={selectedLocation}
          isSaved={isSaved(selectedLocation.id)}
          onToggleSave={toggleSave}
          onClose={() => setSelectedLocation(null)}
          userCoords={userCoords}
          onShowToast={showToast}
          onStartNavigation={handleStartNavigation}
          onRequestGps={startTracking}
          onAddEvent={handleOpenAddEventFromLocation}
        />
      )}

      {/* Bottom Sheet for Selected Campus Event Details */}
      {!isNavigating && selectedEvent && (
        <EventDetailsSheet
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          userCoords={userCoords}
          onShowToast={showToast}
          onStartNavigation={handleStartNavigation}
          onRequestGps={startTracking}
          onOpenReportModal={handleOpenReportModal}
        />
      )}

      {/* Friend Details Sheet (Meet My Friend - Phase 7) */}
      {!isNavigating && friendShare && isFriendSheetOpen && (
        <FriendDetailsSheet
          friendShare={friendShare}
          onClose={() => setIsFriendSheetOpen(false)}
          onNavigateToFriend={handleNavigateToFriend}
          selectedMode={selectedNavMode}
          onSelectMode={setSelectedNavMode}
          isNavigating={isNavigatingToFriend}
        />
      )}

      {/* Share Location Modal (WhatsApp & Duration) */}
      <ShareLocationModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        currentCoords={
          position
            ? {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                heading: position.coords.heading,
                speed: position.coords.speed
              }
            : null
        }
        activeShare={activeMyShare}
        onShareStarted={(share) => {
          setActiveMyShare(share);
          showToast('Live location sharing activated', 'success');
        }}
        onShareStopped={() => {
          setActiveMyShare(null);
          showToast('Location sharing stopped', 'info');
        }}
      />

      {/* Emergency Assistance Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        currentCoords={userCoords}
        onNavigateToHospital={handleNavigateToHospital}
      />

      {/* QR Campus Navigation Check-in Modal */}
      <QRScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        scannedLocation={qrScannedLocation}
        invalidLocationId={qrInvalidLocationId}
        onSelectDestination={async (dest) => {
          if (!qrScannedLocation || !dest.coordinates || !qrScannedLocation.coordinates) return;
          try {
            const plan = await routingService.calculateRoute(
              qrScannedLocation.coordinates,
              dest,
              'walking'
            );
            if (plan.status === 'available') {
              handleStartNavigation(plan);
            } else {
              showToast(plan.unreachableReason || 'Path unavailable', 'warning');
            }
          } catch (e: any) {
            showToast(e?.message || 'Route calculation failed', 'error');
          }
        }}
      />

      {/* Student Report Path Obstacle Modal */}
      <ReportClosureModal
        isOpen={isReportClosureModalOpen}
        onClose={() => setIsReportClosureModalOpen(false)}
      />

      {/* Saved Places Modal */}
      <SavedPlacesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedLocations={savedLocations}
        onSelectLocation={handleSelectLocation}
        onRemoveSaved={toggleSave}
      />

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => {
          setIsAddEventModalOpen(false);
          setAddEventLocationId(undefined);
        }}
        initialLocationId={addEventLocationId}
        onShowToast={showToast}
      />

      {/* Events Browser List Modal */}
      <EventsListModal
        isOpen={isEventsListModalOpen}
        onClose={() => setIsEventsListModalOpen(false)}
        events={events}
        onSelectEvent={handleSelectEvent}
        onOpenAddModal={() => setIsAddEventModalOpen(true)}
      />

      {/* Event Report Modal */}
      <EventReportModal
        event={reportingEvent}
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportingEvent(null);
        }}
        onShowToast={showToast}
      />

      {/* Secure Admin Dashboard Console */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Notification Toast Stack */}
      <div className="fixed top-20 inset-x-0 z-50 pointer-events-none flex flex-col items-center space-y-2 px-4">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full max-w-sm">
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      {({ path, navigate }) => {
        if (path === '/admin' || path.startsWith('/admin')) {
          return <AdminDashboardPage onNavigateHome={() => navigate('/')} />;
        }
        return <CampusNavigatorView navigate={navigate} />;
      }}
    </Router>
  );
}
