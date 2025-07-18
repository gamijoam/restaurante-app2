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
  Collapse,
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
  ExpandLess,
  ExpandMore,
  AdminPanelSettings,
  Business,
} from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';
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
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    operaciones: true,
    gestion: true,
    inventario: true,
    administracion: true,
    sistema: true,
  });

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

  const handleGroupToggle = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const menuGroups = [
    {
      id: 'operaciones',
      title: 'Operaciones',
      icon: <Restaurant />,
      items: [
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
          text: 'Dashboard Cocina',
          icon: <Dashboard />,
          path: '/kitchen-dashboard',
          permission: 'VER_COCINA',
        },
        {
          text: 'Caja',
          icon: <PointOfSale />,
          path: '/caja',
          permission: 'VER_CAJA',
        },
      ]
    },
    {
      id: 'gestion',
      title: 'Gestión',
      icon: <Map />,
      items: [
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
      ]
    },
    {
      id: 'inventario',
      title: 'Inventario',
      icon: <Inventory />,
      items: [
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
      ]
    },
    {
      id: 'administracion',
      title: 'Administración',
      icon: <Assessment />,
      items: [
        {
          text: 'Reportes',
          icon: <Assessment />,
          path: '/reportes',
          permission: 'VER_REPORTES',
        },
        {
          text: 'Facturación',
          icon: <Receipt />,
          path: '/facturacion',
          permission: 'VER_FACTURAS',
        },
      ]
    },
    {
      id: 'sistema',
      title: 'Sistema',
      icon: <AdminPanelSettings />,
      items: [
        {
          text: 'Usuarios',
          icon: <People />,
          path: '/usuarios',
          permission: 'CREAR_USUARIOS',
        },
        {
          text: 'Roles y Permisos',
          icon: <Settings />,
          path: '/roles-permisos',
          permission: 'GESTIONAR_ROLES',
        },
        {
          text: 'Áreas de Preparación',
          icon: <Kitchen />,
          path: '/areas-preparacion',
          permission: 'GESTIONAR_ROLES',
        },
        {
          text: 'Asignación Productos',
          icon: <Inventory />,
          path: '/asignacion-productos',
          permission: 'GESTIONAR_ROLES',
        },
        // {
        //   text: 'Comandas por Área',
        //   icon: <Receipt />,
        //   path: '/comandas-areas',
        //   permission: 'GESTIONAR_ROLES',
        // },
        // {
        //   text: 'Prueba División',
        //   icon: <Assessment />,
        //   path: '/test-division',
        //   permission: 'GESTIONAR_ROLES',
        // },
      ]
    }
  ];

  // Agregar configuración solo para GERENTE
  if (roles && roles.includes('ROLE_GERENTE')) {
    menuGroups.find(g => g.id === 'sistema')?.items.push({
      text: 'Configuración',
      icon: <SettingsIcon />,
      path: '/configuracion',
      permission: '',
    });
    menuGroups.find(g => g.id === 'sistema')?.items.push({
      text: 'Configuración del Negocio',
      icon: <Business />,
      path: '/business-config',
      permission: '',
    });
    menuGroups.find(g => g.id === 'sistema')?.items.push({
      text: 'Configuración del Dólar',
      icon: <Settings />,
      path: '/dolar-rates',
      permission: '',
    });
  }

  const renderMenuItem = (item: any) => {
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    return (
      <ListItem
        key={item.path}
        button
        onClick={() => handleNavigation(item.path)}
        selected={location.pathname === item.path}
        sx={{
          mx: 1,
          mb: 0.5,
          borderRadius: 2,
          pl: 4,
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
    );
  };

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
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter(item => 
            !item.permission || hasPermission(item.permission)
          );

          if (visibleItems.length === 0) return null;

          return (
            <Box key={group.id}>
              <ListItem
                button
                onClick={() => handleGroupToggle(group.id)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  backgroundColor: 'action.hover',
                }}
              >
                <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
                  {group.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={group.title}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                />
                {expandedGroups[group.id] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              
              <Collapse in={expandedGroups[group.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {visibleItems.map(renderMenuItem)}
                </List>
              </Collapse>
            </Box>
          );
        })}
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

          {/* Navegación desktop - versión simplificada */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                startIcon={<Restaurant />}
                onClick={() => handleNavigation('/')}
                sx={{
                  color: location.pathname === '/' ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === '/' ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                Pedidos
              </Button>
              <Button
                startIcon={<Kitchen />}
                onClick={() => handleNavigation('/cocina')}
                sx={{
                  color: location.pathname === '/cocina' ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === '/cocina' ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                Cocina
              </Button>
              <Button
                startIcon={<PointOfSale />}
                onClick={() => handleNavigation('/caja')}
                sx={{
                  color: location.pathname === '/caja' ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === '/caja' ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                Caja
              </Button>
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