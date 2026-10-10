import React, { useState } from 'react';

export default function MunicipalCommandScreen({ reports = [], complaints = [], onRefreshData }) {
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id || 1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConsoleTab, setActiveConsoleTab] = useState('triage'); // 'triage' or 'grievances'

  // Dispatch Form States
  const [selectedCrew, setSelectedCrew] = useState('Quick-Patch Crew #4 (Central)');
  const [dispatchStatus, setDispatchStatus] = useState('In Progress');
  const [dispatchPriority, setDispatchPriority] = useState('Emergency');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Grievance response state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [authorityResponse, setAuthorityResponse] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleUpdateReport = async () => {
    if (!selectedReport) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: dispatchStatus,
          priority: dispatchPriority,
          assigned_crew: selectedCrew,
          authority_notes: dispatchNotes || `Dispatched ${selectedCrew} with hot-mix bituminous compound.`,
        }),
      });

      if (!res.ok) throw new Error('Update failed');
      alert(`Work order issued for ${selectedReport.report_code}!`);
      if (onRefreshData) onRefreshData();
    } catch (e) {
      console.error(e);
      alert('Could not update work order.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReplyComplaint = async (complaintId) => {
    setIsReplying(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Resolved',
          authority_response: authorityResponse || 'Grievance inspected and road segment patched by PWD squad.',
          assigned_officer: 'PWD Chief Engineer V. Negi',
        }),
      });
      if (!res.ok) throw new Error('Reply failed');
      alert('Citizen grievance marked resolved!');
      setSelectedComplaint(null);
      setAuthorityResponse('');
      if (onRefreshData) onRefreshData();
    } catch (e) {
      console.error(e);
      alert('Failed to respond to grievance.');
    } finally {
      setIsReplying(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'Critical' && r.severity !== 'Critical' && r.severity !== 'Severe') return false;
    if (statusFilter === 'Pending' && r.status !== 'Pending' && r.status !== 'Under Review') return false;
    if (statusFilter === 'Dispatched' && r.status !== 'In Progress' && r.status !== 'Scheduled') return false;
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

  return (
    <div className="w-full bg-background flex flex-col py-space-lg">
      <div className="max-w-7xl mx-auto w-full px-gutter-md lg:px-gutter-lg space-y-space-lg">
        
        {/* ── Command Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md border-b border-surface-container-high pb-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold">
                Municipal Operations &amp; Pothole Dispatch Command
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-container font-label-sm text-label-sm uppercase font-bold tracking-wider">
                Live OPS
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mt-1">
              Real-time road surface distress triage &amp; automated computer vision auditing • Central Division (Dehradun Urban)
            </p>
          </div>

          {/* Quick Filters & Live Feed Indicator */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest rounded-xl shadow-sm text-on-surface border border-surface-container-high">
              <span className="material-symbols-outlined text-[18px] text-secondary">grid_view</span>
              <select className="bg-transparent font-label-md text-label-md text-on-surface outline-none cursor-pointer">
                <option>All Wards (Wards 1-12)</option>
                <option>Ward 04 (Rajpur Sector)</option>
                <option>Ward 07 (Saharanpur Road)</option>
                <option>Ward 11 (Haridwar Bypass)</option>
              </select>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-2 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
              </span>
              <span className="font-label-sm text-label-sm text-on-surface font-semibold tracking-wide">
                Live Feed Active
              </span>
            </div>
          </div>
        </div>

        {/* ── 4 Operations KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Total Active Queue</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">inbox</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-xl text-headline-xl text-on-surface font-black">{reports.length}</span>
                <span className="inline-flex items-center text-error font-label-sm text-label-sm font-bold bg-error-container/40 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> +8.2%
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mt-1">+14 reported since yesterday morning</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container-high">
            <div className="absolute top-0 left-0 right-0 h-1 bg-error"></div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">High Severity</span>
              <span className="px-2 py-0.5 rounded-full bg-error-container text-error font-label-sm text-label-sm font-bold">Critical Priority</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-xl text-headline-xl text-error font-black">
                  {reports.filter((r) => r.severity === 'Critical' || r.severity === 'Severe').length}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Pending Triage</span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mt-1">Needs immediate dispatch &lt; 24h SLA target</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Avg Time to Fix</span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-sm text-label-sm font-bold">Optimal</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-xl text-headline-xl text-on-surface font-black">
                  31.4 <span className="font-headline-md text-headline-md font-bold text-secondary">hrs</span>
                </span>
                <span className="inline-flex items-center text-tertiary font-label-sm text-label-sm font-bold bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">speed</span> -16.6h
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mt-1">PWD SLA target: 48.0 hrs (Beating threshold)</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Citizen Grievances</span>
              <div className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">report_problem</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-xl text-headline-xl text-on-surface font-black">{complaints.length}</span>
                <span className="inline-flex items-center text-secondary font-label-sm text-label-sm font-bold bg-surface-container px-2 py-0.5 rounded-full">
                  {complaints.filter((c) => c.status !== 'Resolved').length} Active
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mt-1">Escalated citizen claims &amp; vehicle damage</p>
            </div>
          </div>
        </div>

        {/* ── View Switcher: Incident Triage vs Citizen Grievances ── */}
        <div className="flex items-center gap-2 border-b border-surface-container-high pb-2">
          <button
            onClick={() => setActiveConsoleTab('triage')}
            className={`px-4 py-2 rounded-xl font-label-md text-label-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeConsoleTab === 'triage'
                ? 'bg-primary-container text-on-primary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">table_rows</span>
            Incident Triage Grid ({reports.length})
          </button>
          <button
            onClick={() => setActiveConsoleTab('grievances')}
            className={`px-4 py-2 rounded-xl font-label-md text-label-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeConsoleTab === 'grievances'
                ? 'bg-error text-on-error shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">feedback</span>
            Citizen Grievances Inbox ({complaints.length})
          </button>
        </div>

        {/* ── Console Content ── */}
        {activeConsoleTab === 'triage' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-md">
            
            {/* Left Column (Table Area) */}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              {/* Search & Bulk Action Toolstrip */}
              <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm border border-surface-container-high">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by road name, report ID, ward..."
                    className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'All', label: `All Reports (${reports.length})` },
                  { id: 'Critical', label: 'Critical / High (34)', isCrit: true },
                  { id: 'Pending', label: 'Pending Verification' },
                  { id: 'Dispatched', label: 'Dispatched Crews' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setStatusFilter(pill.id)}
                    className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap cursor-pointer transition-all ${
                      statusFilter === pill.id
                        ? 'bg-on-surface text-surface font-bold'
                        : pill.isCrit
                        ? 'bg-error-container text-error font-semibold'
                        : 'bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container border border-surface-container-high'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Severity-Ranked Incident Table */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-surface-container-high">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low font-label-sm text-label-sm text-secondary uppercase tracking-wider border-b border-surface-container-high">
                        <th className="py-3 px-4">Hazard ID &amp; Preview</th>
                        <th className="py-3 px-4">Location &amp; Ward</th>
                        <th className="py-3 px-4">Severity &amp; Depth</th>
                        <th className="py-3 px-4">Verification</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
                      {filteredReports.map((r) => {
                        const isSelected = selectedReport?.id === r.id;
                        const isCrit = r.severity === 'Critical' || r.severity === 'Severe';

                        return (
                          <tr
                            key={r.id}
                            onClick={() => setSelectedReportId(r.id)}
                            className={`transition-colors cursor-pointer ${
                              isSelected ? 'bg-primary-container/15' : 'hover:bg-surface-container-low'
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container shadow-sm border border-surface-container-high">
                                  <img
                                    src={r.annotated_image_url || r.image_url}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                  {isCrit && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-error"></span>}
                                </div>
                                <div>
                                  <div className="font-label-lg text-label-lg text-on-surface font-bold font-mono">{r.report_code}</div>
                                  <div className="font-label-sm text-label-sm text-secondary">Today, 2h ago</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-label-md text-label-md font-semibold text-on-surface max-w-[160px] truncate">{r.address}</div>
                              <div className="font-label-sm text-label-sm text-secondary">{r.ward}</div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold uppercase ${
                                  isCrit ? 'bg-error-container text-error' : 'bg-primary-container/20 text-on-primary-container'
                                }`}
                              >
                                {r.severity} • {r.estimated_depth_cm}cm
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed/40 text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                                <span className="material-symbols-outlined text-[14px] text-tertiary">verified_user</span>
                                AI + GPS {Math.round((r.confidence || 0.9) * 100)}%
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-primary font-bold">
                                <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                                {r.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReportId(r.id);
                                }}
                                className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container hover:bg-amber-500 transition cursor-pointer inline-flex shadow-sm"
                                title="Inspect & Dispatch"
                              >
                                <span className="material-symbols-outlined text-[18px]">engineering</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column (Detailed Inspector HUD) */}
            <div className="lg:col-span-5 flex flex-col gap-space-md">
              {selectedReport && (
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-md flex flex-col gap-space-md border border-surface-container-high sticky top-24">
                  {/* Inspector Header */}
                  <div className="flex items-center justify-between border-b border-surface-container pb-space-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-md text-headline-md text-on-surface font-bold font-mono">
                        Inspector: {selectedReport.report_code}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-error-container text-error font-label-sm text-label-sm font-bold uppercase">
                      {selectedReport.severity} Hazard
                    </span>
                  </div>

                  {/* Vision AI Viewfinder / Annotated Image HUD */}
                  <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-inverse-surface shadow-inner border border-surface-container-high">
                    <img
                      src={selectedReport.annotated_image_url || selectedReport.image_url}
                      alt="Pothole visual inspection"
                      className="w-full h-full object-cover"
                    />

                    {/* Bounding Box HUD Overlay */}
                    <div className="absolute inset-x-12 inset-y-8 rounded-lg pointer-events-none" style={{ outline: '2px dashed #f59e0b', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.25)' }}>
                      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary-container"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary-container"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary-container"></div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary-container"></div>

                      <div className="absolute -top-7 left-0 px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">psychology</span>
                        Pothole: {Math.round((selectedReport.confidence || 0.92) * 100)}% Conf • Edge YOLOv8
                      </div>

                      <div className="absolute -bottom-7 right-0 px-2 py-0.5 rounded bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-label-sm text-label-sm font-mono flex items-center gap-1">
                        <span>Depth: ~{selectedReport.estimated_depth_cm}cm</span>
                      </div>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 bg-surface-container-lowest/90 backdrop-blur-md rounded-xl flex items-center justify-between text-on-surface font-label-sm text-label-sm">
                      <span className="flex items-center gap-1 text-tertiary font-semibold">
                        <span className="material-symbols-outlined text-[14px]">verified</span> Multi-Angle Verified
                      </span>
                      <span className="text-secondary font-mono text-[10px]">Sensor: Gyro 1.4G + Differential GPS</span>
                    </div>
                  </div>

                  {/* Structural Telemetry Indicators */}
                  <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2.5 rounded-xl border border-surface-container-high text-center">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-secondary">Cavity Depth</span>
                      <span className="font-headline-md text-headline-md text-error font-extrabold">{selectedReport.estimated_depth_cm} <span className="font-body-sm text-body-sm font-normal">cm</span></span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-label-sm text-label-sm text-secondary">Estimated Size</span>
                        <span
                          className="material-symbols-outlined text-[13px] text-primary-container cursor-help"
                          title="Estimate from a single photo, not a precise measurement"
                        >
                          info
                        </span>
                      </div>
                      <span className="font-label-md text-label-md text-on-surface font-extrabold">{selectedReport.estimated_dimensions || `about ${selectedReport.est_width_cm || 45} x ${selectedReport.est_length_cm || 30} cm`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-secondary">Size Method</span>
                      <span className="font-label-sm text-label-sm text-on-surface font-bold mt-1 uppercase">
                        {selectedReport.size_method || 'BBox'}
                      </span>
                    </div>
                  </div>

                  {/* Severity Reasons Explainability */}
                  {selectedReport.severity_reasons && selectedReport.severity_reasons.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high space-y-1 text-xs">
                      <span className="font-label-sm text-label-sm text-secondary font-bold block uppercase text-[10px]">Severity Factors &amp; Reasons</span>
                      <ul className="space-y-0.5 text-[11px] text-on-surface-variant">
                        {selectedReport.severity_reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="text-primary-container text-[12px] font-bold">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Crew Assignment & Dispatch Controls */}
                  <div className="space-y-3 bg-surface-container-low p-space-sm rounded-xl border border-surface-container-high text-xs">
                    <div>
                      <label className="font-label-sm text-label-sm text-secondary font-semibold uppercase block mb-1">Assign Paving Crew</label>
                      <select
                        value={selectedCrew}
                        onChange={(e) => setSelectedCrew(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl font-body-sm text-body-sm text-on-surface outline-none shadow-sm cursor-pointer border border-surface-container-high"
                      >
                        <option value="Quick-Patch Crew #4 (Central)">Quick-Patch Crew #4 (Central Division)</option>
                        <option value="Hot-Mix Asphalt Squad #2 (South)">Hot-Mix Asphalt Squad #2 (South)</option>
                        <option value="Emergency Roadworks Team #1 (Night)">Emergency Roadworks Team #1 (Night)</option>
                        <option value="Ward 08 Local Maintenance Unit">Ward 08 Local Maintenance Unit</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-label-sm text-label-sm text-secondary font-semibold uppercase block mb-1">Status Step</label>
                        <select
                          value={dispatchStatus}
                          onChange={(e) => setDispatchStatus(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-surface-container-lowest rounded-xl font-body-sm text-body-sm text-on-surface outline-none border border-surface-container-high"
                        >
                          <option value="Under Review">Under Review</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="In Progress">In Progress (Crew En Route)</option>
                          <option value="Repaired">Repaired &amp; Cleared</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-label-sm text-label-sm text-secondary font-semibold uppercase block mb-1">Priority</label>
                        <select
                          value={dispatchPriority}
                          onChange={(e) => setDispatchPriority(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-surface-container-lowest rounded-xl font-body-sm text-body-sm text-on-surface outline-none border border-surface-container-high"
                        >
                          <option value="Emergency">Emergency (Immediate)</option>
                          <option value="High">High Priority</option>
                          <option value="Medium">Medium Priority</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-label-sm text-label-sm text-secondary font-semibold uppercase block mb-1">Work Order Dispatch Notes</label>
                      <input
                        type="text"
                        value={dispatchNotes}
                        onChange={(e) => setDispatchNotes(e.target.value)}
                        placeholder="e.g. Dispatched asphalt truck with 2T hot-mix bituminous compound..."
                        className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl font-body-sm text-body-sm text-on-surface outline-none border border-surface-container-high"
                      />
                    </div>

                    <button
                      onClick={handleUpdateReport}
                      disabled={isUpdating}
                      className="w-full py-3 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-label-md text-label-md font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                      {isUpdating ? 'Transmitting Work Order...' : 'Dispatch PWD Work Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Citizen Grievance Management Inbox ── */
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg border border-surface-container-high space-y-space-md">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-space-xs">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Citizen Grievance Resolution Inbox</h3>
                <p className="text-xs text-secondary">Escalation claims regarding road accident risks, vehicle damages, and repair delays.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-error-container text-error font-label-sm text-label-sm font-bold">
                {complaints.length} Total Registered
              </span>
            </div>

            <div className="space-y-space-sm">
              {complaints.map((c) => (
                <div key={c.id} className="p-space-md rounded-2xl bg-surface-container-low border border-surface-container-high space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-error">{c.ticket_number}</span>
                      <strong className="text-on-surface text-sm">{c.subject}</strong>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-error-container text-error font-label-sm text-label-sm font-bold">
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant bg-surface-container-lowest p-3 rounded-xl border border-surface-container">
                    "{c.description}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-secondary">
                    <div>Filed by: <strong className="text-on-surface">{c.citizen_name}</strong> ({c.citizen_email})</div>
                    
                    {c.status !== 'Resolved' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type official municipal resolution reply..."
                          value={selectedComplaint?.id === c.id ? authorityResponse : ''}
                          onChange={(e) => {
                            setSelectedComplaint(c);
                            setAuthorityResponse(e.target.value);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-surface-container text-on-surface text-xs w-64"
                        />
                        <button
                          onClick={() => handleReplyComplaint(c.id)}
                          className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-bold hover:bg-amber-500 cursor-pointer text-xs"
                        >
                          Resolve &amp; Reply
                        </button>
                      </div>
                    ) : (
                      <span className="text-tertiary font-semibold">Resolved • Reply: "{c.authority_response}"</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
