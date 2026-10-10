import React from 'react';

export default function Navbar({ activeTab, setActiveTab, onOpenReportModal, openComplaintsCount = 0 }) {
  const navItems = [
    { id: 'home', label: 'How It Works', icon: 'info' },
    { id: 'live-map', label: 'Live Map', icon: 'map' },
    { id: 'my-reports', label: 'My Reports', icon: 'assignment' },
    { id: 'municipal-portal', label: 'Municipal Command', icon: 'shield' },
    { id: 'analytics', label: 'City Analytics', icon: 'bar_chart' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/60">
      <div className="h-20 max-w-7xl mx-auto px-margin md:px-gutter-lg flex items-center justify-between gap-space-md">
        {/* Brand / Logo */}
        <div className="flex items-center gap-space-md">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-space-sm group text-left cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-container flex items-center justify-center shadow-[0_2px_6px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-on-primary-container text-[24px]">warning</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
                  Pothole<span className="text-primary-container">Watch</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                Civic Infrastructure AI
              </span>
            </div>
          </button>
        </div>

        {/* Central Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-space-xs p-1 bg-surface-container-low rounded-xl">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-space-md py-space-sm font-label-md text-label-md rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action & Profile Toolbar */}
        <div className="flex items-center gap-space-sm md:gap-space-md">
          {/* Institutional Verified Badge */}
          <div className="hidden md:flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container border border-outline-variant/40">
            <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Dehradun Verified Portal
            </span>
          </div>

          {/* Primary Report Pothole Button */}
          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center justify-center gap-space-xs h-11 sm:h-12 px-space-md sm:px-space-lg rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold shadow-[0_2px_8px_rgba(245,158,11,0.28)] hover:bg-primary-fixed-dim transition-all cursor-pointer hover:shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span className="hidden sm:inline">Report Pothole</span>
            <span className="sm:hidden">Report</span>
          </button>

          {/* User Profile Avatar */}
          <div 
            onClick={() => setActiveTab('my-reports')}
            className="flex items-center gap-space-xs cursor-pointer group pl-1"
            title="Citizen Inspector Profile"
          >
            <div className="flex flex-col text-right hidden sm:block">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Aarav Sharma</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Citizen Inspector</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
