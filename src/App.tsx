import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPageView } from './components/landing/LandingPageView';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';

// Admin Views
import { AdminLayout } from './components/admin/AdminLayout';
import { VehicleFleetView } from './components/screens/VehicleFleetView';
import { TacticalGisView } from './components/screens/TacticalGisView';
import { AlertsRiskIntelligenceView } from './components/alerts/AlertsRiskIntelligenceView';
import { DispatchConsoleView } from './components/screens/DispatchConsoleView';
import { RouteInfoView } from './components/screens/RouteInfoView';
import { NerAiView } from './components/screens/NerAiView';
import { FieldTerminalView } from './components/screens/FieldTerminalView';
import { NortheastCommandCenterView } from './components/screens/NortheastCommandCenterView';

// Driver Views
import { DriverLayout } from './components/driver/DriverLayout';
import { DriverDashboardView } from './components/driver/DriverDashboardView';

// Simulation Views
import { SimulationLayout } from './components/simulation/SimulationLayout';
import { SimulationDashboardView } from './components/simulation/SimulationDashboardView';

// Services and Stores
import { useTelemetryStore } from './store/useTelemetryStore';
import { sseClient } from './services/sseClient';

// Helper component for Admin Vehicle GIS View
const AdminVehicleGisRoute: React.FC = () => {
  const { isIndividualVehicleView } = useTelemetryStore();
  return isIndividualVehicleView ? <TacticalGisView /> : <VehicleFleetView />;
};

export const App: React.FC = () => {
  const { fetchInitialData } = useTelemetryStore();

  useEffect(() => {
    // 1. Fetch initial live data from persistent database
    fetchInitialData();

    // 2. Connect real-time telemetry stream
    sseClient.connect();

    return () => {
      sseClient.disconnect();
    };
  }, [fetchInitialData]);

  return (
    <BrowserRouter>
      <Routes>
        
        {/* ================================================================= */}
        {/* PUBLIC ROUTES                                                     */}
        {/* ================================================================= */}
        <Route path="/" element={<LandingPageView />} />
        <Route path="/home" element={<LandingPageView />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ================================================================= */}
        {/* ADMIN WORKSPACE (Protected + ADMIN Role Guard)                    */}
        {/* ================================================================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/vehicle-gis" replace />} />
          <Route path="vehicle-gis" element={<AdminVehicleGisRoute />} />
          <Route path="field-reporting" element={<FieldTerminalView />} />
          <Route path="field-terminal" element={<FieldTerminalView />} />
          <Route path="alerts" element={<AlertsRiskIntelligenceView />} />
          <Route path="reroute" element={<DispatchConsoleView />} />
          <Route path="route-info" element={<RouteInfoView />} />
          <Route path="ner-ai" element={<NerAiView />} />
          <Route path="command-center" element={<NortheastCommandCenterView />} />
          <Route path="stockout-radar" element={<NortheastCommandCenterView />} />
          <Route path="disruption-simulator" element={<NortheastCommandCenterView />} />
          <Route path="supply-allocation" element={<NortheastCommandCenterView />} />
          <Route path="incident-reporter" element={<NortheastCommandCenterView />} />
          <Route path="dashboard" element={<Navigate to="/admin/command-center" replace />} />
          <Route path="fleet" element={<Navigate to="/admin/vehicle-gis" replace />} />
          <Route path="completed" element={<Navigate to="/admin/vehicle-gis" replace />} />
          <Route path="analytics" element={<Navigate to="/admin/vehicle-gis" replace />} />
          <Route path="reports" element={<Navigate to="/admin/vehicle-gis" replace />} />
          <Route path="*" element={<Navigate to="/admin/vehicle-gis" replace />} />
        </Route>

        {/* ================================================================= */}
        {/* DRIVER WORKSPACE (Protected + DRIVER Role Guard)                  */}
        {/* ================================================================= */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['DRIVER']}>
                <DriverLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/driver/dashboard" replace />} />
          <Route path="dashboard" element={<DriverDashboardView />} />
          <Route path="journey" element={<DriverDashboardView />} />
          <Route path="navigation" element={<DriverDashboardView />} />
          <Route path="alerts" element={<DriverDashboardView />} />
          <Route path="report-incident" element={<DriverDashboardView />} />
          <Route path="*" element={<Navigate to="/driver/dashboard" replace />} />
        </Route>

        {/* ================================================================= */}
        {/* SIMULATION WORKSPACE (Protected + SIMULATION_OPERATOR Role Guard) */}
        {/* ================================================================= */}
        <Route
          path="/simulation"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['SIMULATION_OPERATOR']}>
                <SimulationLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/simulation/dashboard" replace />} />
          <Route path="dashboard" element={<SimulationDashboardView />} />
          <Route path="history" element={<SimulationDashboardView />} />
          <Route path="*" element={<Navigate to="/simulation/dashboard" replace />} />
        </Route>

        {/* ================================================================= */}
        {/* CATCH-ALL REDIRECT                                                */}
        {/* ================================================================= */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
