import React, { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps, DARK_MAP_STYLES, makeMarkerSvg } from '../../utils/googleMaps';

export default function LiveMapScreen({ reports = [], onSelectReport, onFileGrievance, onRefreshReports }) {
  const [mapMode, setMapMode] = useState('vector'); // 'vector' or 'google'
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [heatmapVisible, setHeatmapVisible] = useState(true);

  // Google Maps ref
  const googleMapDivRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);

  // Auto-select first report or default to #PW-20481
  useEffect(() => {
    if (reports.length > 0 && !selectedIncident) {
      setSelectedIncident(reports[0]);
    }
  }, [reports]);

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (severityFilter !== 'All' && r.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
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

  // Init Google Maps if mode switched to 'google'
  useEffect(() => {
    if (mapMode !== 'google') return;

    loadGoogleMaps().then((maps) => {
      if (!googleMapDivRef.current) return;

      const map = new maps.Map(googleMapDivRef.current, {
        center: { lat: 30.3256, lng: 78.0437 },
        zoom: 14,
        styles: DARK_MAP_STYLES,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      });

      googleMapRef.current = map;

      // Add pins
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      filteredReports.forEach((rep) => {
        const color = rep.severity === 'Critical' ? '#ef4444' : rep.severity === 'Severe' ? '#f97316' : rep.severity === 'Moderate' ? '#f59e0b' : '#22c55e';
        const marker = new maps.Marker({
          position: { lat: rep.latitude, lng: rep.longitude },
          map,
          title: rep.report_code,
          icon: {
            url: makeMarkerSvg(color, rep.severity === 'Critical'),
            scaledSize: new maps.Size(34, 42),
            anchor: new maps.Point(17, 42),
          },
        });

        marker.addListener('click', () => {
          setSelectedIncident(rep);
          map.panTo({ lat: rep.latitude, lng: rep.longitude });
        });

        markersRef.current.push(marker);
      });
    }).catch((err) => console.error('Map load error:', err));
  }, [mapMode, filteredReports]);

  // Handle upvote
  const handleUpvote = async (repId) => {
    try {
      const res = await fetch(`/api/reports/${repId}/upvote`, { method: 'POST' });
      if (res.ok && onRefreshReports) {
        onRefreshReports();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const active = selectedIncident || (reports.length > 0 ? reports[0] : null);

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] overflow-hidden select-none bg-[#eef1e6]" id="gis-workspace">
      
      {/* ── MAP CANVAS (Vector SVG or Google Maps) ── */}
      {mapMode === 'google' ? (
        <div ref={googleMapDivRef} className="absolute inset-0 w-full h-full z-0" />
      ) : (
        <div className="absolute inset-0 w-full h-full" id="map-canvas-container">
          <svg className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient cx="50%" cy="50%" id="heat-clocktower" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
              <radialGradient cx="50%" cy="50%" id="heat-rispana" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.38" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
              <radialGradient cx="50%" cy="50%" id="heat-rajpur" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.42" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#30c88f" stopOpacity="0" />
              </radialGradient>
              <pattern height="40" id="urban-grid" patternUnits="userSpaceOnUse" width="40">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e6d8" strokeWidth="0.8" />
              </pattern>
              <filter height="160%" id="soft-glow" width="160%" x="-30%" y="-30%">
                <feGaussianBlur result="blur" stdDeviation="8" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Topography Base */}
            <rect fill="#f4f6ee" height="100%" width="100%" />
            <rect fill="url(#urban-grid)" height="100%" opacity="0.65" width="100%" />

            {/* Contours */}
            <path d="M -100 -50 Q 400 120 950 40 T 2020 10" fill="none" opacity="0.4" stroke="#dbe1cb" strokeWidth="48" />
            <path d="M -100 80 Q 520 210 1100 120 T 2020 70" fill="none" opacity="0.3" stroke="#dbe1cb" strokeWidth="26" />

            {/* Green Municipal Zones */}
            <path d="M 80 420 C 130 380, 260 360, 310 440 C 350 510, 320 620, 240 680 C 160 740, 70 710, 50 620 Z" fill="#d9eedd" opacity="0.85" />
            <text className="font-label-sm text-label-sm font-semibold tracking-wider" fill="#006c49" opacity="0.6" x="140" y="540">FRI ESTATE RESERVE</text>

            {/* Rispana & Bindal Rivers */}
            <path d="M 920 -40 C 900 240, 830 520, 790 780 C 760 960, 710 1140, 700 1200" fill="none" stroke="#bcd8e4" strokeLinecap="round" strokeWidth="14" />
            <text className="font-label-sm text-label-sm tracking-widest" fill="#555f6f" opacity="0.7" transform="rotate(78 810,700)" x="810" y="700">RISPANA RIVER</text>

            {/* Secondary & Primary Roads */}
            <g opacity="0.95" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9">
              <path d="M 180 960 Q 650 910 1180 840 T 1940 760" />
              <path d="M 280 1120 L 590 620 L 710 490" />
              <path d="M -20 540 Q 340 520 620 500" />
              <path d="M 720 480 Q 1120 460 1620 510" />
            </g>

            {/* Arterial Highways Outline */}
            <g opacity="0.7" stroke="#fed7aa" strokeLinecap="round" strokeLinejoin="round" strokeWidth="14">
              <path d="M 700 500 L 760 410 L 880 240 L 980 90 L 1060 -20" />
              <path d="M 280 1120 L 590 620 L 710 490" />
              <path d="M 710 490 L 1180 840" />
            </g>

            {/* Rajpur Road (Spine) */}
            <path d="M 700 500 L 760 410 L 880 240 L 980 90 L 1060 -20" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
            <path d="M 700 500 L 760 410 L 880 240 L 980 90 L 1060 -20" fill="none" stroke="#f59e0b" strokeDasharray="10 8" strokeWidth="3" />

            <text className="font-label-md text-label-md font-bold tracking-wider" fill="#1a1c1b" transform="rotate(-52 810,320)" x="810" y="320">RAJPUR ROAD (NH-307)</text>
            <text className="font-label-sm text-label-sm font-semibold tracking-wide" fill="#555f6f" transform="rotate(-60 380,780)" x="380" y="780">SAHARANPUR RD</text>
            <text className="font-label-sm text-label-sm font-semibold tracking-wide" fill="#555f6f" transform="rotate(-6 1240,820)" x="1240" y="820">HARIDWAR BYPASS EXPRESSWAY</text>

            {/* Clock Tower Landmark */}
            <g transform="translate(695, 492)">
              <circle fill="#ffffff" r="14" stroke="#1a1c1b" strokeWidth="2.5" />
              <circle fill="#855300" r="6" />
              <rect fill="#ffffff" filter="url(#soft-glow)" height="28" opacity="0.9" rx="6" width="138" x="22" y="-14" />
              <text className="font-label-md text-label-md font-extrabold tracking-tight" fill="#1a1c1b" x="30" y="4">Clock Tower (Ghanta Ghar)</text>
            </g>

            {/* Heatmap overlay layer */}
            {heatmapVisible && (
              <g className="transition-opacity duration-300 opacity-90" id="heatmap-layer">
                <circle cx="730" cy="450" fill="url(#heat-clocktower)" r="140" />
                <circle cx="940" cy="720" fill="url(#heat-rispana)" r="120" />
                <circle cx="840" cy="310" fill="url(#heat-rajpur)" r="110" />
              </g>
            )}

            {/* Interactive Pins on Vector Canvas */}
            <g id="pothole-pins">
              {filteredReports.map((r, i) => {
                // Coordinate mapper to SVG viewBox
                const x = 700 + ((r.longitude - 77.2090) * 18000 || (i * 110));
                const y = 490 + ((r.latitude - 28.6139) * -18000 || (i * 90));
                const isCritical = r.severity === 'Critical' || r.severity === 'Severe';
                const isSelected = selectedIncident?.id === r.id;

                return (
                  <g
                    key={r.id}
                    className="cursor-pointer group"
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setSelectedIncident(r)}
                  >
                    {isCritical && (
                      <circle fill="#ef4444" fillOpacity="0.25" r="22">
                        <animate attributeName="r" dur="2.2s" repeatCount="indefinite" values="14;28;14" />
                        <animate attributeName="opacity" dur="2.2s" repeatCount="indefinite" values="0.7;0.1;0.7" />
                      </circle>
                    )}
                    <circle
                      fill={isCritical ? '#ef4444' : r.severity === 'Moderate' ? '#f59e0b' : '#22c55e'}
                      r={isSelected ? '11' : '8'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    {isSelected && (
                      <circle fill="none" r="18" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="2" />
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      )}

      {/* ── FLOATING TOP FILTER & SEARCH BAR ── */}
      <div className="absolute top-5 left-6 right-[460px] z-30 flex flex-col gap-2 pointer-events-none">
        <div className="w-full bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl shadow-md p-2.5 flex flex-wrap items-center justify-between gap-3 pointer-events-auto border border-surface-container-high">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search neighborhood, road, or report ID..."
              className="w-full h-11 pl-10 pr-10 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-2.5 flex items-center text-secondary hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
          </div>

          {/* Severity & Map Mode Toggles */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-container p-1 rounded-xl">
              {['All', 'Critical', 'Moderate', 'Minor'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm font-bold transition-all cursor-pointer ${
                    severityFilter === sev ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Toggle Vector / Google Maps */}
            <div className="flex items-center bg-surface-container p-1 rounded-xl">
              <button
                onClick={() => setMapMode('vector')}
                className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  mapMode === 'vector' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">layers</span>
                GIS Vector
              </button>
              <button
                onClick={() => setMapMode('google')}
                className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  mapMode === 'google' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">map</span>
                Google Maps
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIVE INCIDENT DETAIL DRAWER (RIGHT PANEL) ── */}
      {active && (
        <div className="absolute top-5 right-6 bottom-5 w-[420px] bg-surface-container-lowest/95 backdrop-blur-xl rounded-3xl shadow-2xl p-space-md z-30 flex flex-col justify-between border border-surface-container-high overflow-y-auto">
          <div className="space-y-space-md">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-surface-container pb-space-xs">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-label-lg text-label-lg font-bold text-on-surface font-mono">{active.report_code}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-error-container text-error font-label-sm text-label-sm font-bold uppercase">
                    {active.severity} Hazard
                  </span>
                </div>
                <span className="text-[12px] text-secondary mt-0.5">Municipal Priority Tier 1 • Dehradun Urban</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container/30 text-on-tertiary-container font-label-sm text-label-sm font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> {active.status}
              </span>
            </div>

            {/* Vision AI Viewfinder Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-inverse-surface border border-surface-container-high shadow-md">
              <img
                src={active.annotated_image_url || active.image_url}
                alt="Pothole visual inspection"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface font-label-sm text-label-sm backdrop-blur-md">
                AI Vision Conf: {Math.round((active.confidence || 0.92) * 100)}%
              </div>
              <div className="absolute bottom-3 left-3 right-3 px-2.5 py-1 bg-surface-container-lowest/90 backdrop-blur-md rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Depth: {active.estimated_depth_cm} cm</span>
                <span className="text-secondary font-mono">{active.estimated_dimensions}</span>
              </div>
            </div>

            {/* Location Specs */}
            <div className="space-y-1">
              <div className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-primary-container text-[20px] shrink-0 mt-0.5">pin_drop</span>
                <div>
                  <h4 className="font-headline-md text-headline-md font-bold text-on-surface text-base">{active.address}</h4>
                  <p className="text-xs text-secondary">{active.ward} • Lat: {active.latitude?.toFixed(4)}, Lng: {active.longitude?.toFixed(4)}</p>
                </div>
              </div>
            </div>

            {/* Hazard Telemetry Specs */}
            <div className="grid grid-cols-3 gap-2 bg-surface-container p-2.5 rounded-xl text-center text-xs">
              <div>
                <span className="text-secondary block text-[11px]">Cavity Depth</span>
                <strong className="text-error text-sm font-extrabold">{active.estimated_depth_cm} cm</strong>
              </div>
              <div>
                <span className="text-secondary block text-[11px]">Hazard Score</span>
                <strong className="text-primary-container text-sm font-extrabold">{active.hazard_score || 85}/100</strong>
              </div>
              <div>
                <span className="text-secondary block text-[11px]">Assigned Crew</span>
                <strong className="text-on-surface text-xs block truncate">{active.assigned_crew || 'Crew #4'}</strong>
              </div>
            </div>

            {/* Notes if any */}
            {active.authority_notes && (
              <div className="p-space-xs rounded-xl bg-surface-container-low text-xs border border-surface-container-high">
                <span className="font-bold text-secondary block">PWD Dispatch Order:</span>
                <p className="text-on-surface mt-0.5">{active.authority_notes}</p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-space-md border-t border-surface-container space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpvote(active.id)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-primary-container">thumb_up</span>
                Upvote Urgency ({active.upvotes || 1})
              </button>
              <button
                onClick={() => onFileGrievance(active)}
                className="flex-1 py-2.5 rounded-xl bg-error-container hover:bg-red-200 text-error font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">report</span>
                File Grievance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
