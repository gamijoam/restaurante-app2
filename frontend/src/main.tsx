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

import './index.css';

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
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);