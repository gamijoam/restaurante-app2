import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Restaurant,
  Kitchen,
  PointOfSale,
  Map,
  Assessment,
  People,
  Receipt,
  Inventory,
  Book,
  Settings,
  AccountCircle,
  Logout,
  Notifications,
  Help,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { userInfo, logout, hasPermission, roles } = useAuth();
    const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

    const handleLogout = () => {
        logout();
        navigate('/login');
    handleMenuClose();
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const menuItems = [
    {
      text: 'Toma de Pedidos',
      icon: <Restaurant />,
      path: '/',
      permission: 'TOMAR_PEDIDOS',
    },
    {
      text: 'Cocina',
      icon: <Kitchen />,
      path: '/cocina',
      permission: 'VER_COCINA',
    },
    {
      text: 'Caja',
      icon: <PointOfSale />,
      path: '/caja',
      permission: 'VER_CAJA',
    },
    {
      text: 'Mapa de Mesas',
      icon: <Map />,
      path: '/mapa-mesas',
      permission: 'GESTIONAR_MESAS',
    },
    {
      text: 'Gestión de Mesas',
      icon: <Dashboard />,
      path: '/gestion-mesas',
      permission: 'GESTIONAR_MESAS',
    },
    {
      text: 'Reportes',
      icon: <Assessment />,
      path: '/reportes',
      permission: 'VER_REPORTES',
    },
    {
      text: 'Usuarios',
      icon: <People />,
      path: '/usuarios',
      permission: 'CREAR_USUARIOS',
    },
    {
      text: 'Facturación',
      icon: <Receipt />,
      path: '/facturacion',
      permission: 'VER_FACTURAS',
    },
    {
      text: 'Ingredientes',
      icon: <Inventory />,
      path: '/ingredientes',
      permission: 'GESTIONAR_INGREDIENTES',
    },
    {
      text: 'Recetas',
      icon: <Book />,
      path: '/recetas',
      permission: 'GESTIONAR_RECETAS',
    },
    {
      text: 'Roles y Permisos',
      icon: <Settings />,
      path: '/roles-permisos',
      permission: 'GESTIONAR_ROLES',
    },
    {
      text: 'Configuración',
      icon: <Settings />,
      path: '/configuracion/impresoras',
      permission: 'CONFIGURAR_IMPRESORAS',
    },
  ];

  // Agregar Configuración del Sistema solo para GERENTE
  if (roles && roles.includes('ROLE_GERENTE')) {
    menuItems.push({
      text: 'Config. Sistema',
      icon: <Settings />,
      path: '/configuracion/sistema',
      permission: '',
    });
  }

  const filteredMenuItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ 
        p: 3, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'background.paper'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Restaurante App
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Sistema de Gestión
                </Typography>
      </Box>
      
      <List sx={{ pt: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem
            key={item.path}
            button
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.main',
                },
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? 'inherit' : 'text.secondary',
              minWidth: 40 
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo y título */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Restaurant sx={{ 
                color: 'primary.main', 
                mr: 1,
                fontSize: 28
              }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Restaurante App
              </Typography>
            </Box>
          </Box>

          {/* Navegación desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {filteredMenuItems.slice(0, 6).map((item) => (
                <Button
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
                    </Box>
                )}

          {/* Acciones del usuario */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notificaciones */}
            <IconButton 
              color="inherit"
              sx={{ color: 'text.secondary' }}
            >
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* Ayuda */}
            <IconButton 
              color="inherit"
              sx={{ color: 'text.secondary' }}
            >
              <Help />
            </IconButton>

            {/* Perfil del usuario */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                             <Chip
                 label={userInfo?.nombre || userInfo?.apellido || 'Usuario'}
                 avatar={<Avatar sx={{ width: 24, height: 24 }}>{userInfo?.nombre?.charAt(0) || userInfo?.apellido?.charAt(0) || 'U'}</Avatar>}
                 onClick={handleMenuOpen}
                 sx={{
                   cursor: 'pointer',
                   '&:hover': {
                     backgroundColor: 'action.hover',
                   },
                 }}
               />
            </Box>
          </Box>
            </Toolbar>
        </AppBar>

      {/* Drawer móvil */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en móvil
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Drawer desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            backgroundColor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
            position: 'fixed',
            height: '100vh',
            zIndex: theme.zIndex.drawer,
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Menú de usuario */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Perfil
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Configuración
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>
    </>
    );
};

export default Navbar;