import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import ProtectedRoute from './components/ProtectedRoute';

import App from './App.tsx';
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

// --- 1. IMPORTAMOS LA NUEVA PÁGINA ---
import PrinterSettingsPage from './pages/PrinterSettingsPage.tsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { path: 'login', element: <LoginPage /> },
            { 
                path: '', 
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_CAMARERO', 'ROLE_GERENTE']}>
                        <TableSelectionPage />
                    </ProtectedRoute>
                )
            },
            { 
                path: 'order/:mesaId', 
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_CAMARERO', 'ROLE_GERENTE']}>
                        <OrderPage />
                    </ProtectedRoute>
                )
            },
            { 
                path: 'cocina', 
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_COCINERO', 'ROLE_GERENTE']}>
                        <KitchenViewPage />
                    </ProtectedRoute>
                )
            },
            { 
                path: 'caja', 
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_CAJERO', 'ROLE_GERENTE']}>
                        <CashierViewPage />
                    </ProtectedRoute>
                )
            },
            { 
                path: 'mapa-mesas', 
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                        <MesaMapaPage />
                    </ProtectedRoute>
                )
            },
            { 
                path: 'gestion-mesas', 
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                        <GestionMesasPage />
                    </ProtectedRoute>
                )
            },
            { 
                path: 'reportes', 
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                        <ReportesPage />
                    </ProtectedRoute>
                )
            },
            { 
                path: 'usuarios', 
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                        <UserManagementPage />
                    </ProtectedRoute>
                )
            },
            { 
                path: 'facturacion', 
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                        <FacturacionPage />
                    </ProtectedRoute>
                )
            },
            { 
                path: 'ingredientes', 
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                        <IngredientesPage />
                    </ProtectedRoute>
                )
            },
            { 
                path: 'recetas', 
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                        <RecetasPage />
                    </ProtectedRoute>
                )
            },
            { 
                path: 'inventario-help', 
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                        <InventarioHelpPage />
                    </ProtectedRoute>
                )
            },
            // --- 2. AÑADIMOS LA NUEVA RUTA AQUÍ ---
            {
                path: 'configuracion/impresoras',
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_GERENTE']}>
                        <PrinterSettingsPage />
                    </ProtectedRoute>
                )
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <WebSocketProvider> {/* <-- 3. Asegúrate que WebSocketProvider envuelva a RouterProvider si necesita el contexto de Auth */}
                <RouterProvider router={router} />
            </WebSocketProvider>
        </AuthProvider>
    </React.StrictMode>
);