import ProductList from './pages/ProductList';
import OrderSummary from './components/OrderSummary';
import { OrderProvider } from './context/OrderContext';
import { Container, Grid, CssBaseline } from '@mui/material';
import './App.css';

function App() {
  return (
    <OrderProvider>
      <CssBaseline /> {/* Normaliza los estilos del navegador */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Columna de Productos */}
          {/* La prop "item" ha sido eliminada de la siguiente línea */}
          <Grid item xs={12} md={8}>
            <ProductList />
          </Grid>
          {/* Columna del Resumen de la Comanda */}
          {/* La prop "item" también ha sido eliminada de esta línea */}
          <Grid xs={12} md={4}>
            <OrderSummary />
          </Grid>
        </Grid>
      </Container>
    </OrderProvider>
  );
}

export default App;