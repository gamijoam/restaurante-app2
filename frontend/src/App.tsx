import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContextProduction';
import { LicenseProvider } from './context/LicenseContext';
import LicenseGuard from './components/LicenseGuard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { useLicenseValidation } from './hooks/useLicenseValidation';
import LicenseExpiredModal from './components/LicenseExpiredModal';

import LoginPage from './pages/LoginPage';
import TableSelectionPage from './pages/TableSelectionPage';
import OrderPage from './pages/OrderPage';
import KitchenViewPage from './pages/KitchenViewPage';
import KitchenDashboardPage from './pages/KitchenDashboardPage';
import CashierViewPage from './pages/CashierViewPage';
import MesaMapaPage from './pages/MesaMapaPage';
import GestionMesasPage from './pages/GestionMesasPage';
import ReportesPage from './pages/ReportesPage';
import UserManagementPage from './pages/UserManagementPage';
import FacturacionPage from './pages/FacturacionPage';
import IngredientesPage from './pages/IngredientesPage';
import RecetasPage from './pages/RecetasPage';
import InventarioHelpPage from './pages/InventarioHelpPage';
import RolesPermisosPage from './pages/RolesPermisosPage';
import PrinterSettingsPage from './pages/PrinterSettingsPage.tsx';
import ConfiguracionGeneralPage from './pages/ConfiguracionGeneralPage';
import TicketTemplatesPage from './pages/TicketTemplatesPage';
import PreparationAreasPage from './pages/PreparationAreasPage';
import ProductAreaAssignmentPage from './pages/ProductAreaAssignmentPage';
import ComandaAreaManagementPage from './pages/ComandaAreaManagementPage';
import TestDivisionPage from './pages/TestDivisionPage';
import LicenseActivationPage from './pages/LicenseActivationPage';
import LicenseAdminPage from './pages/LicenseAdminPage';
import BusinessConfigPage from './pages/BusinessConfigPage';
import DolarRatePage from './pages/DolarRatePage';
import PrintTestPage from './pages/PrintTestPage';

const AppContent: React.FC = () => {
  const { showExpiredModal, setShowExpiredModal } = useLicenseValidation({ 
    checkInterval: 30 * 60 * 1000, // 30 minutos para desarrollo
    enabled: true 
  });

  return (
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/license" element={<LicenseActivationPage />} />
        <Route path="/license-admin" element={<LicenseAdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Rutas protegidas */}
        <Route path="/" element={
          <LicenseGuard>
            <Layout />
          </LicenseGuard>
        }>
          <Route 
            index
            element={
              <ProtectedRoute allowedPermissions={['TOMAR_PEDIDOS']}>
                <TableSelectionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="order/:mesaId" 
            element={
              <ProtectedRoute allowedPermissions={['TOMAR_PEDIDOS']}>
                <OrderPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="cocina" 
            element={
              <ProtectedRoute allowedPermissions={['VER_COCINA']}>
                <KitchenViewPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="kitchen-dashboard" 
            element={
              <ProtectedRoute allowedPermissions={['VER_COCINA']}>
                <KitchenDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="caja" 
            element={
              <ProtectedRoute allowedPermissions={['VER_CAJA']}>
                <CashierViewPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="mapa-mesas" 
            element={
              <ProtectedRoute allowedPermissions={['GESTIONAR_MESAS']}>
                <MesaMapaPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="gestion-mesas" 
            element={
              <ProtectedRoute allowedPermissions={['GESTIONAR_MESAS']}>
                <GestionMesasPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="reportes" 
            element={
              <ProtectedRoute allowedPermissions={['VER_REPORTES']}>
                <ReportesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="usuarios" 
            element={
              <ProtectedRoute allowedPermissions={['CREAR_USUARIOS']}>
                <UserManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="facturacion" 
            element={
              <ProtectedRoute allowedPermissions={['VER_FACTURAS']}>
                <FacturacionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="ingredientes" 
            element={
              <ProtectedRoute allowedPermissions={['GESTIONAR_INGREDIENTES']}>
                <IngredientesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="recetas" 
            element={
              <ProtectedRoute allowedPermissions={['GESTIONAR_RECETAS']}>
                <RecetasPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="roles-permisos" 
            element={
              <ProtectedRoute allowedPermissions={['GESTIONAR_ROLES']}>
                <RolesPermisosPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="inventario-help" 
            element={
              <ProtectedRoute allowedPermissions={['GESTIONAR_INGREDIENTES']}>
                <InventarioHelpPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="configuracion" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                <ConfiguracionGeneralPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="ticket-templates" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                <TicketTemplatesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="areas-preparacion" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                <PreparationAreasPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="asignacion-productos" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                <ProductAreaAssignmentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="gestion-comandas" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                <ComandaAreaManagementPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="test-division" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                <TestDivisionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="printer-settings" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                <PrinterSettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="business-config" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                <BusinessConfigPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="dolar-rates" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                <DolarRatePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="print-test" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                <PrintTestPage />
              </ProtectedRoute>
            } 
          />
          {/* Ruta catch-all para no encontrados */}
          <Route path="*" element={<div>Página no encontrada</div>} />
        </Route>
        {/* Ruta catch-all global */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
      {/* Modal para licencia expirada */}
      <LicenseExpiredModal 
        open={showExpiredModal} 
        onClose={() => setShowExpiredModal(false)} 
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <LicenseProvider>
          <AppContent />
        </LicenseProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;