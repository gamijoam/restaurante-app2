import { OrderProvider } from './context/OrderContext';
import { CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar'; // <-- 1. Importamos el Navbar

function App() {
  return (
    <OrderProvider>
      <CssBaseline />
      <Navbar /> {/* <-- 2. Lo añadimos aquí, arriba del todo */}
      <main>
        <Outlet />
      </main>
    </OrderProvider>
  );
}

export default App;