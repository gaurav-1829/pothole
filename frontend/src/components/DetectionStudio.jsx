import React, { useState, useRef, useEffect } from 'react';
import { loadGoogleMaps, DARK_MAP_STYLES } from '../utils/googleMaps';
import {
  Upload, Camera, MapPin, Sparkles, CheckCircle2,
  Crosshair, ShieldAlert, RefreshCw,
} from 'lucide-react';

const SEVERITY_CONFIG = {
  'Critical': { color: '#ef4444', badge: 'bg-red-500/20 text-red-400 border-red-500/40', bar: 'bg-red-500' },
  'Severe':   { color: '#f97316', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40', bar: 'bg-orange-500' },
  'Moderate': { color: '#eab308', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', bar: 'bg-yellow-500' },
  'Minor':    { color: '#10b981', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', bar: 'bg-emerald-500' },
};

export default function DetectionStudio({ onReportSubmitted, onViewMap }) {
  const [selectedFile, setSelectedFile]       = useState(null);
  const [previewUrl, setPreviewUrl]           = useState(null);
  const [isAnalyzing, setIsAnalyzing]         = useState(false);
  const [analysisResult, setAnalysisResult]   = useState(null);
  const [viewMode, setViewMode]               = useState('annotated');

  const [latitude, setLatitude]               = useState(28.6139);
  const [longitude, setLongitude]             = useState(77.2090);
  const [locationSource, setLocationSource]   = useState('Manual_Pin');
  const [address, setAddress]                 = useState('Central Avenue Road Sector 4');
  const [ward, setWard]                       = useState('Ward 4 - Central Zone');

  const [citizenName, setCitizenName]         = useState('');
  const [citizenEmail, setCitizenEmail]       = useState('');
  const [citizenPhone, setCitizenPhone]       = useState('');
  const [description, setDescription]         = useState('');
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);

  const fileInputRef   = useRef(null);
  const miniMapDivRef  = useRef(null);
  const miniGMapRef    = useRef(null);
  const miniMarkerRef  = useRef(null);

  // ── Init mini Google Map ──
  useEffect(() => {
    loadGoogleMaps().then(maps => {
      if (!miniMapDivRef.current) return;

      const map = new maps.Map(miniMapDivRef.current, {
        center: { lat: 28.6139, lng: 77.2090 },
        zoom: 14,
        styles: DARK_MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
      });

      const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 1C8.268 1 2 7.268 2 15c0 9.75 14 24 14 24s14-14.25 14-24C30 7.268 23.732 1 16 1z"
          fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>
        <circle cx="16" cy="15" r="5" fill="#0f172a"/>
      </svg>`;

      const marker = new maps.Marker({
        position: { lat: 28.6139, lng: 77.2090 },
        map,
        draggable: true,
        title: 'Drag to set pothole location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
          scaledSize: new maps.Size(32, 40),
          anchor: new maps.Point(16, 40),
        },
      });

      marker.addListener('dragend', e => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setLatitude(Math.round(lat * 1e6) / 1e6);
        setLongitude(Math.round(lng * 1e6) / 1e6);
        setLocationSource('Manual_Pin');
      });

      map.addListener('click', e => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        marker.setPosition(e.latLng);
        setLatitude(Math.round(lat * 1e6) / 1e6);
        setLongitude(Math.round(lng * 1e6) / 1e6);
        setLocationSource('Manual_Pin');
      });

      miniGMapRef.current   = map;
      miniMarkerRef.current = marker;
    }).catch(err => console.error('Mini map load error:', err));
  }, []);

  // Keep marker in sync when lat/lng changes from EXIF/GPS
  useEffect(() => {
    if (!miniGMapRef.current || !miniMarkerRef.current) return;
    const pos = { lat: latitude, lng: longitude };
    miniMarkerRef.current.setPosition(pos);
    miniGMapRef.current.panTo(pos);
  }, [latitude, longitude]);

  // ── Image upload + AI detection ──
  const handleFileChange = async file => {
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSubmittedReport(null);
    setIsAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/detect', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Detection failed');
      const data = await res.json();
      setAnalysisResult(data);
      if (data.exif?.has_gps && data.exif.latitude && data.exif.longitude) {
        setLatitude(data.exif.latitude);
        setLongitude(data.exif.longitude);
        setLocationSource('EXIF');
        setAddress(`GPS: ${data.exif.latitude.toFixed(5)}, ${data.exif.longitude.toFixed(5)}`);
      }
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetBrowserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setLocationSource('Browser_GPS');
          setAddress(`My Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        () => alert('Location access denied. Click the map to pin instead.')
      );
    }
  };

  const handleSubmitReport = async e => {
    e.preventDefault();
    if (!analysisResult) return;
    setIsSubmitting(true);
    try {
      const payload = {
        image_url: analysisResult.image_url,
        annotated_image_url: analysisResult.annotated_image_url,
        latitude, longitude, location_source: locationSource,
        address, city: 'Metro Area', ward,
        severity: analysisResult.ai_analysis.overall_severity,
        confidence: analysisResult.ai_analysis.confidence,
        pothole_count: analysisResult.ai_analysis.pothole_count,
        bounding_boxes: analysisResult.ai_analysis.detections,
        segmentation_masks: analysisResult.ai_analysis.detections.map(d => d.polygon || []),
        estimated_dimensions: analysisResult.ai_analysis.estimated_dimensions,
        estimated_depth_cm: analysisResult.ai_analysis.estimated_depth_cm,
        hazard_score: analysisResult.ai_analysis.hazard_score,
        citizen_name: citizenName || 'Anonymous Citizen',
        citizen_email: citizenEmail,
        citizen_phone: citizenPhone,
        citizen_description: description,
      };
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Submission failed');
      const saved = await res.json();
      setSubmittedReport(saved);
      if (onReportSubmitted) onReportSubmitted(saved);
    } catch (err) {
      console.error(err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSeverity = analysisResult?.ai_analysis?.overall_severity || 'Moderate';
  const severityStyle   = SEVERITY_CONFIG[currentSeverity] || SEVERITY_CONFIG['Moderate'];

  if (submittedReport) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Report Successfully Logged</span>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">Ticket: {submittedReport.report_code}</h2>
            <p className="text-sm text-slate-400 mt-2">Assigned to Municipal Road Maintenance Dispatch.</p>
          </div>
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between"><span className="text-slate-500">Location:</span><span className="text-slate-200 font-medium">{submittedReport.address}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Severity:</span><span className={`font-bold px-1.5 py-0.5 rounded ${SEVERITY_CONFIG[submittedReport.severity]?.badge}`}>{submittedReport.severity}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Est. Depth:</span><span className="text-slate-200">{submittedReport.estimated_depth_cm} cm</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Hazard Score:</span><span className="text-amber-400 font-bold">{submittedReport.hazard_score}/100</span></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => { setSubmittedReport(null); setSelectedFile(null); setPreviewUrl(null); setAnalysisResult(null); }}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors">
              Report Another Pothole
            </button>
            <button onClick={onViewMap}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg">
              <MapPin className="w-4 h-4" />View on Live Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />Autonomous Computer Vision Model
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
          Capture, Detect &amp; Report Potholes
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400">
          Upload a road photo — AI identifies depressions, draws bounding masks, estimates depth &amp; severity, then routes to maintenance teams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left: Image + AI ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />1. Road Photo &amp; AI Inspection
              </h2>
              {analysisResult && (
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button onClick={() => setViewMode('annotated')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${viewMode === 'annotated' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                    AI Bounding Box
                  </button>
                  <button onClick={() => setViewMode('original')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${viewMode === 'original' ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'}`}>
                    Raw Photo
                  </button>
                </div>
              )}
            </div>

            {!previewUrl ? (
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-12 text-center cursor-pointer transition-all bg-slate-950/50 hover:bg-slate-950/80 group">
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => handleFileChange(e.target.files?.[0])} />
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">Click to upload or drag &amp; drop road image</h3>
                <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, HEIC · EXIF GPS auto-extracted</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-[4/3] flex items-center justify-center">
                  {isAnalyzing ? (
                    <div className="text-center p-8 space-y-3">
                      <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                      <p className="text-sm font-bold text-slate-200">Analyzing Road Surface…</p>
                      <p className="text-xs text-slate-400">Extracting EXIF, edge gradients &amp; cavity depth</p>
                    </div>
                  ) : (
                    <img
                      src={viewMode === 'annotated' && analysisResult?.annotated_image_url ? analysisResult.annotated_image_url : previewUrl}
                      alt="Detection result" className="w-full h-full object-contain" />
                  )}
                  <button onClick={() => fileInputRef.current?.click()}
                    className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 backdrop-blur-sm">
                    Change Photo
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => handleFileChange(e.target.files?.[0])} />
                </div>

                {analysisResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded border ${severityStyle.badge}`}>
                          {analysisResult.ai_analysis.overall_severity.toUpperCase()}
                        </span>
                        <span className="text-xs font-medium text-slate-300">
                          Confidence: {Math.round(analysisResult.ai_analysis.confidence * 100)}%
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {analysisResult.ai_analysis.pothole_count} defect(s)
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Hazard Risk:</span>
                        <span className="text-amber-400 font-bold">{analysisResult.ai_analysis.hazard_score}/100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${severityStyle.bar} transition-all duration-500`}
                          style={{ width: `${analysisResult.ai_analysis.hazard_score}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">Dimensions</span>
                        <span className="font-semibold text-slate-200">{analysisResult.ai_analysis.estimated_dimensions}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">Depth</span>
                        <span className="font-semibold text-slate-200">{analysisResult.ai_analysis.estimated_depth_cm} cm</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">EXIF GPS</span>
                        <span className={`font-semibold ${analysisResult.exif?.has_gps ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {analysisResult.exif?.has_gps ? 'Found' : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Location + Form ── */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmitReport} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />2. Precise Location
            </h2>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Mode: <span className="text-slate-200 font-semibold">{locationSource}</span></span>
                <span className="text-amber-400 font-mono">{latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
              </div>
              <button type="button" onClick={handleGetBrowserLocation}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700">
                <Crosshair className="w-3.5 h-3.5 text-amber-400" />Use My Device GPS Location
              </button>
            </div>

            {/* Mini Google Map */}
            <div className="rounded-xl overflow-hidden border border-slate-700 relative" style={{ height: '176px' }}>
              <div ref={miniMapDivRef} style={{ width: '100%', height: '100%' }} />
              <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] text-slate-300 border border-slate-800 z-10 pointer-events-none">
                💡 Click map or drag pin to set road location
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Street / Landmark *</label>
                <input type="text" required value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Ring Road Junction, Near Metro Pillar 14"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Municipal Ward</label>
                <select value={ward} onChange={e => setWard(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500">
                  {['Ward 1 - Campus Zone','Ward 3 - Market North','Ward 4 - Central Zone','Ward 5 - Residential West','Ward 8 - South Ring','Ward 9 - Industrial East','Ward 12 - Civic Center'].map(w => (
                    <option key={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-3 text-xs">
              <span className="font-bold text-slate-300 block">3. Citizen Details (Optional)</span>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={citizenName} onChange={e => setCitizenName(e.target.value)} placeholder="Your Name"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
                <input type="email" value={citizenEmail} onChange={e => setCitizenEmail(e.target.value)} placeholder="Email for Updates"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500" />
              </div>
              <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Additional remarks..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none" />
            </div>

            <button type="submit" disabled={!analysisResult || isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                analysisResult && !isSubmitting
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-slate-950 shadow-lg shadow-orange-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}>
              {isSubmitting ? <><RefreshCw className="w-4 h-4 animate-spin" />Submitting…</> : <><ShieldAlert className="w-4 h-4" />Submit Pothole Report</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
