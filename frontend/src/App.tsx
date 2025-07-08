import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

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
import TicketEditorPage from './pages/TicketEditorPage';
import TicketTemplatesPage from './pages/TicketTemplatesPage';
import PreparationAreasPage from './pages/PreparationAreasPage';
import ProductAreaAssignmentPage from './pages/ProductAreaAssignmentPage';
import ComandaAreaManagementPage from './pages/ComandaAreaManagementPage';
import TestDivisionPage from './pages/TestDivisionPage';

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/kitchen-view" element={
            <ProtectedRoute requiredPermissions={['COCINA']}>
              <KitchenViewPage />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Layout />}>
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
              path="comandas-areas" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_GERENTE', 'ROLE_COCINERO']}>
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
          </Route>
        </Routes>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;