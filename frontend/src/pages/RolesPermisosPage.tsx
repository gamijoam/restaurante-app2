import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Box,
    Grid,
    Chip,
    IconButton,
    Snackbar,
    Divider,
    FormControlLabel,
    Switch
} from '@mui/material';
import {
    Security as SecurityIcon,
    Person as PersonIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { getUsuarios, type UsuarioResponseDTO } from '../services/usuarioService';
import { getPermisos, getPermisosUsuario, updatePermisosUsuario, type Permiso } from '../services/permisoService';
import { useAuth } from '../context/AuthContext';

const RolesPermisosPage = () => {
    const { roles } = useAuth();
    const [usuarios, setUsuarios] = useState<UsuarioResponseDTO[]>([]);
    const [permisos, setPermisos] = useState<Permiso[]>([]);
    const [selectedUsuario, setSelectedUsuario] = useState<UsuarioResponseDTO | null>(null);
    const [usuarioPermisos, setUsuarioPermisos] = useState<Permiso[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Verificar si el usuario tiene permisos de gerente
    const esGerente = roles.includes('ROLE_GERENTE');

    useEffect(() => {
        if (esGerente) {
            loadData();
        }
    }, [esGerente]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usuariosData, permisosData] = await Promise.all([
                getUsuarios(),
                getPermisos()
            ]);
            setUsuarios(usuariosData);
            setPermisos(permisosData);
        } catch (err) {
            showSnackbar('Error al cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUsuarioSelect = async (usuario: UsuarioResponseDTO) => {
        setSelectedUsuario(usuario);
        try {
            const permisosUsuario = await getPermisosUsuario(usuario.id!);
            setUsuarioPermisos(permisosUsuario);
            setOpenDialog(true);
        } catch (err) {
            showSnackbar('Error al cargar los permisos del usuario', 'error');
        }
    };

    const handlePermisoToggle = (permisoId: number) => {
        setUsuarioPermisos(prev => {
            const permiso = permisos.find(p => p.id === permisoId);
            if (!permiso) return prev;

            const isSelected = prev.some(p => p.id === permisoId);
            if (isSelected) {
                return prev.filter(p => p.id !== permisoId);
            } else {
                return [...prev, permiso];
            }
        });
    };

    const handleSavePermisos = async () => {
        if (!selectedUsuario) return;

        try {
            setLoading(true);
            const permisoIds = usuarioPermisos.map(p => p.id);
            await updatePermisosUsuario(selectedUsuario.id!, permisoIds);
            showSnackbar('Permisos actualizados correctamente', 'success');
            setOpenDialog(false);
            setSelectedUsuario(null);
            setUsuarioPermisos([]);
        } catch (err) {
            showSnackbar('Error al actualizar los permisos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUsuario(null);
        setUsuarioPermisos([]);
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    if (!esGerente) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">
                    No tienes permisos para acceder a esta página.
                </Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container sx={{ py: 4, textAlign: 'center' }}>
                <Typography>Cargando...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon fontSize="large" />
                Gestión de Roles y Permisos
            </Typography>

            <Grid container spacing={3}>
                {/* Lista de Usuarios */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon />
                                Usuarios del Sistema
                            </Typography>
                            <List>
                                {usuarios.map((usuario) => (
                                    <ListItem key={usuario.id} divider>
                                        <ListItemText
                                            primary={`${usuario.nombre} ${usuario.apellido}`}
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Usuario: {usuario.username}
                                                    </Typography>
                                                    <Box sx={{ mt: 1 }}>
                                                        {usuario.roles.map((rol) => (
                                                            <Chip
                                                                key={rol}
                                                                label={rol.replace('ROLE_', '')}
                                                                size="small"
                                                                color="primary"
                                                                sx={{ mr: 0.5, mb: 0.5 }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleUsuarioSelect(usuario)}
                                            >
                                                Gestionar Permisos
                                            </Button>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Información de Permisos */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Permisos Disponibles
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                El sistema cuenta con los siguientes permisos que pueden ser asignados a los usuarios:
                            </Typography>
                            <List dense>
                                {permisos.map((permiso) => (
                                    <ListItem key={permiso.id}>
                                        <ListItemText
                                            primary={permiso.nombre}
                                            secondary={permiso.descripcion}
                                        />
                                        <Chip
                                            label={permiso.activo ? 'Activo' : 'Inactivo'}
                                            color={permiso.activo ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialog para gestionar permisos */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    Gestionar Permisos - {selectedUsuario?.nombre} {selectedUsuario?.apellido}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Marca los permisos que deseas asignar a este usuario:
                    </Typography>
                    <List>
                        {permisos.map((permiso) => (
                            <ListItem key={permiso.id} dense>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={usuarioPermisos.some(p => p.id === permiso.id)}
                                            onChange={() => handlePermisoToggle(permiso.id)}
                                            disabled={!permiso.activo}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1">
                                                {permiso.nombre}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {permiso.descripcion}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSavePermisos} 
                        variant="contained" 
                        startIcon={<SaveIcon />}
                        disabled={loading}
                    >
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default RolesPermisosPage; 