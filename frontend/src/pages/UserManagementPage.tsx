import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    TextField,
    Alert,
    Chip,
    IconButton,
    useTheme,
    useMediaQuery,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Stack,
    Divider,
    Tooltip,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Switch,
    FormControlLabel,
    Badge,
    LinearProgress,
} from '@mui/material';
import {
    People as PeopleIcon,
    PersonAdd as PersonAddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Block as BlockIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    Email as EmailIcon,
    Security as SecurityIcon,
    AdminPanelSettings as AdminIcon,
    Restaurant as CookIcon,
    PointOfSale as CashierIcon,
    Settings as SettingsIcon,
    Add as AddIcon,
    MoreVert as MoreIcon,
    Star as StarIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon,
} from '@mui/icons-material';
import type { UsuarioResponseDTO } from '../types';
import { getUsuarios } from '../services/usuarioService';
import { useAuth } from '../context/AuthContext';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import LoadingSpinner from '../components/LoadingSpinner';
import CreateUserForm from '../components/CreateUserForm';

const UserManagementPage = () => {
    const { roles } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isGerente = roles.includes('ROLE_GERENTE');
    
    const [usuarios, setUsuarios] = useState<UsuarioResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('TODOS');
    const [filterStatus, setFilterStatus] = useState<string>('TODOS');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UsuarioResponseDTO | null>(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUsuarios();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('No tienes permiso para ver esta página o hubo un error.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserCreated = () => {
        setIsModalOpen(false);
        fetchUsuarios();
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ROLE_GERENTE':
                return 'error';
            case 'ROLE_COCINERO':
                return 'warning';
            case 'ROLE_CAJERO':
                return 'info';
            default:
                return 'default';
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'ROLE_GERENTE':
                return 'Gerente';
            case 'ROLE_COCINERO':
                return 'Cocinero';
            case 'ROLE_CAJERO':
                return 'Cajero';
            default:
                return role;
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ROLE_GERENTE':
                return <AdminIcon />;
            case 'ROLE_COCINERO':
                return <CookIcon />;
            case 'ROLE_CAJERO':
                return <CashierIcon />;
            default:
                return <SettingsIcon />;
        }
    };

    const filteredUsers = usuarios.filter(usuario => {
        const matchesSearch = usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = filterRole === 'TODOS' || usuario.roles.includes(filterRole);
        const matchesStatus = filterStatus === 'TODOS' || 
                            (filterStatus === 'ACTIVOS' && usuario.activo) ||
                            (filterStatus === 'INACTIVOS' && !usuario.activo);
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    const stats = {
        total: usuarios.length,
        activos: usuarios.filter(u => u.activo).length,
        inactivos: usuarios.filter(u => !u.activo).length,
        gerentes: usuarios.filter(u => u.roles.includes('ROLE_GERENTE')).length,
        cocineros: usuarios.filter(u => u.roles.includes('ROLE_COCINERO')).length,
        cajeros: usuarios.filter(u => u.roles.includes('ROLE_CAJERO')).length,
    };

    if (loading) {
    return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <LoadingSpinner />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                        Cargando usuarios...
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Gestión de Usuarios
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Administra los usuarios del sistema y sus permisos
                </Typography>
            </Box>

            {/* Alertas */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Estadísticas */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                                {stats.total}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Usuarios
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                                {stats.activos}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Activos
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                                {stats.gerentes}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Gerentes
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                                {stats.cocineros + stats.cajeros}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Empleados
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
            </Grid>

            {/* Filtros y controles */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            placeholder="Buscar usuarios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                label="Rol"
                            >
                                <MenuItem value="TODOS">Todos los roles</MenuItem>
                                <MenuItem value="ROLE_GERENTE">Gerentes</MenuItem>
                                <MenuItem value="ROLE_COCINERO">Cocineros</MenuItem>
                                <MenuItem value="ROLE_CAJERO">Cajeros</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                label="Estado"
                            >
                                <MenuItem value="TODOS">Todos</MenuItem>
                                <MenuItem value="ACTIVOS">Activos</MenuItem>
                                <MenuItem value="INACTIVOS">Inactivos</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
                            <IconButton
                                onClick={() => setViewMode('table')}
                                color={viewMode === 'table' ? 'primary' : 'default'}
                            >
                                <ViewIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => setViewMode('cards')}
                                color={viewMode === 'cards' ? 'primary' : 'default'}
                            >
                                <PeopleIcon />
                            </IconButton>
                            <ModernButton
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={fetchUsuarios}
                                size="small"
                            >
                                Actualizar
                            </ModernButton>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <ModernButton
                            variant="primary"
                            startIcon={<PersonAddIcon />}
                            onClick={() => setIsModalOpen(true)}
                            fullWidth
                            disabled={!isGerente}
                        >
                            Nuevo Usuario
                        </ModernButton>
                    </Grid>
                </Grid>
            </Box>

            {/* Vista de tabla */}
            {viewMode === 'table' ? (
                <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Usuario</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Roles</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Estado</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((usuario) => (
                                <TableRow key={usuario.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                {usuario.nombre.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {usuario.username}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ID: {usuario.id}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {usuario.nombre} {usuario.apellido}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {usuario.email}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {usuario.roles.map((role, index) => (
                                                <Chip
                                                    key={index}
                                                    label={getRoleText(role)}
                                                    color={getRoleColor(role) as any}
                                                    size="small"
                                                    icon={getRoleIcon(role)}
                                                />
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={usuario.activo ? 'Activo' : 'Inactivo'}
                                            color={usuario.activo ? 'success' : 'default'}
                                            size="small"
                                            icon={usuario.activo ? <ActiveIcon /> : <InactiveIcon />}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            <Tooltip title="Ver detalles">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedUser(usuario);
                                                        setOpenDetailModal(true);
                                                    }}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {isGerente && (
                                                <>
                                                    <Tooltip title="Editar usuario">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedUser(usuario);
                                                                setOpenEditModal(true);
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={usuario.activo ? 'Desactivar' : 'Activar'}>
                                                        <IconButton
                                                            size="small"
                                                            color={usuario.activo ? 'warning' : 'success'}
                                                        >
                                                            {usuario.activo ? <BlockIcon /> : <CheckIcon />}
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                /* Vista de cards */
                <Grid container spacing={2}>
                    {filteredUsers.map((usuario) => (
                        <Grid item xs={12} sm={6} md={4} key={usuario.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: theme.shadows[8],
                                    },
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: usuario.activo ? 'primary.main' : 'grey.500',
                                                mr: 2,
                                                width: 48,
                                                height: 48,
                                            }}
                                        >
                                            {usuario.nombre.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {usuario.nombre} {usuario.apellido}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                @{usuario.username}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Stack spacing={1} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                {usuario.email}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SecurityIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                ID: {usuario.id}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Roles:
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {usuario.roles.map((role, index) => (
                                                <Chip
                                                    key={index}
                                                    label={getRoleText(role)}
                                                    color={getRoleColor(role) as any}
                                                    size="small"
                                                    icon={getRoleIcon(role)}
                                                />
                                            ))}
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Chip
                                            label={usuario.activo ? 'Activo' : 'Inactivo'}
                                            color={usuario.activo ? 'success' : 'default'}
                                            size="small"
                                            icon={usuario.activo ? <ActiveIcon /> : <InactiveIcon />}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            Creado: {new Date(usuario.fechaCreacion).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                        <ModernButton
                                            variant="outlined"
                                            size="small"
                                            startIcon={<ViewIcon />}
                                            onClick={() => {
                                                setSelectedUser(usuario);
                                                setOpenDetailModal(true);
                                            }}
                                            sx={{ flex: 1 }}
                                        >
                                            Ver
                                        </ModernButton>
                                        {isGerente && (
                                            <ModernButton
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => {
                                                    setSelectedUser(usuario);
                                                    setOpenEditModal(true);
                                                }}
                                                sx={{ flex: 1 }}
                                            >
                                                Editar
                                            </ModernButton>
                                        )}
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Mensaje cuando no hay usuarios */}
            {filteredUsers.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No se encontraron usuarios
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm || filterRole !== 'TODOS' || filterStatus !== 'TODOS'
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'No hay usuarios registrados en el sistema'
                        }
                    </Typography>
                </Box>
            )}

            {/* Modal de detalles del usuario */}
            <ModernModal
                open={openDetailModal}
                onClose={() => setOpenDetailModal(false)}
                title={`Detalles de ${selectedUser?.nombre} ${selectedUser?.apellido}`}
                maxWidth="sm"
            >
                {selectedUser && (
                    <Box>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    ID
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedUser.id}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Username
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedUser.username}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Nombre Completo
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedUser.nombre} {selectedUser.apellido}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Email
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedUser.email}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Estado
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedUser.activo ? 'Activo' : 'Inactivo'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Fecha de Creación
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {new Date(selectedUser.fechaCreacion).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Roles:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {selectedUser.roles.map((role, index) => (
                                        <Chip
                                            key={index}
                                            label={getRoleText(role)}
                                            color={getRoleColor(role) as any}
                                            size="small"
                                            icon={getRoleIcon(role)}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </ModernModal>

            {/* Modal de crear usuario */}
            <Dialog 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonAddIcon />
                        Crear Nuevo Usuario
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <CreateUserForm 
                        onUserCreated={handleUserCreated} 
                        onCancel={() => setIsModalOpen(false)} 
                    />
                </DialogContent>
            </Dialog>

            {/* FAB para móviles */}
            {isGerente && isMobile && (
                <Fab
                    color="primary"
                    aria-label="Nuevo Usuario"
                    onClick={() => setIsModalOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        zIndex: 1000,
                    }}
                >
                    <AddIcon />
                </Fab>
            )}
        </Container>
    );
};

export default UserManagementPage;