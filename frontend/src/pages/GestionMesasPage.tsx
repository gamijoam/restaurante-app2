import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Alert,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { getMesas, createMesa, updateMesaEstado, deleteMesa, type Mesa } from '../services/mesaService';
import { useAuth } from '../context/AuthContext';

const GestionMesasPage = () => {
    const { roles } = useAuth();
    const isGerente = roles.includes('ROLE_GERENTE');
    
    console.log('Roles del usuario:', roles);
    console.log('¿Es gerente?', isGerente);
    
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);
    const [formData, setFormData] = useState<Partial<Mesa>>({
        numero: 0,
        capacidad: 4,
        estado: 'LIBRE',
        nombre: '',
        posicionX: 100,
        posicionY: 100
    });

    useEffect(() => {
        loadMesas();
    }, []);

    const loadMesas = async () => {
        try {
            setLoading(true);
            const data = await getMesas();
            setMesas(data);
        } catch (err) {
            setError('Error al cargar las mesas');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (mesa?: Mesa) => {
        if (mesa) {
            setEditingMesa(mesa);
            setFormData(mesa);
        } else {
            setEditingMesa(null);
            setFormData({
                numero: 0,
                capacidad: 4,
                estado: 'LIBRE',
                nombre: '',
                posicionX: 100,
                posicionY: 100
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingMesa(null);
        setFormData({
            numero: 0,
            capacidad: 4,
            estado: 'LIBRE',
            nombre: '',
            posicionX: 100,
            posicionY: 100
        });
        setError(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingMesa) {
                // Actualizar mesa existente
                await updateMesaEstado(editingMesa.id!, formData.estado!);
                setSuccess('Mesa actualizada correctamente');
            } else {
                // Crear nueva mesa
                await createMesa(formData as Omit<Mesa, 'id'>);
                setSuccess('Mesa creada correctamente');
            }
            handleCloseDialog();
            loadMesas();
        } catch (err) {
            setError('Error al guardar la mesa');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta mesa?')) {
            try {
                await deleteMesa(id);
                setSuccess('Mesa eliminada correctamente');
                loadMesas();
            } catch (err) {
                setError('Error al eliminar la mesa');
            }
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'LIBRE': return '#4CAF50';
            case 'OCUPADA': return '#FF9800';
            case 'RESERVADA': return '#2196F3';
            case 'MANTENIMIENTO': return '#F44336';
            case 'LISTA_PARA_PAGAR': return '#E91E63';
            default: return '#9E9E9E';
        }
    };

    const getEstadoTexto = (estado: string) => {
        switch (estado) {
            case 'LIBRE': return 'Libre';
            case 'OCUPADA': return 'Ocupada';
            case 'RESERVADA': return 'Reservada';
            case 'MANTENIMIENTO': return 'Mantenimiento';
            case 'LISTA_PARA_PAGAR': return 'Lista para pagar';
            default: return 'Desconocido';
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography>Cargando mesas...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Gestión de Mesas
                </Typography>
                {isGerente && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Nueva Mesa
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Número</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Capacidad</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Posición X</TableCell>
                            <TableCell>Posición Y</TableCell>
                            {isGerente && <TableCell>Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mesas.map((mesa) => (
                            <TableRow key={mesa.id}>
                                <TableCell>{mesa.numero}</TableCell>
                                <TableCell>{mesa.nombre || '-'}</TableCell>
                                <TableCell>{mesa.capacidad}</TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            backgroundColor: getEstadoColor(mesa.estado),
                                            color: 'white',
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 1,
                                            display: 'inline-block'
                                        }}
                                    >
                                        {getEstadoTexto(mesa.estado)}
                                    </Box>
                                </TableCell>
                                <TableCell>{mesa.posicionX || '-'}</TableCell>
                                <TableCell>{mesa.posicionY || '-'}</TableCell>
                                {isGerente && (
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenDialog(mesa)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(mesa.id!)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingMesa ? 'Editar Mesa' : 'Nueva Mesa'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Número de mesa"
                        type="number"
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: parseInt(e.target.value) || 0 })}
                        margin="normal"
                        required
                        disabled={!!editingMesa} // No permitir cambiar número si es edición
                    />
                    <TextField
                        fullWidth
                        label="Nombre de la mesa"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        margin="normal"
                        placeholder="Ej: Mesa del Rincón, Mesa VIP"
                    />
                    <TextField
                        fullWidth
                        label="Capacidad"
                        type="number"
                        value={formData.capacidad}
                        onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 4 })}
                        margin="normal"
                        required
                    />
                    {editingMesa && (
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                                label="Estado"
                            >
                                <MenuItem value="LIBRE">Libre</MenuItem>
                                <MenuItem value="OCUPADA">Ocupada</MenuItem>
                                <MenuItem value="RESERVADA">Reservada</MenuItem>
                                <MenuItem value="MANTENIMIENTO">Mantenimiento</MenuItem>
                                <MenuItem value="LISTA_PARA_PAGAR">Lista para pagar</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    <TextField
                        fullWidth
                        label="Posición X"
                        type="number"
                        value={formData.posicionX}
                        onChange={(e) => setFormData({ ...formData, posicionX: parseInt(e.target.value) || 100 })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Posición Y"
                        type="number"
                        value={formData.posicionY}
                        onChange={(e) => setFormData({ ...formData, posicionY: parseInt(e.target.value) || 100 })}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingMesa ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GestionMesasPage; 