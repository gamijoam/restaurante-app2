import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ReportesPage from './pages/ReportesPage.tsx'; // <-- Importar
import App from './App.tsx';
import LoginPage from './pages/LoginPage.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import TableSelectionPage from './pages/TableSelectionPage.tsx';
import OrderPage from './pages/OrderPage.tsx';
import KitchenViewPage from './pages/KitchenViewPage.tsx';
import CashierViewPage from './pages/CashierViewPage.tsx';
import UserManagementPage from './pages/UserManagementPage.tsx';
import IngredientesPage from './pages/IngredientesPage.tsx';
import RecetasPage from './pages/RecetasPage.tsx';
import InventarioHelpPage from './pages/InventarioHelpPage.tsx';
import MesaMapaPage from './pages/MesaMapaPage.tsx';
import GestionMesasPage from './pages/GestionMesasPage.tsx';
import { WebSocketProvider } from './context/WebSocketContext';
import './index.css';
import FacturacionPage from './pages/FacturacionPage.tsx';
const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />, // El guardia protege a todos sus hijos
    children: [
      {
        element: <App />, // El cascarón de la app con Navbar y Outlet
        children: [
          { index: true, element: <TableSelectionPage /> },
          { path: "/comanda/mesa/:mesaId", element: <OrderPage /> },
          { path: "/cocina", element: <KitchenViewPage /> },
          { path: "/caja", element: <CashierViewPage /> },
          {
            path: "/reportes", // <-- Añadir esta ruta
            element: <ReportesPage />,
          },
          {
            path: "/usuarios", // <-- Añadir esta ruta
            element: <UserManagementPage />,
          },
          {
            path: "/facturacion", // <-- Añadir esta ruta
            element: <FacturacionPage />,
          },
          {
            path: "/ingredientes", // <-- Añadir esta ruta
            element: <IngredientesPage />,
          },
          {
            path: "/recetas", // <-- Añadir esta ruta
            element: <RecetasPage />,
          },
          {
            path: "/inventario-help", // <-- Añadir esta ruta
            element: <InventarioHelpPage />,
          },
          {
            path: "/mapa-mesas",
            element: <MesaMapaPage />,
          },
          {
            path: "/gestion-mesas",
            element: <GestionMesasPage />,
          },
        ]
      }
    ]
  },
  {
    path: "/login", // La ruta de login es pública, está fuera de la protección
    element: <LoginPage />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <WebSocketProvider> {/* <-- Envolver con el nuevo proveedor */}
        <RouterProvider router={router} />
      </WebSocketProvider>
    </AuthProvider>
  </StrictMode>,
);