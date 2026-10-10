import React, { useState, useRef, useEffect } from 'react';
import { loadGoogleMaps, DARK_MAP_STYLES } from '../../utils/googleMaps';

export default function ReportModal({ isOpen, onClose, onReportSubmitted, onViewMap }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [viewMode, setViewMode] = useState('annotated');
  const [selectedPotholeIndex, setSelectedPotholeIndex] = useState(0);

  // Feature 1: Real-world scale reference state
  const [addSizeReference, setAddSizeReference] = useState(false);
  const [referenceType, setReferenceType] = useState('coin'); // 'coin' | 'a4' | 'lane'
  const [lineCoords, setLineCoords] = useState(null); // { x1, y1, x2, y2 }
  const [linePixels, setLinePixels] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  const [latitude, setLatitude] = useState(30.3256);
  const [longitude, setLongitude] = useState(78.0437);
  const [locationSource, setLocationSource] = useState('Manual_Pin');
  const [address, setAddress] = useState('Rajpur Road, Near Clock Tower Intersection');
  const [ward, setWard] = useState('Ward 08 - Central Zone');

  const [citizenName, setCitizenName] = useState('Aarav Sharma');
  const [citizenEmail, setCitizenEmail] = useState('aarav.sharma@example.com');
  const [citizenPhone, setCitizenPhone] = useState('+91 98765 43210');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);

  const fileInputRef = useRef(null);
  const miniMapDivRef = useRef(null);
  const miniGMapRef = useRef(null);
  const miniMarkerRef = useRef(null);
  const canvasRef = useRef(null);
  const imgContainerRef = useRef(null);

  // Initialize mini Google Map
  useEffect(() => {
    if (!isOpen || submittedReport) return;

    loadGoogleMaps().then((maps) => {
      if (!miniMapDivRef.current) return;

      const map = new maps.Map(miniMapDivRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 14,
        styles: DARK_MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
      });

      const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
        <path d="M17 1C8.7 1 2 7.7 2 16c0 10.5 15 25 15 25s15-14.5 15-25C32 7.7 25.3 1 17 1z" fill="#f59e0b" stroke="#1a1c1b" stroke-width="2"/>
        <circle cx="17" cy="16" r="6" fill="#1a1c1b"/>
      </svg>`;

      const marker = new maps.Marker({
        position: { lat: latitude, lng: longitude },
        map,
        draggable: true,
        title: 'Drag to pinpoint exact pothole',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
          scaledSize: new maps.Size(34, 42),
          anchor: new maps.Point(17, 42),
        },
      });

      marker.addListener('dragend', (e) => {
        const lat = Math.round(e.latLng.lat() * 1e6) / 1e6;
        const lng = Math.round(e.latLng.lng() * 1e6) / 1e6;
        setLatitude(lat);
        setLongitude(lng);
        setLocationSource('Manual_Pin');
      });

      map.addListener('click', (e) => {
        const lat = Math.round(e.latLng.lat() * 1e6) / 1e6;
        const lng = Math.round(e.latLng.lng() * 1e6) / 1e6;
        marker.setPosition(e.latLng);
        setLatitude(lat);
        setLongitude(lng);
        setLocationSource('Manual_Pin');
      });

      miniGMapRef.current = map;
      miniMarkerRef.current = marker;
    }).catch((err) => console.error('Map loader error:', err));
  }, [isOpen, submittedReport]);

  // Keep marker synced
  useEffect(() => {
    if (!miniGMapRef.current || !miniMarkerRef.current) return;
    const pos = { lat: latitude, lng: longitude };
    miniMarkerRef.current.setPosition(pos);
    miniGMapRef.current.panTo(pos);
  }, [latitude, longitude]);

  // Redraw canvas line whenever lineCoords changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (lineCoords) {
      const { x1, y1, x2, y2 } = lineCoords;
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw end markers
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x1, y1, 5, 0, Math.PI * 2);
      ctx.arc(x2, y2, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw label
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(midX - 35, midY - 14, 70, 20);
      ctx.strokeStyle = '#38bdf8';
      ctx.setLineDash([]);
      ctx.strokeRect(midX - 35, midY - 14, 70, 20);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(linePixels || 0)} px`, midX, midY);
    }
  }, [lineCoords, linePixels]);

  if (!isOpen) return null;

  // Handle Photo Upload + AI Analysis
  const handleFileChange = async (file, customRefType = null, customRefPixels = null) => {
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSubmittedReport(null);
    setIsAnalyzing(true);
    setSelectedPotholeIndex(0);

    try {
      const fd = new FormData();
      fd.append('file', file);

      // Feature 1: Optional real-world reference calibration
      const activeRefType = customRefType || (addSizeReference ? referenceType : null);
      const activePixels = customRefPixels !== null ? customRefPixels : (addSizeReference ? linePixels : null);

      if (activeRefType && activePixels && activePixels > 5) {
        fd.append('reference_type', activeRefType);
        fd.append('reference_line_pixels', activePixels.toString());
      }

      const res = await fetch('/api/detect', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Detection failed');
      const data = await res.json();
      setAnalysisResult(data);

      if (data.exif?.has_gps && data.exif.latitude && data.exif.longitude) {
        setLatitude(data.exif.latitude);
        setLongitude(data.exif.longitude);
        setLocationSource('EXIF');
        setAddress(`GPS Lat: ${data.exif.latitude.toFixed(5)}, Lng: ${data.exif.longitude.toFixed(5)}`);
      }
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Re-run calibration when reference line or type changes
  const applyReferenceCalibration = () => {
    if (!selectedFile || !linePixels || linePixels < 5) return;
    handleFileChange(selectedFile, referenceType, linePixels);
  };

  // Canvas drawing handlers for size reference line
  const handleCanvasMouseDown = (e) => {
    if (!addSizeReference) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLineCoords({ x1: x, y1: y, x2: x, y2: y });
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || !addSizeReference) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLineCoords((prev) => {
      if (!prev) return null;
      const dx = x - prev.x1;
      const dy = y - prev.y1;
      setLinePixels(Math.hypot(dx, dy));
      return { ...prev, x2: x, y2: y };
    });
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  // Browser Geolocation
  const handleGetBrowserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setLocationSource('Browser_GPS');
          setAddress(`Current Device GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        () => alert('Could not get GPS. Please drag the pin on map.')
      );
    }
  };

  // Submit Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!analysisResult) return;
    if (!analysisResult.ai_analysis.has_pothole) {
      alert('No pothole detected on this road surface. Report not needed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        image_url: analysisResult.image_url,
        annotated_image_url: analysisResult.annotated_image_url,
        latitude,
        longitude,
        location_source: locationSource,
        address,
        city: 'Dehradun',
        ward,
        severity: analysisResult.ai_analysis.overall_severity,
        confidence: analysisResult.ai_analysis.confidence,
        pothole_count: analysisResult.ai_analysis.pothole_count,
        bounding_boxes: analysisResult.ai_analysis.detections,
        segmentation_masks: analysisResult.ai_analysis.detections.map((d) => d.polygon || []),
        estimated_dimensions: analysisResult.ai_analysis.estimated_dimensions,
        estimated_depth_cm: analysisResult.ai_analysis.estimated_depth_cm,
        hazard_score: analysisResult.ai_analysis.hazard_score,
        // Feature 1 fields
        area_ratio: analysisResult.ai_analysis.area_ratio || 0.0,
        est_width_cm: analysisResult.ai_analysis.est_width_cm || 0.0,
        est_length_cm: analysisResult.ai_analysis.est_length_cm || 0.0,
        size_method: analysisResult.ai_analysis.size_method || 'bbox',
        severity_reasons: analysisResult.ai_analysis.severity_reasons || [],
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

  const hasPothole = analysisResult?.ai_analysis?.has_pothole;
  const potholeCount = analysisResult?.ai_analysis?.pothole_count || 0;
  const detectionsList = analysisResult?.ai_analysis?.detections || [];
  const selectedPothole = detectionsList[selectedPotholeIndex] || detectionsList[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-surface-container-high my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-space-lg py-space-md bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
              <span className="material-symbols-outlined text-[22px]">photo_camera</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Report Road Hazard</h2>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-container/30 text-on-tertiary-container font-label-sm text-label-sm font-bold">
                  AI Edge Vision
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">Instant computer vision verification &amp; municipal PWD dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        {submittedReport ? (
          /* Success Screen */
          <div className="p-space-xl text-center space-y-space-md">
            <div className="w-16 h-16 rounded-full bg-tertiary-container/30 text-tertiary flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-tertiary font-bold">Municipal Work Order Created</span>
              <h3 className="font-headline-xl text-headline-xl font-extrabold text-on-surface mt-1">
                {submittedReport.report_code}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mt-2">
                Your road hazard report has been cryptographically logged and routed to the Dehradun Public Works Department dispatch queue.
              </p>
            </div>

            <div className="max-w-lg mx-auto p-space-md rounded-2xl bg-surface-container text-left text-xs space-y-2 border border-surface-container-high">
              <div className="flex justify-between"><span className="text-secondary">Location:</span><strong className="text-on-surface">{submittedReport.address}</strong></div>
              <div className="flex justify-between"><span className="text-secondary">Defects Logged:</span><strong className="text-on-surface">{submittedReport.pothole_count} crater(s)</strong></div>
              <div className="flex justify-between"><span className="text-secondary">Highest Severity:</span><span className="font-bold text-error uppercase">{submittedReport.severity} Hazard</span></div>
              <div className="flex justify-between"><span className="text-secondary">Estimated Span:</span><strong className="text-on-surface">{submittedReport.estimated_dimensions}</strong></div>
              <div className="flex justify-between"><span className="text-secondary">AI Cavity Depth:</span><strong className="text-on-surface">{submittedReport.estimated_depth_cm} cm</strong></div>
              <div className="flex justify-between"><span className="text-secondary">Assigned Crew:</span><strong className="text-tertiary">{submittedReport.assigned_crew}</strong></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-space-sm justify-center pt-2">
              <button
                onClick={() => {
                  setSubmittedReport(null);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setAnalysisResult(null);
                  setLineCoords(null);
                  setLinePixels(null);
                }}
                className="px-space-lg py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-bold transition-all cursor-pointer"
              >
                Report Another Hazard
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onViewMap) onViewMap();
                }}
                className="px-space-lg py-3 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-label-md text-label-md font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">map</span>
                View on Live GIS Map
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="p-space-lg space-y-space-lg">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg">
              
              {/* Left Column: Image Upload & AI Detection Viewfinder */}
              <div className="md:col-span-6 space-y-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[11px] font-bold">1</span>
                    Road Surface Photo
                  </span>
                  {analysisResult && (
                    <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setViewMode('annotated')}
                        className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                          viewMode === 'annotated' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
                        }`}
                      >
                        AI Visual
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('original')}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          viewMode === 'original' ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold' : 'text-on-surface-variant'
                        }`}
                      >
                        Raw
                      </button>
                    </div>
                  )}
                </div>

                {!previewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-outline-variant hover:border-primary-container rounded-2xl p-8 text-center cursor-pointer transition-all bg-surface-container-low hover:bg-surface-container group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                    />
                    <div className="w-14 h-14 rounded-2xl bg-primary-container/20 text-primary-container flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[28px]">add_photo_alternate</span>
                    </div>
                    <p className="font-label-md text-label-md font-bold text-on-surface">Click to upload or take road photo</p>
                    <p className="text-xs text-on-surface-variant mt-1">Autonomous edge analysis • detects 0, 1, or multiple craters</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      ref={imgContainerRef}
                      className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-inverse-surface flex items-center justify-center border border-surface-container-high shadow-inner select-none"
                    >
                      {isAnalyzing ? (
                        <div className="text-center p-6 space-y-2 text-inverse-on-surface">
                          <span className="material-symbols-outlined text-[32px] text-primary-container animate-spin">refresh</span>
                          <p className="font-label-md text-label-md font-bold">Executing Pothole Vision Scanner...</p>
                          <p className="text-xs text-outline-variant">Auditing surface depression and edge fracture lines</p>
                        </div>
                      ) : (
                        <>
                          <img
                            src={viewMode === 'annotated' && analysisResult?.annotated_image_url ? analysisResult.annotated_image_url : previewUrl}
                            alt="Road defect"
                            className="w-full h-full object-cover"
                          />

                          {/* Canvas overlay for drawing physical reference line */}
                          {addSizeReference && viewMode === 'original' && (
                            <canvas
                              ref={canvasRef}
                              width={480}
                              height={360}
                              onMouseDown={handleCanvasMouseDown}
                              onMouseMove={handleCanvasMouseMove}
                              onMouseUp={handleCanvasMouseUp}
                              className="absolute inset-0 w-full h-full cursor-crosshair z-20"
                            />
                          )}
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-inverse-surface/80 text-inverse-on-surface font-label-sm text-label-sm backdrop-blur-md hover:bg-inverse-surface transition-all cursor-pointer z-30"
                      >
                        Change Photo
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                      />
                    </div>

                    {/* FEATURE 1: ADD A SIZE REFERENCE TOOLBAR */}
                    <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-on-surface">
                          <input
                            type="checkbox"
                            checked={addSizeReference}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setAddSizeReference(checked);
                              if (checked) setViewMode('original');
                            }}
                            className="rounded border-outline-variant text-primary-container focus:ring-primary-container cursor-pointer"
                          />
                          <span>Add a size reference (calibrate real-world scale)</span>
                        </label>
                      </div>

                      {addSizeReference && (
                        <div className="space-y-2 pt-1 border-t border-surface-container text-xs animate-in fade-in duration-200">
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { id: 'coin', label: '🪙 ₹10 Coin (27 mm)' },
                              { id: 'a4', label: '📄 A4 Paper (297 mm)' },
                              { id: 'lane', label: '🛣️ Standard Lane Width (assumed ~3.0 m)' },
                            ].map((ref) => (
                              <button
                                key={ref.id}
                                type="button"
                                onClick={() => setReferenceType(ref.id)}
                                className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm font-semibold transition-all cursor-pointer ${
                                  referenceType === ref.id
                                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                              >
                                {ref.label}
                              </button>
                            ))}
                          </div>

                          <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between">
                            <span className="text-[11px] text-on-surface-variant">
                              {linePixels
                                ? `Line calibrated: ${Math.round(linePixels)} px`
                                : '👉 Draw a line over reference object on the raw photo'}
                            </span>
                            {linePixels && (
                              <button
                                type="button"
                                onClick={applyReferenceCalibration}
                                disabled={isAnalyzing}
                                className="px-2.5 py-1 rounded-lg bg-tertiary-container/30 hover:bg-tertiary-container text-tertiary font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">straighten</span>
                                Calibrate Scale
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI TELEMETRY DISPLAY */}
                    {analysisResult && (
                      <div>
                        {/* CASE A: NO POTHOLE DETECTED */}
                        {!hasPothole ? (
                          <div className="p-4 rounded-2xl bg-tertiary-container/15 border-2 border-tertiary/40 text-on-tertiary-container space-y-2 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-tertiary text-[26px]">verified</span>
                              <div>
                                <h4 className="font-bold text-sm text-tertiary">No Pothole Detected</h4>
                                <span className="text-[11px] text-secondary">Pavement Surface Audit: Intact &amp; Clear</span>
                              </div>
                            </div>
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                              The computer vision engine analyzed the asphalt surface and found no depressions, craters, or pavement rupture. Road condition satisfies safety standards.
                            </p>
                            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                              <div className="p-1.5 rounded bg-surface-container-lowest"><span className="text-secondary block">Defects:</span><strong>0 Craters Found</strong></div>
                              <div className="p-1.5 rounded bg-surface-container-lowest"><span className="text-secondary block">Integrity:</span><strong className="text-tertiary">100% Intact</strong></div>
                            </div>
                          </div>
                        ) : (
                          /* CASE B: 1 OR MORE POTHOLES (MULTIPLE POTHOLES SPECIFIED) */
                          <div className="space-y-3 animate-in fade-in duration-200">
                            {/* Multi-hazard Header */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container border border-surface-container-high text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${potholeCount >= 2 ? 'bg-primary-container animate-pulse' : 'bg-error'}`}></span>
                                <strong className="text-on-surface">
                                  {potholeCount === 1 ? '1 Pothole Detected' : `${potholeCount} Potholes Detected`}
                                </strong>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full bg-error-container text-error font-bold uppercase text-[10px]">
                                  {analysisResult.ai_analysis.overall_severity} Hazard
                                </span>
                              </div>
                            </div>

                            {/* If 2 or more, Tabbed Switcher for each specific pothole */}
                            {potholeCount >= 2 && (
                              <div>
                                <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block mb-1">
                                  Select Pothole to Inspect:
                                </span>
                                <div className="flex gap-1.5 overflow-x-auto pb-1">
                                  {detectionsList.map((det, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setSelectedPotholeIndex(idx)}
                                      className={`px-3 py-1.5 rounded-xl font-label-sm text-label-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                        selectedPotholeIndex === idx
                                          ? 'bg-primary-container text-on-primary-container shadow-sm'
                                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                      }`}
                                    >
                                      <span>{det.pothole_id}</span>
                                      <span className="text-[10px] opacity-80 font-normal">({det.severity})</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Specific Pothole Card Details */}
                            {selectedPothole && (
                              <div className="p-space-sm rounded-2xl bg-surface-container-low border-2 border-primary-container/40 space-y-2.5 text-xs">
                                <div className="flex items-center justify-between border-b border-surface-container pb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-on-surface text-sm font-mono">{selectedPothole.pothole_id}</span>
                                    <span className="text-[11px] text-secondary">• {selectedPothole.location_zone}</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full bg-error-container text-error font-bold uppercase text-[10px]">
                                    {selectedPothole.severity} Hazard
                                  </span>
                                </div>

                                {/* Metric Badges */}
                                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                                  <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high">
                                    <span className="text-secondary block">Depth</span>
                                    <strong className="text-error text-sm">{selectedPothole.depth_cm} cm</strong>
                                  </div>
                                  <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high relative">
                                    <div className="flex items-center gap-1">
                                      <span className="text-secondary block">Estimated Size</span>
                                      <div className="relative inline-block">
                                        <button
                                          type="button"
                                          onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                                          className="text-primary-container hover:text-amber-600 transition-colors cursor-pointer"
                                          title="Click for estimation details"
                                        >
                                          <span className="material-symbols-outlined text-[14px]">info</span>
                                        </button>
                                        {showInfoTooltip && (
                                          <div className="absolute left-0 bottom-full mb-1 w-52 p-2 bg-inverse-surface text-inverse-on-surface text-[10px] rounded-lg shadow-xl z-30">
                                            Estimate from a single photo, not a precise measurement.
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <strong className="text-on-surface text-xs block">
                                      {selectedPothole.dimensions_str || `about ${selectedPothole.est_width_cm || 45} x ${selectedPothole.est_length_cm || 30} cm`}
                                    </strong>
                                  </div>
                                  <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container-high">
                                    <span className="text-secondary block">AI Confidence</span>
                                    <strong className="text-tertiary text-xs">{Math.round(selectedPothole.confidence * 100)}%</strong>
                                  </div>
                                </div>

                                {/* Size Method & Area Ratio */}
                                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] px-1 text-on-surface-variant">
                                  <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-primary-container">square_foot</span>
                                    <span>Area ratio: <strong>{(selectedPothole.area_ratio * 100).toFixed(2)}%</strong> of frame</span>
                                    {selectedPothole.approx_area_cm2 > 0 && (
                                      <span>(~{selectedPothole.approx_area_cm2} cm²)</span>
                                    )}
                                  </div>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container border border-surface-container-high text-on-surface">
                                    {selectedPothole.size_method === 'reference'
                                      ? `Scale: Calibrated via ${analysisResult.ai_analysis.reference_name || 'Reference'}`
                                      : selectedPothole.size_method === 'mask'
                                      ? 'Scale: YOLO Mask Area'
                                      : 'Scale: Bounding Box Perspective'}
                                  </span>
                                </div>

                                {/* FEATURE 1: Severity Reasons Explainability List */}
                                {analysisResult.ai_analysis.severity_reasons && analysisResult.ai_analysis.severity_reasons.length > 0 && (
                                  <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[14px] text-primary-container">rule</span>
                                      Why this severity rating:
                                    </span>
                                    <ul className="space-y-0.5 text-[11px] text-on-surface-variant">
                                      {analysisResult.ai_analysis.severity_reasons.map((reason, rIdx) => (
                                        <li key={rIdx} className="flex items-start gap-1.5">
                                          <span className="text-tertiary mt-0.5 text-[12px] font-bold">•</span>
                                          <span>{reason}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Precise Geo-Location & Details */}
              <div className="md:col-span-6 space-y-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[11px] font-bold">2</span>
                    Geospatial Verification
                  </span>
                  <button
                    type="button"
                    onClick={handleGetBrowserLocation}
                    className="font-label-sm text-label-sm text-primary-container hover:text-amber-600 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">my_location</span>
                    Device GPS
                  </button>
                </div>

                {/* Mini Google Map Picker */}
                <div className="h-36 rounded-2xl overflow-hidden border border-surface-container-high relative">
                  <div ref={miniMapDivRef} style={{ width: '100%', height: '100%' }} />
                  <div className="absolute bottom-2 left-2 right-2 bg-inverse-surface/85 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-inverse-on-surface pointer-events-none flex items-center justify-between z-10">
                    <span>💡 Click map or drag marker to set coordinates</span>
                    <span className="font-mono text-primary-container">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-space-xs text-xs">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">Road / Landmark Address *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Rajpur Road, Astley Chowk lane 2"
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-on-surface mb-1">Ward Sector</label>
                      <select
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface focus:outline-none text-xs"
                      >
                        <option value="Ward 04 - Rajpur Sector">Ward 04 (Rajpur Sector)</option>
                        <option value="Ward 07 - Saharanpur Road">Ward 07 (Saharanpur Road)</option>
                        <option value="Ward 08 - Central Zone">Ward 08 (Central Zone)</option>
                        <option value="Ward 11 - Haridwar Bypass">Ward 11 (Haridwar Bypass)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-on-surface mb-1">Your Name</label>
                      <input
                        type="text"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">Observation Remarks (Optional)</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Dangerous for two-wheelers in evening rush hour, water pooling inside crater..."
                      className="w-full px-3 py-1.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface focus:outline-none text-xs resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                {!hasPothole && analysisResult ? (
                  <div className="p-3 rounded-xl bg-tertiary-container/20 text-on-tertiary-container text-center font-bold text-xs flex items-center justify-center gap-1.5 border border-tertiary/30">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
                    <span>No Pothole Detected • Submission Not Required</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={!analysisResult || isSubmitting}
                    className={`w-full py-3 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      analysisResult && hasPothole && !isSubmitting
                        ? 'bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container shadow-md hover:shadow-lg'
                        : 'bg-surface-container text-secondary cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                        Transmitting to PWD Dispatch...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">send</span>
                        Submit {potholeCount >= 2 ? `${potholeCount} Potholes` : 'Pothole'} to Municipal Works
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
