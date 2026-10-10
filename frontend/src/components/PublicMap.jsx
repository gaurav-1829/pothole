import React, { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps, DARK_MAP_STYLES, makeMarkerSvg } from '../utils/googleMaps';
import { ThumbsUp, ShieldAlert, Layers, Search, Navigation, Flame } from 'lucide-react';

const STATUS_CONFIG = {
  'Pending':      { color: '#ef4444', bg: 'bg-red-500/20',     text: 'text-red-400',     border: 'border-red-500/40' },
  'Under Review': { color: '#f97316', bg: 'bg-orange-500/20',  text: 'text-orange-400',  border: 'border-orange-500/40' },
  'Scheduled':    { color: '#a855f7', bg: 'bg-purple-500/20',  text: 'text-purple-400',  border: 'border-purple-500/40' },
  'In Progress':  { color: '#eab308', bg: 'bg-yellow-500/20',  text: 'text-yellow-400',  border: 'border-yellow-500/40' },
  'Repaired':     { color: '#10b981', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
  'Rejected':     { color: '#64748b', bg: 'bg-slate-500/20',   text: 'text-slate-400',   border: 'border-slate-500/40' },
};

const SEVERITY_CONFIG = {
  'Critical': { badge: 'bg-red-500/20 text-red-400 border-red-500/40' },
  'Severe':   { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  'Moderate': { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  'Minor':    { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
};

export default function PublicMap({ reports = [], onFileComplaint, onRefreshReports }) {
  const mapDivRef   = useRef(null);
  const gMapRef     = useRef(null);
  const markersRef  = useRef([]);

  const [mapLoaded, setMapLoaded]         = useState(false);
  const [mapError, setMapError]           = useState(null);
  const [statusFilter, setStatusFilter]   = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [upvotedMap, setUpvotedMap]       = useState({});

  // ── Init Google Map ──
  useEffect(() => {
    loadGoogleMaps()
      .then((maps) => {
        const map = new maps.Map(mapDivRef.current, {
          center: { lat: 28.6139, lng: 77.2090 },
          zoom: 13,
          styles: DARK_MAP_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        });
        gMapRef.current = map;
        setMapLoaded(true);
      })
      .catch(err => {
        console.error('Google Maps load error:', err);
        setMapError(err.message);
      });
  }, []);

  // ── Sync markers whenever reports/filters change ──
  useEffect(() => {
    if (!gMapRef.current || !mapLoaded) return;

    // Remove old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    filteredReports.forEach(report => {
      const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG['Pending'];
      const isPulse   = report.status === 'Pending' || report.severity === 'Critical';

      const marker = new window.google.maps.Marker({
        position : { lat: report.latitude, lng: report.longitude },
        map      : gMapRef.current,
        title    : report.report_code,
        optimized: false,
        icon: {
          url       : makeMarkerSvg(statusCfg.color, isPulse),
          scaledSize: new window.google.maps.Size(38, 48),
          anchor    : new window.google.maps.Point(19, 48),
        },
      });

      marker.addListener('click', () => {
        setSelectedReport(report);
        gMapRef.current.panTo({ lat: report.latitude, lng: report.longitude });
        gMapRef.current.setZoom(16);
      });

      markersRef.current.push(marker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, reports, statusFilter, severityFilter, searchQuery]);

  // ── Pan to selected report ──
  useEffect(() => {
    if (selectedReport && gMapRef.current) {
      gMapRef.current.panTo({ lat: selectedReport.latitude, lng: selectedReport.longitude });
      gMapRef.current.setZoom(16);
    }
  }, [selectedReport]);

  // ── Filter logic ──
  const filteredReports = reports.filter(r => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (severityFilter !== 'All' && r.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.report_code?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q) ||
        r.ward?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpvote = async (reportId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/reports/${reportId}/upvote`, { method: 'POST' });
      if (res.ok) {
        setUpvotedMap(prev => ({ ...prev, [reportId]: (prev[reportId] || 0) + 1 }));
        if (onRefreshReports) onRefreshReports();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-slate-950" style={{ height: 'calc(100vh - 4rem)' }}>

      {/* ── Sidebar ── */}
      <div className="w-full lg:w-96 bg-slate-900/80 border-r border-slate-800 flex flex-col lg:h-full z-20 shadow-xl overflow-hidden">
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Live Hazard Map
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filteredReports.length} potholes
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by street, code, ward..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
              <div className="flex flex-wrap gap-1.5">
                {['All','Pending','In Progress','Repaired'].map(st => (
                  <button key={st} onClick={() => setStatusFilter(st)}
                    className={`text-xs px-2 py-1 rounded-md transition-all ${statusFilter === st ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Severity</span>
              <div className="flex flex-wrap gap-1.5">
                {['All','Critical','Severe','Moderate','Minor'].map(sev => (
                  <button key={sev} onClick={() => setSeverityFilter(sev)}
                    className={`text-xs px-2 py-1 rounded-md transition-all ${severityFilter === sev ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Report Feed */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No reports match current filters.</div>
          ) : filteredReports.map(report => {
            const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG['Pending'];
            const sevCfg    = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG['Moderate'];
            const isSelected = selectedReport?.id === report.id;
            return (
              <div key={report.id} onClick={() => setSelectedReport(report)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-slate-800/90 border-amber-500 shadow-md shadow-amber-500/10' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'}`}>
                <div className="flex gap-3">
                  <img src={report.annotated_image_url || report.image_url} alt="Pothole"
                    className="w-16 h-16 rounded-lg object-cover bg-slate-900 border border-slate-800 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-200 truncate">{report.report_code}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sevCfg.badge}`}>{report.severity}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium truncate mb-1">{report.address}</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>{report.status}</span>
                      <button onClick={e => handleUpvote(report.id, e)}
                        className="flex items-center gap-1 text-slate-400 hover:text-amber-400 text-xs transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{(report.upvotes || 1) + (upvotedMap[report.id] || 0)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex-shrink-0">
          <div className="font-semibold text-slate-300 mb-1.5">Pin Legend:</div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Pending</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>In Progress</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>Scheduled</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Repaired</span>
          </div>
        </div>
      </div>

      {/* ── Map Container ── */}
      <div className="flex-1 relative" style={{ minHeight: '400px' }}>
        {/* Map div — always mounted */}
        <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />

        {/* Loading overlay */}
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Loading Google Maps…</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {mapError && (
          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center z-10 p-6">
            <div className="text-center space-y-2">
              <p className="text-red-400 font-bold">Map failed to load</p>
              <p className="text-xs text-slate-400">{mapError}</p>
            </div>
          </div>
        )}

        {/* ── Detail Drawer ── */}
        {selectedReport && (
          <div className="absolute right-4 top-4 bottom-4 w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl z-[1000] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-amber-400">{selectedReport.report_code}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selectedReport.status]?.bg} ${STATUS_CONFIG[selectedReport.status]?.text} ${STATUS_CONFIG[selectedReport.status]?.border}`}>
                  {selectedReport.status}
                </span>
              </div>
              <button onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 font-bold">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <img src={selectedReport.annotated_image_url || selectedReport.image_url} alt="Pothole"
                  className="w-full h-48 object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] font-mono text-slate-300 border border-slate-800">
                  AI Detection Visual
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Severity</span>
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border ${SEVERITY_CONFIG[selectedReport.severity]?.badge}`}>
                    {selectedReport.severity}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Hazard Score</span>
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 text-sm">
                    <Flame className="w-4 h-4 text-orange-500" />{selectedReport.hazard_score}/100
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Est. Depth</span>
                  <span className="text-xs font-bold text-slate-200">{selectedReport.estimated_depth_cm} cm</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Dimensions</span>
                  <span className="text-xs font-bold text-slate-200">{selectedReport.estimated_dimensions}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />{selectedReport.address}
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Ward: {selectedReport.ward} · {selectedReport.latitude?.toFixed(5)}, {selectedReport.longitude?.toFixed(5)}
                </p>
              </div>

              {selectedReport.citizen_description && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400">Citizen Observation:</span>
                  <p className="text-xs text-slate-300 italic mt-0.5">"{selectedReport.citizen_description}"</p>
                </div>
              )}

              {selectedReport.authority_notes && (
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40">
                  <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Authority Notes:
                  </span>
                  <p className="text-xs text-slate-200 mt-0.5">{selectedReport.authority_notes}</p>
                  {selectedReport.assigned_crew && (
                    <p className="text-[11px] text-purple-400 mt-1">Crew: {selectedReport.assigned_crew}</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex-shrink-0">
              <div className="flex gap-2">
                <button onClick={() => handleUpvote(selectedReport.id)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700">
                  <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                  Upvote ({(selectedReport.upvotes || 1) + (upvotedMap[selectedReport.id] || 0)})
                </button>
                <button onClick={() => onFileComplaint && onFileComplaint(selectedReport)}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20">
                  <ShieldAlert className="w-3.5 h-3.5" />File Grievance
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
