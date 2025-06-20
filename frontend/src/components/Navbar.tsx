import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

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
                {isAuthenticated && ( // Solo muestra los botones si el usuario está autenticado
                    <Box>
                        <Button color="inherit" component={RouterLink} to="/">
                            Tomar Pedido
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/cocina">
                            Cocina
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/caja">
                            Caja
                        </Button>
                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;