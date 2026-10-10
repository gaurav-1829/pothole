import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Clock, 
  User, 
  Mail, 
  Phone,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function ComplaintCenter({ prefilledReport, onComplaintSubmitted }) {
  const [citizenName, setCitizenName] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [subject, setSubject] = useState(
    prefilledReport ? `Grievance regarding Pothole Hazard ${prefilledReport.report_code}` : ''
  );
  const [category, setCategory] = useState('Vehicle Damage');
  const [priority, setPriority] = useState('Urgent');
  const [description, setDescription] = useState(
    prefilledReport ? `Pothole location: ${prefilledReport.address} (Severity: ${prefilledReport.severity}). Please prioritize urgent repair.` : ''
  );
  const [reportId, setReportId] = useState(prefilledReport ? prefilledReport.id : '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Ticket Lookup State
  const [searchTicket, setSearchTicket] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        citizen_name: citizenName,
        citizen_email: citizenEmail,
        citizen_phone: citizenPhone,
        subject: subject,
        category: category,
        priority: priority,
        description: description,
        report_id: reportId ? parseInt(reportId) : null,
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Complaint submission failed');
      const data = await res.json();
      setSubmittedTicket(data);
      if (onComplaintSubmitted) onComplaintSubmitted(data);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      alert('Failed to submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookupTicket = async (e) => {
    e.preventDefault();
    if (!searchTicket.trim()) return;
    setIsSearching(true);
    setSearchError('');
    setLookupResult(null);

    try {
      const res = await fetch(`/api/complaints?search=${encodeURIComponent(searchTicket.trim())}`);
      if (!res.ok) throw new Error('Search failed');
      const list = await res.json();
      const match = list.find(c => c.ticket_number.toLowerCase() === searchTicket.trim().toLowerCase());
      if (match) {
        setLookupResult(match);
      } else {
        setSearchError('No grievance ticket found matching this reference ID.');
      }
    } catch (err) {
      console.error(err);
      setSearchError('Error looking up grievance status.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          Public Grievance Escalation Cell
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          File a Complaint to Municipal Road Authority
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Encountered vehicle damage, severe traffic risk, or unaddressed potholes? Submit an official escalation ticket directly to the Public Works Department (PWD).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Complaint Submission Form */}
        <div className="lg:col-span-7">
          {submittedTicket ? (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Grievance Registered</span>
                <h2 className="text-2xl font-bold text-slate-100 mt-1">Ticket: {submittedTicket.ticket_number}</h2>
                <p className="text-xs text-slate-400 mt-2">
                  Your formal complaint has been logged and assigned to the Municipal Inspection Officer.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Subject:</span> <span className="text-slate-200 font-medium">{submittedTicket.subject}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Category:</span> <span className="text-slate-200">{submittedTicket.category}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Status:</span> <span className="text-rose-400 font-bold">{submittedTicket.status}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Official Reply:</span> <span className="text-amber-400 italic">{submittedTicket.authority_response}</span></div>
              </div>

              <button
                onClick={() => {
                  setSubmittedTicket(null);
                  setSubject('');
                  setDescription('');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Submit Another Grievance
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitComplaint} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                Citizen Grievance Submission Form
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Grievance Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Vehicle Damage">Vehicle Rim / Tire / Chassis Damage</option>
                    <option value="Delayed Repair">Unresolved & Delayed Repair</option>
                    <option value="Pedestrian Safety">Pedestrian / Cyclist Hazard</option>
                    <option value="Waterlogging">Waterlogging & Hidden Pit</option>
                    <option value="Repeat Issue">Recurring Asphalt Erosion</option>
                  </select>
                </div>
              </div>

              <div className="text-xs space-y-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Complaint Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Severe wheel rim damage due to unlit deep pothole"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Detailed Description of Incident / Hazard *</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe exact spot, timestamp of incident, vehicle damage details, or risk observations..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20"
              >
                {isSubmitting ? (
                  'Submitting Ticket...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Complaint to Authority
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Ticket Status Tracker & FAQ */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ticket Tracker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              Track Grievance Status
            </h2>
            <p className="text-xs text-slate-400">
              Enter your Grievance Reference Ticket (e.g. <span className="text-slate-200 font-mono">CMP-2026-0101</span>) to view real-time inspection and resolution progress.
            </p>

            <form onSubmit={handleLookupTicket} className="flex gap-2">
              <input
                type="text"
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
                placeholder="CMP-2026-XXXX"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs uppercase font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Track
              </button>
            </form>

            {searchError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-400 text-xs">
                {searchError}
              </div>
            )}

            {lookupResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono font-bold text-rose-400">{lookupResult.ticket_number}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {lookupResult.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Subject</span>
                  <p className="font-medium text-slate-200">{lookupResult.subject}</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Official Municipal Response</span>
                  <p className="italic text-amber-300 bg-slate-900 p-2 rounded border border-slate-800">
                    "{lookupResult.authority_response || 'Inspection team notified.'}"
                  </p>
                </div>
                <div className="text-[11px] text-slate-500">
                  Officer: <span className="text-slate-300">{lookupResult.assigned_officer}</span> • Filed: {new Date(lookupResult.created_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          {/* Citizen Rights & Service Charter */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs text-slate-400">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Municipal Service Charter
            </h3>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li><strong className="text-slate-300">Critical Hazards:</strong> Emergency barrier placement within 6 hours.</li>
              <li><strong className="text-slate-300">Standard Potholes:</strong> Hot-mix asphalt patch within 48 to 72 hours.</li>
              <li><strong className="text-slate-300">Damage Claims:</strong> Official acknowledgment within 24 hours.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
