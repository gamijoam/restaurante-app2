import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, roles } = useAuth(); // <-- Obtenemos los roles directamente
    const navigate = useNavigate();

    const esGerente = roles.includes('ROLE_GERENTE'); // La lógica ahora es mucho más limpia

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

                        {esGerente && (
    <>
        <Button color="inherit" component={RouterLink} to="/mapa-mesas">
            Mapa de Mesas
        </Button>
        <Button color="inherit" component={RouterLink} to="/gestion-mesas">
            Gestión de Mesas
        </Button>
        <Button color="inherit" component={RouterLink} to="/reportes">
            Reportes
        </Button>
        <Button color="inherit" component={RouterLink} to="/usuarios">
            Gestionar Usuarios
        </Button>
        <Button color="inherit" component={RouterLink} to="/facturacion">
    Facturación
</Button>
        <Button color="inherit" component={RouterLink} to="/ingredientes">
            Ingredientes
        </Button>
        <Button color="inherit" component={RouterLink} to="/recetas">
            Recetas
        </Button>
        <Button color="inherit" component={RouterLink} to="/inventario-help">
            Ayuda Inventario
        </Button>
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