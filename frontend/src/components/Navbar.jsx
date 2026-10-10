import React from 'react';
import { Camera, MapPin, ShieldAlert, FileText, AlertTriangle, Activity } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, reportCount = 0, openComplaintsCount = 0 }) {
  const navItems = [
    { id: 'detect', label: 'AI Detection & Report', icon: Camera, badge: null },
    { id: 'map', label: 'Live Hazard Map', icon: MapPin, badge: reportCount > 0 ? reportCount : null },
    { id: 'authority', label: 'Authority Portal', icon: ShieldAlert, badge: 'Official' },
    { id: 'complaint', label: 'Citizen Grievance', icon: FileText, badge: openComplaintsCount > 0 ? `${openComplaintsCount} Open` : null },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('detect')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-0.5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  RoadWatch AI
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Intelligent Pothole Detection & Civic Action</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.id === 'authority'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : item.id === 'complaint'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
