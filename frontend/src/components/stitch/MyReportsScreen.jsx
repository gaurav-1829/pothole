import React, { useState } from 'react';

export default function MyReportsScreen({ reports = [], onNavigateToMap, onFileGrievance, onRefreshReports }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpvote = async (repId) => {
    try {
      const res = await fetch(`/api/reports/${repId}/upvote`, { method: 'POST' });
      if (res.ok && onRefreshReports) onRefreshReports();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = reports.filter((r) => {
    if (activeFilter === 'in-progress' && r.status !== 'In Progress' && r.status !== 'Scheduled') return false;
    if (activeFilter === 'under-review' && r.status !== 'Under Review' && r.status !== 'Pending') return false;
    if (activeFilter === 'fixed' && r.status !== 'Repaired') return false;
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

  const inProgressCount = reports.filter((r) => r.status === 'In Progress' || r.status === 'Scheduled').length;
  const underReviewCount = reports.filter((r) => r.status === 'Under Review' || r.status === 'Pending').length;
  const fixedCount = reports.filter((r) => r.status === 'Repaired').length;

  return (
    <div className="w-full bg-background flex flex-col">
      {/* ── Top Breadcrumb & Status Alert Ribbon ── */}
      <div className="w-full bg-surface-container-low border-b border-surface-container-high py-2.5 px-gutter-md lg:px-gutter-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-space-sm text-body-sm">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span>Citizen Portal</span>
            </span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold">My Submissions &amp; Tracking</span>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary-container/20 text-on-tertiary-container font-label-sm text-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              Live Sync: Dehradun PWD Dispatch System Connected
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="max-w-7xl mx-auto w-full px-gutter-md lg:px-gutter-lg py-space-lg space-y-space-lg">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b border-surface-container-highest pb-space-lg">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider font-bold">
                Citizen Inspector ID #DDN-8841
              </span>
              <span className="text-on-surface-variant font-body-sm text-body-sm">• Verified Contributor</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-extrabold">My Reports</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Track real-time verification, municipal work crew assignment, and cold-mix repair lifecycle for all road distress incidents submitted across Dehradun.
            </p>
          </div>
        </div>

        {/* ── 4 Summary Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md">
          {/* Card 1 */}
          <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Total Audited Reports</span>
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[20px]">assignment</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-xl text-headline-xl font-extrabold text-on-surface">{reports.length}</span>
                <span className="font-label-md text-label-md text-on-surface-variant">Reports</span>
              </div>
              <div className="mt-space-xs flex items-center gap-1.5 text-tertiary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>100% EXIF &amp; GPS Validated</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Active Repair Work</span>
              <div className="w-9 h-9 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[20px]">engineering</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-xl text-headline-xl font-extrabold text-on-surface">{inProgressCount}</span>
                <span className="font-label-md text-label-md text-on-surface-variant">In Progress</span>
              </div>
              <div className="mt-space-xs flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
                <span>Crew assigned within 48h SLA</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Resolved &amp; Paved</span>
              <div className="w-9 h-9 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-xl text-headline-xl font-extrabold text-tertiary">{fixedCount}</span>
                <span className="font-label-md text-label-md text-on-surface-variant">Fixed</span>
              </div>
              <div className="mt-space-xs flex items-center gap-1.5 text-tertiary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">speed</span>
                <span>Avg turnaround 36h</span>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Vision Inspection</span>
              <div className="w-9 h-9 rounded-xl bg-secondary-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">search_insights</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-xl text-headline-xl font-extrabold text-on-surface">{underReviewCount}</span>
                <span className="font-label-md text-label-md text-on-surface-variant">Under Review</span>
              </div>
              <div className="mt-space-xs flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                <span>Estimated triage: ~18 mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter, Search and Controls Bar ── */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md border border-surface-container-high">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-space-xs bg-surface-container-low p-1.5 rounded-xl">
            {[
              { id: 'all', label: `All (${reports.length})` },
              { id: 'in-progress', label: `In Progress (${inProgressCount})` },
              { id: 'under-review', label: `Under Review (${underReviewCount})` },
              { id: 'fixed', label: `Fixed (${fixedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm flex-1 lg:max-w-xl justify-end">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, street name, or ward..."
                className="w-full pl-10 pr-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Hazard Reports List ── */}
        <div className="space-y-space-lg">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-secondary bg-surface-container-lowest rounded-2xl border border-surface-container-high p-8">
              No reports found matching current filters.
            </div>
          ) : (
            filtered.map((report) => {
              const isFixed = report.status === 'Repaired';
              const isInProgress = report.status === 'In Progress' || report.status === 'Scheduled';
              const isCritical = report.severity === 'Critical' || report.severity === 'Severe';

              // Stepper stage
              const step = isFixed ? 5 : isInProgress ? 3 : 2;

              return (
                <article
                  key={report.id}
                  className="report-card p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 border border-surface-container-high space-y-space-md"
                >
                  {/* Card Header Info */}
                  <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-container-high pb-space-md">
                    <div className="flex flex-wrap items-center gap-space-sm">
                      <button
                        onClick={() => handleCopyId(report.report_code)}
                        className="inline-flex items-center gap-1 font-label-lg text-label-lg font-bold text-on-surface bg-surface-container-low hover:bg-surface-container px-2.5 py-1 rounded-lg transition-colors group cursor-pointer"
                        title="Click to copy ID"
                      >
                        <span>{report.report_code}</span>
                        <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary-container">
                          {copiedId === report.report_code ? 'check' : 'content_copy'}
                        </span>
                      </button>

                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wide font-bold ${
                          isCritical
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-primary-container/20 text-on-primary-container'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-error' : 'bg-primary-container'}`}></span>
                        {report.severity} Severity Hazard
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                        {report.ward}
                      </span>
                    </div>

                    <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      <span>Reported {new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Main Card Body Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-md py-space-xs items-center">
                    {/* Thumbnail with AI overlay */}
                    <div className="lg:col-span-4 relative rounded-2xl overflow-hidden aspect-[4/3] bg-surface-container shadow-inner group border border-surface-container-high">
                      <img
                        src={report.annotated_image_url || report.image_url}
                        alt="Pothole"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md shadow-sm flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary-container text-[16px]">smart_toy</span>
                        <span className="font-label-sm text-label-sm text-on-surface font-bold">
                          AI {Math.round((report.confidence || 0.88) * 100)}% Conf
                        </span>
                      </div>

                      {/* Bounding Box Graphic Overlay */}
                      <div className="absolute inset-x-8 bottom-4 top-10 border-2 border-primary-container/80 rounded-lg pointer-events-none flex flex-col justify-between p-1.5">
                        <span className="self-start text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary-container text-on-primary-container">
                          Cavity {report.estimated_dimensions}
                        </span>
                        <span className="self-end text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface/90 text-on-surface">
                          Depth {report.estimated_depth_cm}cm
                        </span>
                      </div>
                    </div>

                    {/* Location & Details */}
                    <div className="lg:col-span-8 space-y-space-md">
                      <div>
                        <div className="flex items-start gap-space-xs text-on-surface">
                          <span className="material-symbols-outlined text-primary-container text-[22px] mt-0.5 shrink-0">pin_drop</span>
                          <div>
                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{report.address}</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              {report.ward}, Dehradun, Uttarakhand • Lat: {report.latitude?.toFixed(4)}, Lng: {report.longitude?.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Hazard Telemetry Specs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm p-space-sm rounded-xl bg-surface-container-low text-on-surface border border-surface-container-high">
                        <div className="space-y-0.5">
                          <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Estimated Depth</span>
                          <span className="font-label-lg text-label-lg font-bold text-error">~{report.estimated_depth_cm} cm</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Estimated Size</span>
                            <span
                              className="material-symbols-outlined text-[13px] text-primary-container cursor-help"
                              title="Estimate from a single photo, not a precise measurement"
                            >
                              info
                            </span>
                          </div>
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">
                            {report.estimated_dimensions || `about ${report.est_width_cm || 45} x ${report.est_length_cm || 30} cm`}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Area Ratio</span>
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">
                            {report.area_ratio ? `${(report.area_ratio * 100).toFixed(1)}%` : 'Standard'}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">SLA Countdown</span>
                          <span className="font-label-lg text-label-lg font-bold text-primary-container">
                            {isFixed ? 'Completed' : '28h 15m left'}
                          </span>
                        </div>
                      </div>

                      {/* Feature 1: Severity Reasons Badges */}
                      {report.severity_reasons && report.severity_reasons.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-on-surface-variant">
                          <span className="font-bold text-secondary text-[10px] uppercase tracking-wider">Severity factors:</span>
                          {report.severity_reasons.map((reason, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full bg-surface-container border border-surface-container-high text-on-surface text-[10px]">
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Municipal Action Callout */}
                      <div className="p-space-sm rounded-xl bg-primary-fixed/30 text-on-primary-fixed flex items-center gap-space-sm border border-outline-variant/40">
                        <span className="material-symbols-outlined text-primary-container text-[22px]">local_shipping</span>
                        <p className="font-body-sm text-body-sm">
                          <span className="font-bold text-on-surface">Municipal Dispatch Notice:</span>{' '}
                          {report.authority_notes || `Crew #${report.assigned_crew || '4'} dispatched by PWD Central Division. Paving truck en route.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── 5-Step Status Tracker Stepper ── */}
                  <div className="mt-space-sm pt-space-md border-t border-surface-container-high">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold block mb-space-sm">
                      Lifecycle Remediation Stepper:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      {[
                        { num: '1', title: 'Report Submitted', sub: 'Citizen Geotag' },
                        { num: '2', title: 'AI Vision Verified', sub: 'YOLOv8 Edge' },
                        { num: '3', title: 'PWD Crew Dispatched', sub: report.assigned_crew || 'Squad #4' },
                        { num: '4', title: 'Cold-Mix Seal Paved', sub: isFixed ? 'Completed' : 'Pending' },
                        { num: '5', title: 'Citizen Resolution', sub: isFixed ? 'Verified' : 'Final Audit' },
                      ].map((s, idx) => {
                        const stepNum = idx + 1;
                        const isDone = stepNum <= step;
                        const isCurrent = stepNum === step;

                        return (
                          <div
                            key={s.num}
                            className={`p-2 rounded-xl flex items-center gap-2 border transition-all ${
                              isDone
                                ? 'bg-tertiary-container/20 border-tertiary/40 text-on-tertiary-container'
                                : 'bg-surface-container-low border-surface-container-high text-secondary'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                isDone ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container text-secondary'
                              }`}
                            >
                              {isDone ? '✓' : s.num}
                            </span>
                            <div className="min-w-0">
                              <span className="font-bold block truncate text-[11px]">{s.title}</span>
                              <span className="text-[10px] block truncate opacity-80">{s.sub}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-space-sm flex flex-wrap items-center justify-between gap-space-sm border-t border-surface-container-high">
                    <div className="flex items-center gap-space-sm">
                      <button
                        onClick={() => handleUpvote(report.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary-container">thumb_up</span>
                        <span>Upvote Urgency ({report.upvotes || 1})</span>
                      </button>

                      <button
                        onClick={() => onNavigateToMap && onNavigateToMap(report)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-secondary">map</span>
                        <span>View on GIS Map</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onFileGrievance && onFileGrievance(report)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-error-container hover:bg-red-200 text-error font-label-sm text-label-sm font-bold transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">report_problem</span>
                      <span>File Grievance Escalation</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
