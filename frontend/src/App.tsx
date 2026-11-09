import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/authContext';
import { Header } from './components/layout/Header';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { TabletBottomBar } from './components/layout/TabletBottomBar';
import { GuidedStoryPill } from './components/exhibition/GuidedStoryPill';

// Pages
import { ExecutiveKpiDashboard } from './pages/desktop/ExecutiveKpiDashboard';
import { QualityReports } from './pages/desktop/QualityReports';
import { MasterDataView } from './pages/desktop/MasterDataView';
import { AuditLogView } from './pages/desktop/AuditLogView';
import { TabletHome } from './pages/tablet/TabletHome';
import { ShopfloorPdiChecklist } from './pages/tablet/ShopfloorPdiChecklist';
import { ShopfloorBomVerify } from './pages/tablet/ShopfloorBomVerify';
import { FastNcrRaiser } from './pages/tablet/FastNcrRaiser';
import { Panel360View } from './pages/tablet/Panel360View';
import { VcbProductShowcase } from './pages/tablet/VcbProductShowcase';

const AppLayout: React.FC = () => {
  const { appMode } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-industrial-surface font-sans text-industrial-graphite">
      {/* Top Academic Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Primary Header with Mode Switcher & Role Selector */}
      <Header />

      {/* 5-Min Exhibition Guided Story Pill */}
      <GuidedStoryPill />

      {/* Main Body Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Render Desktop Sidebar only in desktop mode */}
        {appMode === 'desktop' && <DesktopSidebar />}

        {/* Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <Routes>
            {/* Root Route: Adapts to App Mode */}
            <Route
              path="/"
              element={appMode === 'desktop' ? <ExecutiveKpiDashboard /> : <TabletHome />}
            />

            {/* Desktop-Optimized Routes */}
            <Route path="/reports" element={<QualityReports />} />
            <Route path="/master" element={<MasterDataView />} />
            <Route path="/ecr" element={<QualityReports />} />
            <Route path="/audit" element={<AuditLogView />} />

            {/* Mobile / Tablet Shopfloor Touch Routes */}
            <Route path="/tablet" element={<TabletHome />} />
            <Route path="/pdi-touch" element={<ShopfloorPdiChecklist />} />
            <Route path="/bom-touch" element={<ShopfloorBomVerify />} />
            <Route path="/ncr-fast" element={<FastNcrRaiser />} />
            <Route path="/panel/:serial" element={<Panel360View />} />
            <Route path="/vcb-showcase" element={<VcbProductShowcase />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Render Tablet/Mobile Bottom Bar when in tablet mode or on mobile screen */}
          <div className={appMode === 'tablet' ? 'block' : 'block md:hidden'}>
            <TabletBottomBar />
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
