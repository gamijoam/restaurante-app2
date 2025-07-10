import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { OrderProvider } from '../context/OrderContext';
import Navbar from './Navbar';
import NotificationManager from './NotificationManager';

const Layout: React.FC = () => {
  // const theme = useTheme();

  return (
    <OrderProvider>
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Navbar />
        
        {/* Contenedor principal que se adapta al sidebar */}
        <Box 
          component="main" 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            // En desktop: margen izquierdo para el sidebar fijo
            ml: { xs: 0, md: '280px' },
            // En desktop: ancho ajustado
            width: { xs: '100%', md: 'calc(100% - 280px)' },
            // Transición suave
            transition: 'all 0.3s ease',
            // Altura completa menos el header
            minHeight: 'calc(100vh - 64px)', // 64px = altura del AppBar
          }}
        >
          {/* Contenido de la página */}
          <Box sx={{ 
            flex: 1,
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 2, sm: 3, md: 4 },
            // En móvil: padding completo, en desktop: padding normal
            width: '100%',
          }}>
            <Container 
              maxWidth="xl" 
              sx={{ 
                height: '100%',
                px: 0, // El Container no necesita padding extra
              }}
            >
              <Outlet />
            </Container>
          </Box>
        </Box>
        
        <NotificationManager />
      </Box>
    </OrderProvider>
  );
};

export default Layout; 