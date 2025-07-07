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

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
              path="configuracion/impresoras" 
              element={
                <ProtectedRoute allowedPermissions={['CONFIGURAR_IMPRESORAS']}>
                  <PrinterSettingsPage />
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