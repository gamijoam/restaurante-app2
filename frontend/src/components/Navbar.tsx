import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Sistema Restaurante
                </Typography>
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
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;