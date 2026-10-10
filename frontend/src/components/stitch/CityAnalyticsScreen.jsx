import React from 'react';

export default function CityAnalyticsScreen({ analytics }) {
  const wardsData = [
    { ward: 'Ward 04 (Rajpur Sector)', density: 'High (48 craters)', avgTime: '26.4h', crews: 'Crew #4, Crew #1', sla: '94%' },
    { ward: 'Ward 07 (Saharanpur Road)', density: 'High (39 craters)', avgTime: '31.2h', crews: 'Crew #2', sla: '88%' },
    { ward: 'Ward 08 (Clock Tower Central)', density: 'Critical (52 craters)', avgTime: '22.8h', crews: 'Crew #4, Rapid #1', sla: '96%' },
    { ward: 'Ward 11 (Haridwar Bypass)', density: 'Medium (24 craters)', avgTime: '42.0h', crews: 'Crew #3', sla: '82%' },
    { ward: 'Ward 03 (Ballupur Chowk)', density: 'Low (12 craters)', avgTime: '18.5h', crews: 'Patrol #1', sla: '99%' },
  ];

  return (
    <div className="w-full bg-background flex flex-col py-space-lg">
      <div className="max-w-7xl mx-auto w-full px-gutter-md lg:px-gutter-lg space-y-space-xl">
        
        {/* Top Breadcrumb HUD */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg border-b border-surface-container-high pb-space-md">
          <div className="space-y-space-xs max-w-2xl">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                Municipal Corporation of Dehradun • PWD GIS Live Hub
              </span>
              <span className="font-label-sm text-label-sm text-secondary">Telemetric Cycle #2026-Q1</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-extrabold">
              City Road Analytics &amp; SLA Intelligence
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Municipal monitoring of road distress density, ward remediation velocity, and infrastructure vulnerability indices across Dehradun urban sectors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm bg-surface-container-lowest p-2 rounded-2xl shadow-sm border border-surface-container-high">
            <div className="flex items-center bg-surface-container-low rounded-xl px-3 py-1.5 gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">calendar_today</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">Active Cycle</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 rounded-lg font-label-sm text-label-sm font-bold bg-surface-container-lowest text-on-surface shadow-xs">30D</button>
              <button className="px-2.5 py-1 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">90D</button>
              <button className="px-2.5 py-1 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">YTD</button>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Distress Density</span>
                <span className="p-2 rounded-xl bg-surface-container-low text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">analytics</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-headline-lg text-headline-lg font-extrabold text-on-surface">1,284</span>
                <span className="font-label-sm text-label-sm text-tertiary flex items-center font-bold">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +14%
                </span>
              </div>
            </div>
            <div className="pt-space-md flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span className="flex items-center gap-1 text-tertiary font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span> 98.2% AI Verified
              </span>
              <span className="text-secondary">vs prev cycle</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Avg Remediation Time</span>
                <span className="p-2 rounded-xl bg-secondary-container text-on-secondary-container">
                  <span className="material-symbols-outlined text-[20px]">timer</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-headline-lg text-headline-lg font-extrabold text-on-surface">31.4<span className="text-headline-md font-medium text-secondary ml-1">hrs</span></span>
                <span className="font-label-sm text-label-sm text-tertiary flex items-center font-bold">
                  <span className="material-symbols-outlined text-[14px]">arrow_downward</span> -12%
                </span>
              </div>
            </div>
            <div className="pt-space-md flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span className="text-on-surface font-semibold">Target: &lt; 48h SLA</span>
              <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold">16.6h Headroom</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Active PWD Squads</span>
                <span className="p-2 rounded-xl bg-primary-fixed text-on-primary-fixed-variant">
                  <span className="material-symbols-outlined text-[20px]">engineering</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-headline-lg text-headline-lg font-extrabold text-on-surface">18</span>
                <span className="font-body-sm text-body-sm text-secondary font-semibold">/ 24 Wards Active</span>
              </div>
            </div>
            <div className="pt-space-md flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden flex">
                <div className="bg-primary-container h-full" style={{ width: '75%' }}></div>
                <div className="bg-surface-container-high h-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Critical Hazard Index</span>
                <span className="p-2 rounded-xl bg-error-container text-error">
                  <span className="material-symbols-outlined text-[20px]">crisis_alert</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-headline-lg text-headline-lg font-extrabold text-error">42</span>
                <span className="font-label-sm text-label-sm text-error font-bold px-2 py-0.5 rounded-full bg-error-container">Urgent Patching</span>
              </div>
            </div>
            <div className="pt-space-md flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span className="text-on-surface font-semibold">&gt; 6cm Depth / High Flow</span>
              <span className="text-error font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">bolt</span> Immediate
              </span>
            </div>
          </div>
        </div>

        {/* Heatmap & Ward Performance Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
          {/* Left: Heatmap Canvas Simulation */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div className="flex items-start justify-between gap-space-sm mb-space-sm">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">City Pothole Density Heatmap</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Geospatial concentration of road surface cavities and asphalt failure clusters</p>
              </div>
            </div>

            <div className="relative w-full h-80 my-space-sm bg-surface-container-low rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-surface-container-high">
              <svg className="absolute inset-0 w-full h-full text-outline-variant/60" preserveAspectRatio="none" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
                <path d="M 0,80 Q 200,120 600,60" fill="none" stroke="currentColor" strokeDasharray="4 2" strokeWidth="2" />
                <path d="M 50,400 Q 180,260 220,0" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M 0,220 L 600,280" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M 310,0 L 290,210 L 370,400" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4.5" />
                <path d="M 0,160 L 290,210" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
                <path d="M 290,210 L 600,340" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
                <circle cx="290" cy="210" fill="none" r="140" stroke="currentColor" strokeDasharray="2 4" strokeWidth="1" />
              </svg>

              <div className="absolute left-[45%] top-[48%] -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-radial from-red-600/70 via-amber-500/40 to-transparent blur-md pointer-events-none animate-pulse"></div>
              <div className="absolute left-[48%] top-[52%] w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-lg"></div>
              <div className="absolute left-[34%] top-[70%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-radial from-amber-500/60 via-amber-400/30 to-transparent blur-sm pointer-events-none"></div>
              <div className="absolute left-[34%] top-[70%] w-3.5 h-3.5 rounded-full bg-primary-container border-2 border-white shadow-md"></div>
            </div>

            <div className="flex items-center justify-between text-xs text-secondary pt-2">
              <span>● Red: Critical (&gt;10cm depth)</span>
              <span>● Amber: Moderate</span>
              <span>● Green: Repaired within SLA</span>
            </div>
          </div>

          {/* Right: Ward Performance Table */}
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high space-y-space-md">
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Ward Remediation Leaderboard</h3>
              <p className="font-body-sm text-body-sm text-secondary">Service level turnaround compliance per municipal zone</p>
            </div>

            <div className="space-y-2.5">
              {wardsData.map((w, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-on-surface block">{w.ward}</strong>
                    <span className="text-secondary">{w.density} • Crews: {w.crews}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-tertiary block">{w.sla} SLA</span>
                    <span className="text-[11px] text-secondary">Avg {w.avgTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
