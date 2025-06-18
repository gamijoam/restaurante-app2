import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import TableSelectionPage from './pages/TableSelectionPage.tsx';
import OrderPage from './pages/OrderPage.tsx';
import './index.css';

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
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);