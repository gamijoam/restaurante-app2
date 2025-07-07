import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Tooltip
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { getMesasMapa, updateMesaPosicion, updateMesasPosiciones, createMesa, updateMesaEstado, type MesaMapa } from '../services/mesaService';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

interface MesaVisual extends MesaMapa {
    isDragging?: boolean;
    isEditing?: boolean;
}

const MesaMapaPage = () => {
    const { roles } = useAuth();
    const isGerente = roles.includes('ROLE_GERENTE');
    const { stompClient, isConnected } = useWebSocket();
    
    const [mesas, setMesas] = useState<MesaVisual[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [editDialog, setEditDialog] = useState(false);
    const [createDialog, setCreateDialog] = useState(false);
    const [estadoDialog, setEstadoDialog] = useState(false);
    const [editingMesa, setEditingMesa] = useState<MesaVisual | null>(null);
    const [editForm, setEditForm] = useState({ nombre: '', posicionX: 0, posicionY: 0 });
    const [estadoForm, setEstadoForm] = useState({ estado: 'LIBRE' });
    const [createForm, setCreateForm] = useState({ 
        numero: 0, 
        capacidad: 4, 
        nombre: '', 
        posicionX: 100, 
        posicionY: 100 
    });
    
    const mapRef = useRef<HTMLDivElement>(null);
    const [draggedMesa, setDraggedMesa] = useState<MesaVisual | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const loadMesas = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getMesasMapa();
            setMesas(data.map(mesa => ({ ...mesa, isDragging: false, isEditing: false })));
        } catch (err) {
            setError('Error al cargar las mesas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Carga inicial al montar el componente
        loadMesas();

        // Lógica de WebSocket para actualizaciones en tiempo real
        if (isConnected && stompClient) {
            console.log("MesaMapaPage: Suscribiendo a /topic/mesas");
            const subscription = stompClient.subscribe('/topic/mesas', (message) => {
                try {
                    const mesaActualizada = JSON.parse(message.body);
                    setMesas(prevMesas =>
                        prevMesas.map(m => m.id === mesaActualizada.id ? { ...m, ...mesaActualizada } : m)
                    );
                } catch (e) {
                    console.warn('Mensaje de /topic/mesas no es un objeto Mesa:', message.body);
                }
            });
            return () => {
                console.log("MesaMapaPage: Desuscribiendo de /topic/mesas");
                subscription.unsubscribe();
            };
        }
    }, [isConnected, stompClient, loadMesas]);

    const handleCreateMesa = async () => {
        try {
            const nuevaMesa = await createMesa({
                numero: createForm.numero,
                capacidad: createForm.capacidad,
                estado: 'LIBRE',
                nombre: createForm.nombre,
                posicionX: createForm.posicionX,
                posicionY: createForm.posicionY
            });
            
            setCreateDialog(false);
            setCreateForm({ 
                numero: 0, 
                capacidad: 4, 
                nombre: '', 
                posicionX: 100, 
                posicionY: 100 
            });
            setSuccess('Mesa creada correctamente');
            loadMesas(); // Recargar para obtener la nueva mesa
        } catch (err) {
            setError('Error al crear la mesa');
        }
    };

    const handleMouseDown = (e: React.MouseEvent, mesa: MesaVisual) => {
        if (!isGerente) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        
        setDraggedMesa(mesa);
        setDragOffset({ x: offsetX, y: offsetY });
        
        setMesas(prev => prev.map(m => 
            m.id === mesa.id ? { ...m, isDragging: true } : m
        ));
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggedMesa || !mapRef.current) return;
        
        const rect = mapRef.current.getBoundingClientRect();
        const newX = e.clientX - rect.left - dragOffset.x;
        const newY = e.clientY - rect.top - dragOffset.y;
        
        setMesas(prev => prev.map(m => 
            m.id === draggedMesa.id 
                ? { ...m, posicionX: Math.max(0, newX), posicionY: Math.max(0, newY) }
                : m
        ));
    };

    const handleMouseUp = async () => {
        if (!draggedMesa) return;
        
        setDraggedMesa(null);
        setMesas(prev => prev.map(m => ({ ...m, isDragging: false })));
        
        // Guardar la nueva posición
        try {
            const mesaActualizada = mesas.find(m => m.id === draggedMesa.id);
            if (mesaActualizada) {
                console.log('Guardando nueva posición:', {
                    id: mesaActualizada.id,
                    posicionX: mesaActualizada.posicionX,
                    posicionY: mesaActualizada.posicionY,
                    nombre: mesaActualizada.nombre
                });
                
                await updateMesaPosicion(
                    mesaActualizada.id,
                    mesaActualizada.posicionX || 0,
                    mesaActualizada.posicionY || 0,
                    mesaActualizada.nombre
                );
                setSuccess('Posición de mesa actualizada');
                
                // Recargar las mesas para asegurar sincronización
                setTimeout(() => {
                    loadMesas();
                }, 100);
            }
        } catch (err) {
            console.error('Error al actualizar posición:', err);
            setError('Error al actualizar la posición de la mesa');
            loadMesas(); // Recargar para restaurar posición original
        }
    };

    const handleEditMesa = (mesa: MesaVisual) => {
        setEditingMesa(mesa);
        setEditForm({
            nombre: mesa.nombre || '',
            posicionX: mesa.posicionX || 0,
            posicionY: mesa.posicionY || 0
        });
        setEditDialog(true);
    };

    const handleSaveEdit = async () => {
        if (!editingMesa) return;
        
        try {
            await updateMesaPosicion(
                editingMesa.id,
                editForm.posicionX,
                editForm.posicionY,
                editForm.nombre
            );
            
            setMesas(prev => prev.map(m => 
                m.id === editingMesa.id 
                    ? { ...m, nombre: editForm.nombre, posicionX: editForm.posicionX, posicionY: editForm.posicionY }
                    : m
            ));
            
            setEditDialog(false);
            setEditingMesa(null);
            setSuccess('Mesa actualizada correctamente');
        } catch (err) {
            setError('Error al actualizar la mesa');
        }
    };

    const handleChangeEstado = (mesa: MesaVisual) => {
        setEditingMesa(mesa);
        setEstadoForm({ estado: mesa.estado });
        setEstadoDialog(true);
    };

    const handleSaveEstado = async () => {
        if (!editingMesa) return;
        
        try {
            await updateMesaEstado(editingMesa.id, estadoForm.estado);
            
            setMesas(prev => prev.map(m => 
                m.id === editingMesa.id 
                    ? { ...m, estado: estadoForm.estado as any }
                    : m
            ));
            
            setEstadoDialog(false);
            setEditingMesa(null);
            setSuccess('Estado de mesa actualizado correctamente');
        } catch (err) {
            setError('Error al actualizar el estado de la mesa');
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
                <Typography>Cargando mapa de mesas...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Mapa de Mesas
                </Typography>
                <Box>
                    {isGerente && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialog(true)}
                            sx={{ mr: 2 }}
                        >
                            Nueva Mesa
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={loadMesas}
                    >
                        Recargar
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Leyenda */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Leyenda</Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <Chip label="Libre" sx={{ backgroundColor: '#4CAF50', color: 'white' }} />
                    <Chip label="Ocupada" sx={{ backgroundColor: '#FF9800', color: 'white' }} />
                    <Chip label="Reservada" sx={{ backgroundColor: '#2196F3', color: 'white' }} />
                    <Chip label="Mantenimiento" sx={{ backgroundColor: '#F44336', color: 'white' }} />
                    <Chip label="Lista para pagar" sx={{ backgroundColor: '#E91E63', color: 'white' }} />
                </Box>
            </Paper>

            {/* Mapa */}
            <Paper 
                ref={mapRef}
                sx={{ 
                    position: 'relative',
                    width: '100%',
                    height: '600px',
                    backgroundColor: '#f5f5f5',
                    border: '2px dashed #ccc',
                    overflow: 'hidden',
                    cursor: isGerente ? 'grab' : 'default'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {mesas.map((mesa) => (
                    <Box
                        key={mesa.id}
                        sx={{
                            position: 'absolute',
                            left: mesa.posicionX || 50,
                            top: mesa.posicionY || 50,
                            width: 120,
                            height: 80,
                            backgroundColor: getEstadoColor(mesa.estado),
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isGerente ? 'grab' : 'pointer',
                            userSelect: 'none',
                            boxShadow: mesa.isDragging ? 4 : 2,
                            transform: mesa.isDragging ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                boxShadow: 4,
                                transform: 'scale(1.02)'
                            }
                        }}
                        onMouseDown={(e) => handleMouseDown(e, mesa)}
                    >
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: 'white', 
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}
                        >
                            Mesa {mesa.numero}
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: 'white',
                                textAlign: 'center',
                                fontSize: '0.7rem'
                            }}
                        >
                            {mesa.nombre || `Cap: ${mesa.capacidad}`}
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: 'white',
                                textAlign: 'center',
                                fontSize: '0.6rem'
                            }}
                        >
                            {getEstadoTexto(mesa.estado)}
                        </Typography>
                        
                        {isGerente && (
                            <Tooltip title="Editar mesa">
                                <IconButton
                                    size="small"
                                    sx={{ 
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.3)'
                                        }
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditMesa(mesa);
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        
                        {isGerente && (
                            <Tooltip title="Cambiar estado">
                                <IconButton
                                    size="small"
                                    sx={{ 
                                        position: 'absolute',
                                        top: 2,
                                        left: 2,
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.3)'
                                        }
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleChangeEstado(mesa);
                                    }}
                                >
                                    <SaveIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                ))}
            </Paper>

            {/* Diálogo de edición */}
            <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Mesa {editingMesa?.numero}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nombre de la mesa"
                        value={editForm.nombre}
                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                        margin="normal"
                        placeholder="Ej: Mesa del Rincón, Mesa VIP"
                    />
                    <TextField
                        fullWidth
                        label="Posición X"
                        type="number"
                        value={editForm.posicionX}
                        onChange={(e) => setEditForm({ ...editForm, posicionX: parseInt(e.target.value) || 0 })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Posición Y"
                        type="number"
                        value={editForm.posicionY}
                        onChange={(e) => setEditForm({ ...editForm, posicionY: parseInt(e.target.value) || 0 })}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveEdit} variant="contained">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de creación */}
            <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Crear Nueva Mesa</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Número de mesa"
                        type="number"
                        value={createForm.numero}
                        onChange={(e) => setCreateForm({ ...createForm, numero: parseInt(e.target.value) || 0 })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Capacidad"
                        type="number"
                        value={createForm.capacidad}
                        onChange={(e) => setCreateForm({ ...createForm, capacidad: parseInt(e.target.value) || 4 })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Nombre de la mesa"
                        value={createForm.nombre}
                        onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                        margin="normal"
                        placeholder="Ej: Mesa del Rincón, Mesa VIP"
                    />
                    <TextField
                        fullWidth
                        label="Posición X"
                        type="number"
                        value={createForm.posicionX}
                        onChange={(e) => setCreateForm({ ...createForm, posicionX: parseInt(e.target.value) || 100 })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Posición Y"
                        type="number"
                        value={createForm.posicionY}
                        onChange={(e) => setCreateForm({ ...createForm, posicionY: parseInt(e.target.value) || 100 })}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialog(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleCreateMesa} variant="contained">
                        Crear Mesa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de cambio de estado */}
            <Dialog open={estadoDialog} onClose={() => setEstadoDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Cambiar Estado de Mesa {editingMesa?.numero}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Estado</InputLabel>
                        <Select
                            value={estadoForm.estado}
                            onChange={(e) => setEstadoForm({ estado: e.target.value })}
                            label="Estado"
                        >
                            <MenuItem value="LIBRE">Libre</MenuItem>
                            <MenuItem value="OCUPADA">Ocupada</MenuItem>
                            <MenuItem value="RESERVADA">Reservada</MenuItem>
                            <MenuItem value="MANTENIMIENTO">Mantenimiento</MenuItem>
                            <MenuItem value="LISTA_PARA_PAGAR">Lista para pagar</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEstadoDialog(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveEstado} variant="contained">
                        Cambiar Estado
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MesaMapaPage; 