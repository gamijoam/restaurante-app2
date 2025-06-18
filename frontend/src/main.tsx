import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import TableSelectionPage from './pages/TableSelectionPage.tsx';
import OrderPage from './pages/OrderPage.tsx';
import './index.css';
import KitchenViewPage from './pages/KitchenViewPage.tsx';
import CashierViewPage from './pages/CashierViewPage.tsx';
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true, // Esta es la ruta por defecto "/"
        element: <TableSelectionPage />,
      },
      {
        path: "/comanda/mesa/:mesaId", // Ruta para una comanda específica
        element: <OrderPage />,
      },
      {
        path: "/cocina",
        element: <KitchenViewPage />,
      },
      {
        path: "/caja", // <-- Añadir esta ruta
        element: <CashierViewPage />,
      }
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);