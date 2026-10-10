import React, { useState, useEffect } from 'react';
import Navbar from './components/stitch/Navbar';
import Footer from './components/stitch/Footer';
import LandingPage from './components/stitch/LandingPage';
import LiveMapScreen from './components/stitch/LiveMapScreen';
import MyReportsScreen from './components/stitch/MyReportsScreen';
import MunicipalCommandScreen from './components/stitch/MunicipalCommandScreen';
import CityAnalyticsScreen from './components/stitch/CityAnalyticsScreen';
import ReportModal from './components/stitch/ReportModal';
import GrievanceModal from './components/stitch/GrievanceModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'live-map', 'my-reports', 'municipal-portal', 'analytics'
  const [reports, setReports] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGrievanceModalOpen, setIsGrievanceModalOpen] = useState(false);
  const [prefilledGrievanceReport, setPrefilledGrievanceReport] = useState(null);

  // Fetch live reports, complaints, analytics
  const fetchData = async () => {
    try {
      const [reportsRes, complaintsRes, analyticsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/complaints'),
        fetch('/api/analytics'),
      ]);

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data);
      }
      if (complaintsRes.ok) {
        const data = await complaintsRes.json();
        setComplaints(data);
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenGrievance = (report = null) => {
    setPrefilledGrievanceReport(report);
    setIsGrievanceModalOpen(true);
  };

  const handleReportSubmitted = () => {
    fetchData();
  };

  const openComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* ── Stitch Header ── */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        openComplaintsCount={openComplaintsCount}
      />

      {/* ── Main View Container (Offset for fixed 5rem / h-20 header) ── */}
      <main className="w-full pt-20 flex-1 flex flex-col">
        {activeTab === 'home' && (
          <LandingPage
            analytics={analytics}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'live-map' && (
          <LiveMapScreen
            reports={reports}
            onSelectReport={(rep) => console.log('Selected:', rep)}
            onFileGrievance={handleOpenGrievance}
            onRefreshReports={fetchData}
          />
        )}

        {activeTab === 'my-reports' && (
          <MyReportsScreen
            reports={reports}
            onNavigateToMap={() => setActiveTab('live-map')}
            onFileGrievance={handleOpenGrievance}
            onRefreshReports={fetchData}
          />
        )}

        {activeTab === 'municipal-portal' && (
          <MunicipalCommandScreen
            reports={reports}
            complaints={complaints}
            onRefreshData={fetchData}
          />
        )}

        {activeTab === 'analytics' && (
          <CityAnalyticsScreen
            analytics={analytics}
          />
        )}
      </main>

      {/* ── Stitch Footer (shown on all pages except fullscreen live-map) ── */}
      {activeTab !== 'live-map' && (
        <Footer
          onNavigate={(tab) => setActiveTab(tab)}
          onFileGrievance={() => handleOpenGrievance(null)}
        />
      )}

      {/* ── Interactive Report Pothole Modal (AI YOLOv8 + GPS + Pin Picker) ── */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportSubmitted={handleReportSubmitted}
        onViewMap={() => {
          setIsReportModalOpen(false);
          setActiveTab('live-map');
        }}
      />

      {/* ── Interactive Citizen Grievance Modal ── */}
      <GrievanceModal
        isOpen={isGrievanceModalOpen}
        onClose={() => setIsGrievanceModalOpen(false)}
        prefilledReport={prefilledGrievanceReport}
        onComplaintSubmitted={fetchData}
      />
    </div>
  );
}
