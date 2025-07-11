import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNotification } from '../hooks/useNotification';
import { dolarRateService } from '../services/dolarRateService';
import type { DolarRateDTO, DolarRateRequestDTO } from '../services/dolarRateService';

const DolarRatePage: React.FC = () => {
    const [precios, setPrecios] = useState<DolarRateDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPrecio, setEditingPrecio] = useState<DolarRateDTO | null>(null);
    const [formData, setFormData] = useState<DolarRateRequestDTO>({
        fecha: '',
        precioDolar: 0
    });
    const [submitting, setSubmitting] = useState(false);
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        loadPrecios();
    }, []);

    const loadPrecios = async () => {
        try {
            setLoading(true);
            const data = await dolarRateService.getAllPreciosDolar();
            setPrecios(data);
        } catch (error) {
            showError('Error cargando precios', 'No se pudieron cargar los precios del dólar');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (precio?: DolarRateDTO) => {
        if (precio) {
            setEditingPrecio(precio);
            setFormData({
                fecha: precio.fecha,
                precioDolar: precio.precioDolar
            });
        } else {
            setEditingPrecio(null);
            setFormData({
                fecha: new Date().toISOString().split('T')[0], // Hoy por defecto
                precioDolar: 0
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingPrecio(null);
        setFormData({ fecha: '', precioDolar: 0 });
    };

    const handleSubmit = async () => {
        if (!formData.fecha || formData.precioDolar <= 0) {
            showError('Datos inválidos', 'Por favor complete todos los campos correctamente');
            return;
        }

        try {
            setSubmitting(true);
            await dolarRateService.crearOActualizarPrecioDolar(formData);
            showSuccess(
                editingPrecio ? 'Precio actualizado' : 'Precio creado',
                `Precio del dólar ${editingPrecio ? 'actualizado' : 'creado'} correctamente`
            );
            handleCloseDialog();
            loadPrecios();
        } catch (error) {
            showError('Error', 'No se pudo guardar el precio del dólar');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Está seguro de que desea desactivar este precio?')) {
            return;
        }

        try {
            await dolarRateService.desactivarPrecioDolar(id);
            showSuccess('Precio desactivado', 'El precio del dólar ha sido desactivado');
            loadPrecios();
        } catch (error) {
            showError('Error', 'No se pudo desactivar el precio del dólar');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-VE');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(price);
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Configuración del Dólar
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Agregar Precio
                </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                Configure el precio del dólar para cada día. Este valor se utilizará para convertir los precios de USD a Bs en las comandas.
            </Alert>

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Precio del Dólar</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Fecha de Creación</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {precios.map((precio) => (
                                <TableRow key={precio.id}>
                                    <TableCell>{formatDate(precio.fecha)}</TableCell>
                                    <TableCell>{formatPrice(precio.precioDolar)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={precio.activo ? 'Activo' : 'Inactivo'}
                                            color={precio.activo ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{formatDate(precio.fechaCreacion)}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(precio)}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(precio.id)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {precios.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No hay precios del dólar configurados
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingPrecio ? 'Editar Precio del Dólar' : 'Agregar Precio del Dólar'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Fecha"
                            type="date"
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Precio del Dólar (USD)"
                            type="number"
                            value={formData.precioDolar}
                            onChange={(e) => setFormData({ ...formData, precioDolar: parseFloat(e.target.value) || 0 })}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{ mb: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={submitting || !formData.fecha || formData.precioDolar <= 0}
                    >
                        {submitting ? 'Guardando...' : (editingPrecio ? 'Actualizar' : 'Crear')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DolarRatePage; 