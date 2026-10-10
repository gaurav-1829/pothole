import React, { useState } from 'react';

export default function GrievanceModal({ isOpen, onClose, prefilledReport, onComplaintSubmitted }) {
  const [citizenName, setCitizenName] = useState('Aarav Sharma');
  const [citizenEmail, setCitizenEmail] = useState('aarav.sharma@example.com');
  const [citizenPhone, setCitizenPhone] = useState('+91 98765 43210');
  const [subject, setSubject] = useState(
    prefilledReport ? `Severe Hazard Escalation: ${prefilledReport.report_code || '#PW-20481'}` : 'Vehicle Rim & Alloy Damage from Unmarked Crater'
  );
  const [category, setCategory] = useState('Vehicle Damage');
  const [priority, setPriority] = useState('Urgent');
  const [description, setDescription] = useState(
    prefilledReport
      ? `Incident at ${prefilledReport.address} (Severity: ${prefilledReport.severity}). Cavity depth of ${prefilledReport.estimated_depth_cm}cm caused scooter loss of balance and tire puncture. Request immediate barrier placement.`
      : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Ticket Lookup State
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        citizen_name: citizenName,
        citizen_email: citizenEmail,
        citizen_phone: citizenPhone,
        subject,
        category,
        priority,
        description,
        report_id: prefilledReport?.id || null,
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to submit grievance');
      const data = await res.json();
      setSubmittedTicket(data);
      if (onComplaintSubmitted) onComplaintSubmitted(data);
    } catch (err) {
      console.error(err);
      alert('Could not submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setIsLookingUp(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const res = await fetch(`/api/complaints?search=${encodeURIComponent(lookupId.trim())}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      const match = data.find((c) => c.ticket_number.toLowerCase() === lookupId.trim().toLowerCase());
      if (match) {
        setLookupResult(match);
      } else {
        setLookupError('No grievance ticket found for this ID.');
      }
    } catch (err) {
      console.error(err);
      setLookupError('Error looking up grievance.');
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-surface-container-high my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-space-lg py-space-md bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[22px]">report_problem</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Citizen Grievance Escalation</h2>
              <p className="text-xs text-on-surface-variant">Direct appeal to Municipal Road Authority &amp; Public Works Inspector</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-space-lg space-y-space-lg">
          {submittedTicket ? (
            /* Success confirmation */
            <div className="text-center space-y-space-md py-4">
              <div className="w-16 h-16 rounded-full bg-tertiary-container/30 text-tertiary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[36px]">verified</span>
              </div>
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-tertiary font-bold">Formal Grievance Registered</span>
                <h3 className="font-headline-xl text-headline-xl font-extrabold text-on-surface mt-1">
                  Ticket #{submittedTicket.ticket_number}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mt-2">
                  Assigned to Municipal Grievance Officer. Guaranteed review within 24 hours under the Civic Service Charter.
                </p>
              </div>

              <div className="max-w-md mx-auto p-space-md rounded-2xl bg-surface-container text-left text-xs space-y-2 border border-surface-container-high">
                <div className="flex justify-between"><span className="text-secondary">Subject:</span><strong className="text-on-surface">{submittedTicket.subject}</strong></div>
                <div className="flex justify-between"><span className="text-secondary">Category:</span><span>{submittedTicket.category}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Status:</span><span className="font-bold text-error uppercase">{submittedTicket.status}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Official Response:</span><span className="text-primary italic font-medium">{submittedTicket.authority_response}</span></div>
              </div>

              <button
                onClick={onClose}
                className="px-space-xl py-3 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-label-md text-label-md font-bold shadow-md transition-all cursor-pointer"
              >
                Close &amp; Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Form to submit grievance */}
              <form onSubmit={handleSubmit} className="space-y-space-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface focus:outline-none focus:ring-2 focus:ring-error text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">Email for Resolution Notice *</label>
                    <input
                      type="email"
                      required
                      value={citizenEmail}
                      onChange={(e) => setCitizenEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface focus:outline-none focus:ring-2 focus:ring-error text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">Grievance Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface focus:outline-none text-xs"
                    >
                      <option value="Vehicle Damage">Vehicle Rim / Alloy / Tire Damage</option>
                      <option value="Delayed Repair">Delayed Repair Escalation (&gt; 48h)</option>
                      <option value="Pedestrian Hazard">Pedestrian &amp; Cyclist Hazard</option>
                      <option value="Waterlogging">Waterlogging &amp; Hidden Pit</option>
                      <option value="Poor Quality">Substandard Cold-Mix Patch Quality</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">Urgency Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface focus:outline-none text-xs"
                    >
                      <option value="Urgent">Urgent (Immediate Danger)</option>
                      <option value="High">High Priority</option>
                      <option value="Normal">Normal Review</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs space-y-3">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">Incident Subject *</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface focus:outline-none focus:ring-2 focus:ring-error text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">Incident / Damage Details *</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the incident, exact location, vehicle damage, cost incurred, or severe hazard observed..."
                      className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface focus:outline-none focus:ring-2 focus:ring-error text-xs resize-none"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-error hover:bg-red-700 text-on-error font-label-md text-label-md font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    'Transmitting Grievance...'
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Transmit Official Grievance to Authority
                    </>
                  )}
                </button>
              </form>

              {/* Look up existing ticket */}
              <div className="pt-space-md border-t border-surface-container-high">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold block mb-2">
                  Track Existing Ticket
                </span>
                <form onSubmit={handleLookup} className="flex gap-2">
                  <input
                    type="text"
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value)}
                    placeholder="Enter Ticket ID (e.g. CMP-2026-0101)"
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                  <button
                    type="submit"
                    disabled={isLookingUp}
                    className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-bold cursor-pointer"
                  >
                    Track
                  </button>
                </form>

                {lookupError && (
                  <p className="text-xs text-error mt-2">{lookupError}</p>
                )}

                {lookupResult && (
                  <div className="mt-3 p-space-sm rounded-xl bg-surface-container-low border border-surface-container-high text-xs space-y-1 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <strong className="text-on-surface">{lookupResult.ticket_number}</strong>
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-error font-bold uppercase text-[10px]">
                        {lookupResult.status}
                      </span>
                    </div>
                    <p className="text-on-surface-variant font-medium">{lookupResult.subject}</p>
                    <p className="text-primary italic mt-1 bg-surface-container p-2 rounded-lg">
                      "{lookupResult.authority_response || 'Inspection team assigned.'}"
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
