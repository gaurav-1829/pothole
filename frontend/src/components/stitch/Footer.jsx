import React from 'react';

export default function Footer({ onNavigate, onFileGrievance }) {
  return (
    <footer className="w-full bg-surface-container-low shadow-[0_-1px_8px_rgba(0,0,0,0.03)] border-t border-surface-container-high/80 mt-margin-lg">
      <div className="max-w-7xl mx-auto px-margin md:px-gutter-lg pt-space-xl pb-space-lg">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter-lg mb-space-xl">
          {/* Col 1 & 2: Platform Info & Emergency Hotline */}
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container text-[20px]">warning</span>
              </div>
              <span className="font-headline-md text-headline-md font-bold text-on-surface">PotholeWatch</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
              Real-time civic hazard identification powered by citizen vision AI and direct municipal public works integration. Rapid dispatch, transparent auditing, and safer roadways for all.
            </p>
            <div className="flex flex-col gap-space-xs mt-space-sm p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container-high">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">24/7 Road Emergency Hotline</span>
              <a className="font-headline-md text-headline-md font-bold text-primary-container hover:text-amber-600 transition-colors flex items-center gap-2" href="tel:18001802024">
                <span className="material-symbols-outlined text-[22px]">call</span>
                1800-180-2024 (Toll-Free)
              </a>
              <span className="text-[11px] text-on-surface-variant">Dehradun Municipal Corporation • PWD Rapid Action</span>
            </div>
          </div>

          {/* Col 3: Municipal Operations */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-bold">Municipal Operations</span>
            <button onClick={() => onNavigate('municipal-portal')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
              Public Works Command
            </button>
            <button onClick={() => onNavigate('live-map')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
              Asphalt Dispatch Grid
            </button>
            <button onClick={() => onNavigate('analytics')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
              Municipal SLA Index
            </button>
            <button onClick={() => onNavigate('my-reports')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
              Citizen Tracking Console
            </button>
          </div>

          {/* Col 4: Service Level Standards */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-bold">Service Level Standards</span>
            <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm font-bold text-error flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-error"></span> Tier 1 Hazard: &lt; 24h
              </span>
              <span className="font-body-sm text-body-sm text-secondary">Severe cratering &gt; 10cm depth</span>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm font-bold text-primary-container flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-container"></span> Tier 2 Hazard: &lt; 48h
              </span>
              <span className="font-body-sm text-body-sm text-secondary">Moderate arterial road erosion</span>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm font-bold text-tertiary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span> Tier 3 Hazard: &lt; 7 Days
              </span>
              <span className="font-body-sm text-body-sm text-secondary">Minor surface spalling</span>
            </div>
          </div>

          {/* Col 5: Citizen Grievance & Transparency */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-bold">Citizen Grievance</span>
            <button 
              onClick={onFileGrievance}
              className="px-3 py-2 rounded-xl bg-error-container text-on-error-container font-label-md text-label-md font-bold flex items-center gap-2 hover:bg-red-200 transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">report_problem</span>
              File Formal Grievance
            </button>
            <p className="text-[12px] text-on-surface-variant leading-relaxed">
              Vehicle rim bend, axle rupture, or delayed repair? Escalate directly to Municipal Grievance Officer.
            </p>
            <div className="pt-2 flex items-center gap-1 text-tertiary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>100% Audit Guaranteed</span>
            </div>
          </div>
        </div>

        {/* UN SDG Alignment Ribbons */}
        <div className="pt-space-lg mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border-t border-surface-container-high">
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              Aligned with UN Sustainable Development Goals
            </span>
            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="px-space-md py-space-xs rounded-full bg-surface-container-high flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                <span className="font-label-sm text-label-sm text-on-surface font-bold">SDG 3</span>
                <span className="font-body-sm text-body-sm text-secondary">Good Health & Well-Being</span>
              </div>
              <div className="px-space-md py-space-xs rounded-full bg-surface-container-high flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                <span className="font-label-sm text-label-sm text-on-surface font-bold">SDG 9</span>
                <span className="font-body-sm text-body-sm text-secondary">Industry & Infrastructure</span>
              </div>
              <div className="px-space-md py-space-xs rounded-full bg-surface-container-high flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span className="font-label-sm text-label-sm text-on-surface font-bold">SDG 11</span>
                <span className="font-body-sm text-body-sm text-secondary">Sustainable Cities & Communities</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="px-space-md py-space-xs rounded-lg bg-surface-container text-on-tertiary-container flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[18px] text-tertiary">verified</span>
              <span className="font-label-sm text-label-sm font-bold text-on-surface">Municipal Certified Platform</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-center md:text-left border-t border-surface-container-high/60">
          <p className="font-body-sm text-body-sm text-secondary">
            © 2026 Municipal Corporation of Dehradun & PotholeWatch Civic Works. All rights reserved.
          </p>
          <div className="flex items-center gap-space-md">
            <span className="font-body-sm text-body-sm text-secondary hover:text-on-surface transition-colors cursor-pointer">Terms of Service</span>
            <span className="font-body-sm text-body-sm text-secondary hover:text-on-surface transition-colors cursor-pointer">Privacy Charter</span>
            <span className="font-body-sm text-body-sm text-secondary hover:text-on-surface transition-colors cursor-pointer">Open Road Health API</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
