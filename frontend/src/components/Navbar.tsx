import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, roles } = useAuth();
    const navigate = useNavigate();

    const esAdmin = roles.includes('ADMIN');
    const esGerente = roles.includes('GERENTE');
    const esAdminOGerente = esAdmin || esGerente;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Sistema Restaurante
                </Typography>
                {isAuthenticated && (
                    <Box>
                        <Button color="inherit" component={RouterLink} to="/">Tomar Pedido</Button>
                        <Button color="inherit" component={RouterLink} to="/cocina">Cocina</Button>
                        <Button color="inherit" component={RouterLink} to="/caja">Caja</Button>

                        {esAdminOGerente && (
                            <>
                                <Button color="inherit" component={RouterLink} to="/mapa-mesas">Mapa de Mesas</Button>
                                <Button color="inherit" component={RouterLink} to="/gestion-mesas">Gestión de Mesas</Button>
                                <Button color="inherit" component={RouterLink} to="/reportes">Reportes</Button>
                                <Button color="inherit" component={RouterLink} to="/usuarios">Gestionar Usuarios</Button>
                                <Button color="inherit" component={RouterLink} to="/facturacion">Facturación</Button>
                                <Button color="inherit" component={RouterLink} to="/ingredientes">Ingredientes</Button>
                                <Button color="inherit" component={RouterLink} to="/recetas">Gestión de Recetas</Button>
                                
                                {/* --- BOTÓN AÑADIDO --- */}
                                <Button color="inherit" component={RouterLink} to="/configuracion/impresoras">Impresoras</Button>
                                {/* --------------------- */}

                                <Button color="inherit" component={RouterLink} to="/inventario-help">Ayuda Inventario</Button>
                            </>
                        )}
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;