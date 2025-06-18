import { OrderProvider } from './context/OrderContext';
import { CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <OrderProvider>
      <CssBaseline />
      <main>
        <Outlet /> {/* Aquí se renderizará la página de la ruta actual */}
      </main>
    </OrderProvider>
  );
}

export default App;