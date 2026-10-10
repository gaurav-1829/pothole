import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Search, 
  Wrench, 
  UserCheck, 
  FileText, 
  ExternalLink,
  Flame,
  ArrowUpDown,
  Send,
  Sparkles,
  TrendingUp,
  Inbox
} from 'lucide-react';

const STATUS_CONFIG = {
  'Pending': { color: '#ef4444', label: 'Pending Inspection', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
  'Under Review': { color: '#f97316', label: 'Under Review', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' },
  'Scheduled': { color: '#a855f7', label: 'Work Scheduled', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40' },
  'In Progress': { color: '#eab308', label: 'In Progress', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
  'Repaired': { color: '#10b981', label: 'Repaired & Cleared', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
  'Rejected': { color: '#64748b', label: 'Invalid / Rejected', bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/40' },
};

const SEVERITY_CONFIG = {
  'Critical': { badge: 'bg-red-500/20 text-red-400 border-red-500/40' },
  'Severe': { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  'Moderate': { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  'Minor': { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
};

export default function AuthorityDashboard({ reports = [], complaints = [], analytics, onRefreshData }) {
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'complaints'
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Report for Action Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalPriority, setModalPriority] = useState('');
  const [modalCrew, setModalCrew] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Selected Complaint for Reply Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintStatus, setComplaintStatus] = useState('');
  const [complaintReply, setComplaintReply] = useState('');
  const [complaintOfficer, setComplaintOfficer] = useState('');
  const [isUpdatingComplaint, setIsUpdatingComplaint] = useState(false);

  // Open Edit Modal for a Report
  const handleOpenActionModal = (report) => {
    setSelectedReport(report);
    setModalStatus(report.status);
    setModalPriority(report.priority || 'Medium');
    setModalCrew(report.assigned_crew || 'Rapid Asphalt Repair Squad #1');
    setModalNotes(report.authority_notes || '');
  };

  // Submit Report Update to Backend
  const handleSaveReportUpdate = async () => {
    if (!selectedReport) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: modalStatus,
          priority: modalPriority,
          assigned_crew: modalCrew,
          authority_notes: modalNotes,
        }),
      });

      if (!res.ok) throw new Error('Update failed');
      setSelectedReport(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Error updating report:', err);
      alert('Failed to update report status.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Complaint Modal
  const handleOpenComplaintModal = (complaint) => {
    setSelectedComplaint(complaint);
    setComplaintStatus(complaint.status);
    setComplaintReply(complaint.authority_response || '');
    setComplaintOfficer(complaint.assigned_officer || 'Chief Grievance Officer');
  };

  // Submit Complaint Update
  const handleSaveComplaintUpdate = async () => {
    if (!selectedComplaint) return;
    setIsUpdatingComplaint(true);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: complaintStatus,
          authority_response: complaintReply,
          assigned_officer: complaintOfficer,
        }),
      });

      if (!res.ok) throw new Error('Complaint update failed');
      setSelectedComplaint(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Error updating complaint:', err);
      alert('Failed to update complaint.');
    } finally {
      setIsUpdatingComplaint(false);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (severityFilter !== 'All' && r.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.report_code?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q) ||
        r.ward?.toLowerCase().includes(q) ||
        r.citizen_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2.5">
              <ShieldAlert className="w-7 h-7 text-amber-500" />
              Municipal Authority & Public Works Portal
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Dispatch repair squads, monitor road health KPIs, update inspection statuses, and resolve citizen grievances.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Pothole Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'complaints'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Citizen Grievances ({complaints.length})
          </button>
        </div>
      </div>

      {/* KPI & Analytics Ribbon */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Hazards</span>
            <div className="text-2xl font-extrabold text-slate-100">{analytics.summary?.total_reports || reports.length}</div>
            <div className="text-[11px] text-slate-500">Across all municipal wards</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-red-900/30 space-y-1">
            <span className="text-xs text-red-400 font-medium flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Critical / Pending
            </span>
            <div className="text-2xl font-extrabold text-red-400">{analytics.severity_breakdown?.Critical || 0}</div>
            <div className="text-[11px] text-red-400/70">Urgent hazard attention</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-yellow-900/30 space-y-1">
            <span className="text-xs text-yellow-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> In Progress / Scheduled
            </span>
            <div className="text-2xl font-extrabold text-yellow-400">{analytics.summary?.in_progress_count || 0}</div>
            <div className="text-[11px] text-yellow-400/70">Crews active on site</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-900/30 space-y-1">
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Rate
            </span>
            <div className="text-2xl font-extrabold text-emerald-400">{analytics.summary?.resolution_rate_pct || 0}%</div>
            <div className="text-[11px] text-emerald-400/70">{analytics.summary?.repaired_count || 0} repaired successfully</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-rose-900/30 space-y-1 col-span-2 lg:col-span-1">
            <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
              <Inbox className="w-3.5 h-3.5" /> Open Grievances
            </span>
            <div className="text-2xl font-extrabold text-rose-400">{analytics.summary?.open_complaints || complaints.filter(c => c.status !== 'Resolved').length}</div>
            <div className="text-[11px] text-rose-400/70">Citizen escalation tickets</div>
          </div>
        </div>
      )}

      {/* Main Tab 1: Pothole Reports Management */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-4 p-5">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by code, street, citizen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Repaired">Repaired</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="Severe">Severe</option>
                <option value="Moderate">Moderate</option>
                <option value="Minor">Minor</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Visual / Code</th>
                  <th className="py-3 px-3">Location & Ward</th>
                  <th className="py-3 px-3">AI Severity & Metrics</th>
                  <th className="py-3 px-3">Priority & Crew</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No reports match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG['Pending'];
                    const sevCfg = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG['Moderate'];

                    return (
                      <tr key={report.id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={report.annotated_image_url || report.image_url}
                              alt="Pothole"
                              className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-700 flex-shrink-0"
                            />
                            <div>
                              <span className="font-mono font-bold text-slate-200 block">{report.report_code}</span>
                              <span className="text-[10px] text-slate-400">{new Date(report.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-200 max-w-[200px] truncate">{report.address}</div>
                          <div className="text-[11px] text-slate-400">{report.ward}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${sevCfg.badge}`}>
                              {report.severity}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              Depth: <span className="text-amber-400 font-semibold">{report.estimated_depth_cm}cm</span> • {report.estimated_dimensions}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-300">{report.priority || 'Medium'}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{report.assigned_crew || 'Unassigned'}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg.color }}></span>
                            {report.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenActionModal(report)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            Dispatch / Update
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Tab 2: Citizen Grievance Inbox */}
      {activeTab === 'complaints' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Inbox className="w-5 h-5 text-rose-400" />
                Citizen Escalation & Grievance Tickets
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Complaints filed by road users regarding damages or repair delays.</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {complaints.length} Total Tickets
            </span>
          </div>

          <div className="space-y-3">
            {complaints.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No citizen grievances filed yet.
              </div>
            ) : (
              complaints.map((c) => {
                const isResolved = c.status === 'Resolved';
                return (
                  <div
                    key={c.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isResolved
                        ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-400">{c.ticket_number}</span>
                        <span className="text-xs font-bold text-slate-200">{c.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {c.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isResolved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mb-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800/60">
                      "{c.description}"
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-slate-800/80 pt-2 text-slate-400">
                      <div>
                        Filed by: <span className="text-slate-200 font-medium">{c.citizen_name}</span> ({c.citizen_email || c.citizen_phone || 'Contact provided'})
                      </div>

                      <div className="flex items-center gap-2">
                        {c.authority_response && (
                          <span className="text-[11px] text-amber-400 italic truncate max-w-xs">
                            Reply: "{c.authority_response}"
                          </span>
                        )}
                        <button
                          onClick={() => handleOpenComplaintModal(c)}
                          className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                        >
                          Respond / Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Action Modal for Pothole Report (Update status, crew, priority) */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-amber-400 font-bold block">{selectedReport.report_code}</span>
                <h3 className="text-base font-bold text-slate-100">Authority Dispatch & Status Update</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Workflow Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                >
                  <option value="Pending">Pending Inspection</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Scheduled">Scheduled for Repair</option>
                  <option value="In Progress">In Progress (Crew On Site)</option>
                  <option value="Repaired">Repaired & Resolved</option>
                  <option value="Rejected">Rejected (Not a hazard)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Priority Level</label>
                  <select
                    value={modalPriority}
                    onChange={(e) => setModalPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="Emergency">Emergency (Immediate)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low / Scheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assigned Maintenance Crew</label>
                  <input
                    type="text"
                    value={modalCrew}
                    onChange={(e) => setModalCrew(e.target.value)}
                    placeholder="e.g. Rapid Patch Unit 4"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Internal Inspection & Action Notes</label>
                <textarea
                  rows={3}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="e.g. Dispatched asphalt truck with 2T hot-mix bituminous compound..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500 text-xs resize-none"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReportUpdate}
                disabled={isUpdating}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition-all shadow-lg"
              >
                {isUpdating ? 'Saving...' : 'Apply Status Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal for Complaint (Reply & status) */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-rose-400 font-bold block">{selectedComplaint.ticket_number}</span>
                <h3 className="text-base font-bold text-slate-100">Respond to Citizen Grievance</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">{selectedComplaint.subject}</div>
                <div className="text-slate-400">{selectedComplaint.description}</div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Grievance Status</label>
                <select
                  value={complaintStatus}
                  onChange={(e) => setComplaintStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-rose-500 text-xs"
                >
                  <option value="Open">Open</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Escalated to PWD">Escalated to PWD</option>
                  <option value="Action Taken">Action Taken / Crew Dispatched</option>
                  <option value="Resolved">Resolved & Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Assigned Officer / Department</label>
                <input
                  type="text"
                  value={complaintOfficer}
                  onChange={(e) => setComplaintOfficer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Official Response to Citizen</label>
                <textarea
                  rows={3}
                  value={complaintReply}
                  onChange={(e) => setComplaintReply(e.target.value)}
                  placeholder="e.g. The pothole has been patched by Unit #4. Thank you for notifying the municipal authority."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-rose-500 text-xs resize-none"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-3">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComplaintUpdate}
                disabled={isUpdatingComplaint}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold transition-all shadow-lg"
              >
                {isUpdatingComplaint ? 'Submitting...' : 'Send Official Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
