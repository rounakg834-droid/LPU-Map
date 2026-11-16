import React, { useState, useMemo } from 'react';
import {
  Compass,
  GitBranch,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Upload,
  Search,
  Filter,
  Edit2,
  Save,
  X,
  History,
  MapPin,
  Play,
  Activity,
} from 'lucide-react';
import {
  roadNetworkService,
  NetworkDiagnosticReport,
  RoadAuditLogEntry,
} from '../../services/roadNetworkService';
import {
  CampusRoadSegment,
  RoadCategory,
  RoadSurface,
  WheelchairRating,
} from '../../data/campusRoadNetwork';
import { NavigationMode } from '../../types/navigation';
import { routingService } from '../../services/routingService';

interface CampusRoadManagerTabProps {
  onShowToast: (message: string) => void;
}

export const CampusRoadManagerTab: React.FC<CampusRoadManagerTabProps> = ({ onShowToast }) => {
  const [report, setReport] = useState<NetworkDiagnosticReport>(() => roadNetworkService.getDiagnosticReport());
  const [segments, setSegments] = useState<CampusRoadSegment[]>(() => roadNetworkService.getSegments());
  const [auditLog, setAuditLog] = useState<RoadAuditLogEntry[]>(() => roadNetworkService.getAuditLog());
  const [snapshots, setSnapshots] = useState(() => roadNetworkService.getSnapshots());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [componentFilter, setComponentFilter] = useState<string>('all');
  const [collisionFilter, setCollisionFilter] = useState<boolean>(false);

  // Modals
  const [editingSegment, setEditingSegment] = useState<CampusRoadSegment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Form States - Add New Segment
  const [newSegName, setNewSegName] = useState('');
  const [newSegFrom, setNewSegFrom] = useState('');
  const [newSegTo, setNewSegTo] = useState('');
  const [newSegCategory, setNewSegCategory] = useState<RoadCategory>('footpath');
  const [newSegSurface, setNewSegSurface] = useState<RoadSurface>('paver_blocks');
  const [newSegModes, setNewSegModes] = useState<NavigationMode[]>(['walking', 'bike']);
  const [newSegWheelchair, setNewSegWheelchair] = useState<WheelchairRating>('unverified');
  const [newSegCoordsText, setNewSegCoordsText] = useState('');

  // Form States - Import GPX/GeoJSON
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState<'geojson' | 'gpx'>('geojson');

  // Form States - Connect Nodes
  const [connectNodeA, setConnectNodeA] = useState('');
  const [connectNodeB, setConnectNodeB] = useState('');
  const [connectName, setConnectName] = useState('');
  const [connectCategory, setConnectCategory] = useState<RoadCategory>('footpath');

  // Form States - Publish Version
  const [publishVersionName, setPublishVersionName] = useState('v2.1.0-survey');
  const [publishNotes, setPublishNotes] = useState('');

  // Automated Route Audit test runner state
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditTestResults, setAuditTestResults] = useState<Array<{
    name: string;
    mode: NavigationMode;
    status: string;
    distance: number;
    notes: string;
  }> | null>(null);

  const refreshData = () => {
    setReport(roadNetworkService.getDiagnosticReport());
    setSegments([...roadNetworkService.getSegments()]);
    setAuditLog(roadNetworkService.getAuditLog());
    setSnapshots(roadNetworkService.getSnapshots());
    routingService.refreshGraph();
  };

  // Filtered Segments
  const filteredSegments = useMemo(() => {
    return segments.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.wayId.toLowerCase().includes(q) ||
          s.fromNode.toLowerCase().includes(q) ||
          s.toNode.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
      if (modeFilter !== 'all' && !s.allowedModes.includes(modeFilter as NavigationMode)) return false;
      if (componentFilter === 'connected' && s.componentId !== 1) return false;
      if (componentFilter === 'disconnected' && s.componentId === 1) return false;
      if (collisionFilter && !s.buildingCollision?.collides) return false;
      return true;
    });
  }, [segments, searchQuery, categoryFilter, modeFilter, componentFilter, collisionFilter]);

  // Handle Save Segment Edit
  const handleSaveEdit = () => {
    if (!editingSegment) return;
    try {
      roadNetworkService.updateSegment(editingSegment.id, {
        name: editingSegment.name,
        category: editingSegment.category,
        surface: editingSegment.surface,
        allowedModes: editingSegment.allowedModes,
        wheelchairStatus: editingSegment.wheelchairStatus,
        speedLimitKmh: editingSegment.speedLimitKmh,
      });
      onShowToast(`Segment "${editingSegment.name}" updated successfully.`);
      setEditingSegment(null);
      refreshData();
    } catch (e: any) {
      onShowToast(`Update failed: ${e.message}`);
    }
  };

  // Handle Add Surveyed Segment
  const handleAddSegment = () => {
    if (!newSegName || !newSegFrom || !newSegTo) {
      onShowToast('Please specify segment name, start node, and end node.');
      return;
    }

    try {
      let geometry: Array<{ lat: number; lng: number }> = [];
      if (newSegCoordsText.trim()) {
        const lines = newSegCoordsText.trim().split('\n');
        for (const line of lines) {
          const parts = line.split(/[,\s]+/).map(Number);
          if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            geometry.push({ lat: parts[0], lng: parts[1] });
          }
        }
      }

      if (geometry.length < 2) {
        const nodeA = roadNetworkService.getNodes()[newSegFrom];
        const nodeB = roadNetworkService.getNodes()[newSegTo];
        if (nodeA && nodeB) {
          geometry = [nodeA.coords, nodeB.coords];
        } else {
          onShowToast('Provide valid coordinates or select existing node IDs.');
          return;
        }
      }

      roadNetworkService.addSurveyedSegment({
        wayId: `survey_${Date.now()}`,
        name: newSegName,
        highwayType: newSegCategory === 'main_road' ? 'tertiary' : 'footway',
        category: newSegCategory,
        surface: newSegSurface,
        fromNode: newSegFrom,
        toNode: newSegTo,
        distanceMeters: 0,
        geometry,
        isOneWay: false,
        allowedModes: newSegModes,
        wheelchairStatus: newSegWheelchair,
        speedLimitKmh: newSegCategory === 'main_road' ? 25 : 5,
        source: 'survey',
        isVerified: true,
        verificationSource: 'Field Survey Verified Connection',
      });

      onShowToast(`Surveyed segment "${newSegName}" added.`);
      setIsAddModalOpen(false);
      setNewSegName('');
      setNewSegCoordsText('');
      refreshData();
    } catch (e: any) {
      onShowToast(`Error adding segment: ${e.message}`);
    }
  };

  // Handle Connect Intersections
  const handleConnect = () => {
    if (!connectNodeA || !connectNodeB) {
      onShowToast('Please select both intersection nodes.');
      return;
    }
    try {
      roadNetworkService.connectIntersections(connectNodeA, connectNodeB, {
        name: connectName || 'Verified Intersection Connection',
        category: connectCategory,
        modes: ['walking', 'bike'],
        surface: 'paver_blocks',
        wheelchairStatus: 'verified_accessible',
      });
      onShowToast('Intersections connected successfully.');
      setIsConnectModalOpen(false);
      refreshData();
    } catch (e: any) {
      onShowToast(`Connection failed: ${e.message}`);
    }
  };

  // Handle Import GPX/GeoJSON
  const handleImport = () => {
    if (!importText.trim()) {
      onShowToast('Please paste GPX or GeoJSON data.');
      return;
    }
    try {
      let coords: Array<{ lat: number; lng: number }> = [];
      if (importFormat === 'geojson') {
        const parsed = JSON.parse(importText);
        const feature = parsed.features ? parsed.features[0] : parsed;
        const rawCoords = feature.geometry?.coordinates || [];
        coords = rawCoords.map((c: number[]) => ({ lat: c[1], lng: c[0] }));
      } else {
        const regex = /lat="([^"]+)"\s+lon="([^"]+)"/g;
        let m;
        while ((m = regex.exec(importText)) !== null) {
          coords.push({ lat: parseFloat(m[1]), lng: parseFloat(m[2]) });
        }
      }

      if (coords.length < 2) {
        onShowToast('Could not extract at least 2 valid coordinates from file.');
        return;
      }

      const fromNode = `node_imp_${Date.now()}_0`;
      const toNode = `node_imp_${Date.now()}_1`;

      roadNetworkService.addSurveyedSegment({
        wayId: `import_${Date.now()}`,
        name: `Imported GPS Track (${coords.length} pts)`,
        highwayType: 'footway',
        category: 'footpath',
        surface: 'concrete',
        fromNode,
        toNode,
        distanceMeters: 0,
        geometry: coords,
        isOneWay: false,
        allowedModes: ['walking', 'bike'],
        wheelchairStatus: 'unverified',
        speedLimitKmh: 5,
        source: 'survey',
        isVerified: true,
        verificationSource: `GPS Trace Import (${importFormat.toUpperCase()})`,
      });

      onShowToast(`Successfully imported GPS track with ${coords.length} coordinates.`);
      setIsImportModalOpen(false);
      setImportText('');
      refreshData();
    } catch (e: any) {
      onShowToast(`Import failed: ${e.message}`);
    }
  };

  // Handle Publish Version
  const handlePublish = () => {
    if (!publishVersionName) return;
    try {
      roadNetworkService.publishVersion(publishVersionName, publishNotes);
      onShowToast(`Version ${publishVersionName} published and snapshot saved.`);
      setIsPublishModalOpen(false);
      refreshData();
    } catch (e: any) {
      onShowToast(`Publish failed: ${e.message}`);
    }
  };

  // Run Route Quality Audit Tests
  const handleRunRoutingAudit = async () => {
    setIsRunningAudit(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const testCases: Array<{ name: string; targetId: string; mode: NavigationMode }> = [
        { name: 'Gate 1 to Central Library', targetId: 'central-library', mode: 'walking' },
        { name: 'Gate 1 to UniMall Plaza', targetId: 'unimall', mode: 'walking' },
        { name: 'Gate 1 to UniHospital Arterial', targetId: 'unihospital', mode: 'car' },
        { name: 'Gate 1 to Baldev Raj Mittal Unipolis', targetId: 'unipolis', mode: 'bike' },
        { name: 'Gate 1 to Block 30 Executive Block', targetId: 'block-30-admin', mode: 'wheelchair' },
        { name: 'Gate 1 to Building 41 (Pending Survey)', targetId: 'building-41', mode: 'walking' },
      ];

      const results = [];
      const origin = { lat: 31.252276, lng: 75.702225 }; // Gate 1

      for (const tc of testCases) {
        const dummyLocation: any = {
          id: tc.targetId,
          name: tc.name,
          category: 'academic',
          coordinates: origin,
        };

        if (tc.targetId === 'central-library') {
          dummyLocation.entranceCoordinates = { lat: 31.252932, lng: 75.703953 };
        } else if (tc.targetId === 'unimall') {
          dummyLocation.entranceCoordinates = { lat: 31.255365, lng: 75.705853 };
        } else if (tc.targetId === 'unihospital') {
          dummyLocation.entranceCoordinates = { lat: 31.253677, lng: 75.705282 };
        } else if (tc.targetId === 'unipolis') {
          dummyLocation.entranceCoordinates = { lat: 31.255523, lng: 75.703755 };
        } else if (tc.targetId === 'block-30-admin') {
          dummyLocation.entranceCoordinates = { lat: 31.252935, lng: 75.702705 };
        } else if (tc.targetId === 'building-41') {
          dummyLocation.entranceCoordinates = { lat: 31.251697, lng: 75.701877 };
          dummyLocation.isEntranceConfirmed = false;
        }

        const plan = await routingService.calculateRoute(origin, dummyLocation, tc.mode);
        results.push({
          name: tc.name,
          mode: tc.mode,
          status: plan.status,
          distance: plan.distanceMeters,
          notes: plan.unreachableReason || plan.notes || 'Verified route computed successfully',
        });
      }

      setAuditTestResults(results);
      onShowToast('Automated routing network audit completed.');
    } finally {
      setIsRunningAudit(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-950/80 text-brand-400 border border-brand-800 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Campus Road Network Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Authoritative 2D Road Network &amp; Editor</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active Graph: {report.totalSegments} Segments
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage OpenStreetMap 2D road geometry, detect disconnected paths, enforce multimodal transit policies, and publish verified updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRunRoutingAudit}
            disabled={isRunningAudit}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            {isRunningAudit ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Run Routing Audit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-brand-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Survey Path</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 border border-slate-700"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import GPX / GeoJSON</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPublishModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-indigo-600/20"
          >
            <History className="w-3.5 h-3.5" />
            <span>Publish Version</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Segments</span>
          <div className="text-2xl font-black text-white">{report.totalSegments}</div>
          <div className="text-[11px] text-slate-400">153 OSM highway ways</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Intersections</span>
          <div className="text-2xl font-black text-emerald-400">{report.totalIntersections}</div>
          <div className="text-[11px] text-slate-400">Connected junctions</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Total Length</span>
          <div className="text-2xl font-black text-cyan-400">{report.totalLengthKm} km</div>
          <div className="text-[11px] text-slate-400">{report.totalLengthMeters.toLocaleString()} meters mapped</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Components</span>
          <div className="text-2xl font-black text-indigo-400">{report.connectedComponentsCount}</div>
          <div className="text-[11px] text-slate-400">Main: {report.mainComponentSize} segs</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Disconnected</span>
          <div className="text-2xl font-black text-amber-400">{report.disconnectedSegmentsCount}</div>
          <div className="text-[11px] text-slate-400">Require field survey</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Building Collisions</span>
          <div className="text-2xl font-black text-rose-400">{report.buildingCollisionsCount}</div>
          <div className="text-[11px] text-slate-400">OSM footprint crossings</div>
        </div>
      </div>

      {/* Critical Diagnostics & Integrity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Disconnected Paths Diagnostic */}
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Disconnected Graph Components ({report.disconnectedComponents.length} Isolated Clusters)</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold underline"
            >
              Connect Junctions
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Per GIS network integrity rules, visually crossing paths are not assumed connected without an explicit junction node. The following road ways are currently disconnected from the main campus network:
          </p>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {report.disconnectedComponents.map((c) => (
              <div key={c.componentId} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Component #{c.componentId} ({c.segmentCount} segments, {c.nodeCount} nodes)</div>
                  <div className="text-[10px] text-slate-400">
                    Ways: {c.ways.join(', ')} · {c.segmentNames.slice(0, 2).join(', ')}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                  Survey Required
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Building 41 Integrity Card */}
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Building 41 Entrance Status &amp; Connection Policy</span>
          </h3>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Field-Identified Entrance Coordinates:</span>
              <span className="font-mono text-emerald-400 font-bold">31.251697, 75.701877</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Distance to Nearest OSM Highway:</span>
              <span className="font-mono text-white font-bold">{report.building41Status.distanceToNearestRoadMeters} meters</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Nearest OSM Highway Node:</span>
              <span className="font-mono text-slate-300">{report.building41Status.nearestRoadNodeId} (Footway 1550425051)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Verified Path Connection:</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                Pending Ground Survey
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800">
              {report.building41Status.recommendation} In accordance with transportation network engineering standards, straight-line shortcuts are strictly barred from public routing until verified.
            </p>
          </div>
        </div>

        {/* Sh. Baldevraj Mittal Auditorium Location Card */}
        <div className="p-5 bg-slate-950 border border-purple-900/50 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span>Sh. Baldevraj Mittal Auditorium (Auditorium &amp; Events)</span>
            </h3>
            <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800 uppercase">
              User-Supplied Coords
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">User-Supplied Coordinates:</span>
              <span className="font-mono text-purple-400 font-bold">31.258514, 75.707878</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Nearest OSM Highway Segment:</span>
              <span className="font-mono text-white font-bold">
                {report.roadVerificationPointStatus.nearestRoadSegmentName} (Way {report.roadVerificationPointStatus.nearestRoadSegmentWayId}) — {report.roadVerificationPointStatus.distanceToNearestRoadMeters}m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Nearest Junction Node:</span>
              <span className="font-mono text-emerald-400 font-bold">
                Node {report.roadVerificationPointStatus.nearestJunctionNodeId} ({report.roadVerificationPointStatus.nearestJunctionDegree}-Way Intersection) — {report.roadVerificationPointStatus.distanceToNearestJunctionMeters}m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Distance to LPU Main Gate Candidate:</span>
              <span className="font-mono text-slate-300">
                {report.roadVerificationPointStatus.distanceToMainGateMeters} meters North-West
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Access Connection Status:</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                Pending Ground Access Verification
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800">
              {report.roadVerificationPointStatus.policyNote}
            </p>
          </div>
        </div>
      </div>

      {/* Automated Routing Audit Results (if executed) */}
      {auditTestResults && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Automated Route Graph Validation Report</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-bold">
              {auditTestResults.filter((r) => r.status === 'available').length} Available / {auditTestResults.length} Cases
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="p-3">Destination Test Case</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Calculated Distance</th>
                  <th className="p-3">Diagnostic Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditTestResults.map((res, i) => (
                  <tr key={i} className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">{res.name}</td>
                    <td className="p-3 capitalize">{res.mode}</td>
                    <td className="p-3">
                      {res.status === 'available' ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          Route Resolved
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                          {res.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono">{res.distance > 0 ? `${res.distance} m` : '—'}</td>
                    <td className="p-3 text-[11px] text-slate-400">{res.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Road Segments Browser & Manager */}
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>Campus Road Segments Registry</span>
            </h3>
            <p className="text-xs text-slate-400">
              Showing {filteredSegments.length} of {segments.length} verified segments in the active routing graph.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, or way..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="main_road">Main Roads</option>
            <option value="internal_vehicle">Internal Roads</option>
            <option value="service">Service Lanes</option>
            <option value="pedestrian_walkway">Pedestrian Walkways</option>
            <option value="footpath">Footpaths</option>
          </select>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Modes</option>
            <option value="walking">Walking Permitted</option>
            <option value="bike">Cycling Permitted</option>
            <option value="car">Vehicular Access</option>
            <option value="wheelchair">Wheelchair Accessible</option>
          </select>

          <select
            value={componentFilter}
            onChange={(e) => setComponentFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Components</option>
            <option value="connected">Main Connected Component</option>
            <option value="disconnected">Disconnected Clusters Only</option>
          </select>

          <button
            type="button"
            onClick={() => setCollisionFilter((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              collisionFilter
                ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Building Crossings ({report.buildingCollisionsCount})
          </button>
        </div>

        {/* Segments Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="p-3">Segment Name &amp; ID</th>
                <th className="p-3">Category / Surface</th>
                <th className="p-3">Length</th>
                <th className="p-3">Modes Allowed</th>
                <th className="p-3">Wheelchair</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredSegments.slice(0, 50).map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-3">
                    <div className="font-bold text-white">{s.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      OSM Way {s.wayId} · {s.id}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="capitalize font-semibold text-slate-300">{s.category.replace('_', ' ')}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{s.surface.replace('_', ' ')}</div>
                  </td>

                  <td className="p-3 font-mono font-semibold">{s.distanceMeters} m</td>

                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {s.allowedModes.map((m) => (
                        <span key={m} className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-800 text-slate-300 capitalize">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-3">
                    {s.wheelchairStatus === 'verified_accessible' ? (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                        Step-Free
                      </span>
                    ) : s.wheelchairStatus === 'inaccessible' ? (
                      <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800">
                        Barred (Steps)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Unverified</span>
                    )}
                  </td>

                  <td className="p-3">
                    {s.componentId === 1 ? (
                      <span className="text-[10px] text-emerald-400 font-semibold">Connected</span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-semibold">Cluster #{s.componentId}</span>
                    )}
                    {s.buildingCollision?.collides && (
                      <div className="text-[9px] text-rose-400 font-bold">Footprint Crossing</div>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditingSegment({ ...s })}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold inline-flex items-center gap-1 transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSegments.length > 50 && (
            <div className="p-2.5 text-center text-[11px] text-slate-500 bg-slate-900 border-t border-slate-800">
              Showing first 50 results. Use search or filters above to refine.
            </div>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-brand-400" />
          <span>Road Network Modification Audit Trail</span>
        </h3>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {auditLog.map((log) => (
            <div key={log.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-slate-500 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="font-semibold text-white mr-2">[{log.adminEmail}]</span>
                <span className="text-slate-300">{log.details}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                {log.action.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL 1: EDIT ROAD SEGMENT --- */}
      {editingSegment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-400" />
                <span>Edit Road Segment ({editingSegment.id})</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingSegment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Segment Name</label>
                <input
                  type="text"
                  value={editingSegment.name}
                  onChange={(e) => setEditingSegment({ ...editingSegment, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Road Category</label>
                  <select
                    value={editingSegment.category}
                    onChange={(e) => setEditingSegment({ ...editingSegment, category: e.target.value as RoadCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  >
                    <option value="main_road">Main Road</option>
                    <option value="internal_vehicle">Internal Road</option>
                    <option value="service">Service Lane</option>
                    <option value="pedestrian_walkway">Pedestrian Walkway</option>
                    <option value="footpath">Footpath</option>
                    <option value="cycle_lane">Cycle Lane</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Surface Material</label>
                  <select
                    value={editingSegment.surface}
                    onChange={(e) => setEditingSegment({ ...editingSegment, surface: e.target.value as RoadSurface })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  >
                    <option value="paved_asphalt">Paved Asphalt</option>
                    <option value="paver_blocks">Paver Blocks</option>
                    <option value="concrete">Concrete</option>
                    <option value="gravel">Gravel</option>
                    <option value="unpaved">Unpaved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Wheelchair Accessibility</label>
                <select
                  value={editingSegment.wheelchairStatus}
                  onChange={(e) => setEditingSegment({ ...editingSegment, wheelchairStatus: e.target.value as WheelchairRating })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="verified_accessible">Verified Step-Free Accessible</option>
                  <option value="unverified">Unverified (Requires Physical Survey)</option>
                  <option value="inaccessible">Inaccessible / Physical Steps Present</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Permitted Travel Modes</label>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  {(['walking', 'bike', 'car', 'wheelchair'] as NavigationMode[]).map((mode) => (
                    <label key={mode} className="flex items-center gap-2 cursor-pointer capitalize text-slate-300">
                      <input
                        type="checkbox"
                        checked={editingSegment.allowedModes.includes(mode)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...editingSegment.allowedModes, mode]
                            : editingSegment.allowedModes.filter((m) => m !== mode);
                          setEditingSegment({ ...editingSegment, allowedModes: updated });
                        }}
                        className="rounded border-slate-700 bg-slate-800 text-brand-500"
                      />
                      <span>{mode}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingSegment(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-600/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD SURVEY PATH --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-400" />
                <span>Add Independently Field-Surveyed Path</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Path / Sidewalk Name</label>
                <input
                  type="text"
                  placeholder="e.g. Building 41 Entrance Sidewalk Connection"
                  value={newSegName}
                  onChange={(e) => setNewSegName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Start Node ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 14101706193"
                    value={newSegFrom}
                    onChange={(e) => setNewSegFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">End Node ID</label>
                  <input
                    type="text"
                    placeholder="e.g. n_b41_entrance"
                    value={newSegTo}
                    onChange={(e) => setNewSegTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newSegCategory}
                    onChange={(e) => setNewSegCategory(e.target.value as RoadCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  >
                    <option value="footpath">Footpath / Sidewalk</option>
                    <option value="pedestrian_walkway">Pedestrian Walkway</option>
                    <option value="internal_vehicle">Internal Road</option>
                    <option value="service">Service Lane</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Surface</label>
                  <select
                    value={newSegSurface}
                    onChange={(e) => setNewSegSurface(e.target.value as RoadSurface)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  >
                    <option value="paver_blocks">Paver Blocks</option>
                    <option value="concrete">Concrete</option>
                    <option value="paved_asphalt">Paved Asphalt</option>
                    <option value="gravel">Gravel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Wheelchair Accessibility</label>
                <select
                  value={newSegWheelchair}
                  onChange={(e) => setNewSegWheelchair(e.target.value as WheelchairRating)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="unverified">Unverified (Requires Physical Survey)</option>
                  <option value="verified_accessible">Verified Step-Free Accessible</option>
                  <option value="inaccessible">Inaccessible / Steps Present</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Allowed Modes</label>
                <div className="flex gap-4">
                  {(['walking', 'bike', 'car', 'wheelchair'] as NavigationMode[]).map((m) => (
                    <label key={m} className="flex items-center gap-1.5 cursor-pointer capitalize text-slate-300">
                      <input
                        type="checkbox"
                        checked={newSegModes.includes(m)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...newSegModes, m]
                            : newSegModes.filter((x) => x !== m);
                          setNewSegModes(updated);
                        }}
                      />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  GPS Polyline Coordinates (Optional: One lat, lng per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="31.251548, 75.702143&#10;31.251697, 75.701877"
                  value={newSegCoordsText}
                  onChange={(e) => setNewSegCoordsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSegment}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Path Segment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: IMPORT GPX / GEOJSON --- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-400" />
                <span>Import GPS-Tracked GPX / GeoJSON Path</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Format</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="importFormat"
                      checked={importFormat === 'geojson'}
                      onChange={() => setImportFormat('geojson')}
                    />
                    <span>GeoJSON Feature / LineString</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="importFormat"
                      checked={importFormat === 'gpx'}
                      onChange={() => setImportFormat('gpx')}
                    />
                    <span>GPX Track</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Paste Raw File Content</label>
                <textarea
                  rows={6}
                  placeholder={importFormat === 'geojson' ? '{"type": "Feature", "geometry": {"type": "LineString", "coordinates": [...]}}' : '<trkpt lat="31.25..." lon="75.70..."></trkpt>'}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-600/20"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Track</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: CONNECT INTERSECTIONS --- */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-brand-400" />
                <span>Connect Verified Intersections</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Intersection Node A ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 10211421241"
                    value={connectNodeA}
                    onChange={(e) => setConnectNodeA(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Intersection Node B ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 13403163986"
                    value={connectNodeB}
                    onChange={(e) => setConnectNodeB(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Connection Name</label>
                <input
                  type="text"
                  placeholder="e.g. South Campus Perimeter Link"
                  value={connectName}
                  onChange={(e) => setConnectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={connectCategory}
                  onChange={(e) => setConnectCategory(e.target.value as RoadCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="footpath">Footpath / Sidewalk</option>
                  <option value="pedestrian_walkway">Pedestrian Walkway</option>
                  <option value="internal_vehicle">Internal Road</option>
                  <option value="main_road">Main Road</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnect}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-600/20"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Connect Nodes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: PUBLISH VERSION --- */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-brand-400" />
                <span>Publish Routing Graph Version</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Version Identifier</label>
                <input
                  type="text"
                  value={publishVersionName}
                  onChange={(e) => setPublishVersionName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Release Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe recent road corrections, field surveys or access changes..."
                  value={publishNotes}
                  onChange={(e) => setPublishNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>

              {snapshots.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Previous Snapshots:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {snapshots.map((s) => (
                      <span key={s.version} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                        {s.version} ({new Date(s.date).toLocaleDateString()})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-600/20"
              >
                <History className="w-3.5 h-3.5" />
                <span>Publish &amp; Save Snapshot</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
