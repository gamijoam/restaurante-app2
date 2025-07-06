import { useState, useEffect, useCallback } from 'react';
import type { ComandaResponseDTO } from '../types';
import { getComandasPorMultiplesEstados, updateComandaEstado } from '../services/comandaService';
import { useWebSocket } from '../context/WebSocketContext';
import { Container, Grid, Typography, Card, CardContent, CardActions, Button, CircularProgress, Alert } from '@mui/material';

// 1. Importamos nuestro nuevo y único servicio de impresión
import { imprimirTicketCaja } from '../services/impresionService';

const CashierViewPage = () => {
    const [comandas, setComandas] = useState<ComandaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { stompClient, isConnected } = useWebSocket();
    const [submittingId, setSubmittingId] = useState<number | null>(null);
    
    // 2. Nuevo estado para saber qué ticket se está imprimiendo
    const [printingId, setPrintingId] = useState<number | null>(null);

    // --- LÓGICA PARA CARGAR Y ACTUALIZAR COMANDAS (SIN CAMBIOS) ---
    const fetchInitialComandas = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getComandasPorMultiplesEstados(['LISTA', 'ENTREGADA']);
            setComandas(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Error al cargar las comandas a cobrar.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isConnected && stompClient) {
            fetchInitialComandas();
            const subscription = stompClient.subscribe('/topic/caja', (message) => {
                const comandaActualizada: ComandaResponseDTO = JSON.parse(message.body);
                if (comandaActualizada.estado === 'LISTA' || comandaActualizada.estado === 'ENTREGADA') {
                    setComandas(prevComandas => {
                        const comandaExistente = prevComandas.find(c => c.id === comandaActualizada.id);
                        if (comandaExistente) {
                            return prevComandas.map(c => c.id === comandaActualizada.id ? comandaActualizada : c);
                        }
                        return [comandaActualizada, ...prevComandas];
                    });
                }
            });
            return () => { subscription.unsubscribe(); };
        }
    }, [isConnected, stompClient, fetchInitialComandas]);

    // --- LÓGICA PARA PAGAR (SIN CAMBIOS) ---
    const handleMarcarComoPagada = async (comandaId: number) => {
        setSubmittingId(comandaId);
        try {
            await updateComandaEstado(comandaId, 'PAGADA');
            setComandas(prevComandas => prevComandas.filter(c => c.id !== comandaId));
        } catch (err) {
            alert('Error al actualizar la comanda.');
        } finally {
            setSubmittingId(null);
        }
    };

    // --- 3. NUEVA FUNCIÓN DE IMPRESIÓN ---
    // Esta función ahora es mucho más simple. Solo llama a la API.
    const handlePrintClick = async (comandaId: number) => {
        setPrintingId(comandaId);
        try {
            await imprimirTicketCaja(comandaId);
            // Opcional: podrías añadir una pequeña notificación de éxito aquí.
        } catch (error: any) {
            if (error.response?.status === 404) {
                alert("Error: No hay una impresora configurada para el rol 'CAJA'. Por favor, vaya a la sección de Configuración -> Impresoras.");
            } else {
                alert("No se pudo enviar el ticket a la impresora. Verifique que el Puente de Impresión esté encendido y conectado.");
            }
        } finally {
            setPrintingId(null);
        }
    };

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        // Ya no necesitamos el div 'root-app-container' ni el componente oculto
        <Container sx={{ py: 4 }} maxWidth="xl">
            <Typography variant="h4" align="center" gutterBottom>Comandas por Cobrar</Typography>
            <Grid container spacing={3}>
                {comandas.length > 0 ? (
                    comandas.map((comanda) => (
                        <Grid item key={comanda.id} xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Mesa #{comanda.numeroMesa}</Typography> 
                                    <Typography variant="h5" color="text.secondary" sx={{ my: 1 }}>
                                        Total: ${comanda.total.toFixed(2)}
                                    </Typography>
                                    <Typography variant="caption">Estado: {comanda.estado}</Typography>
                                </CardContent>
                                <CardActions>
                                    {/* 4. BOTÓN DE IMPRESIÓN ACTUALIZADO */}
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => handlePrintClick(comanda.id)}
                                        disabled={printingId === comanda.id}
                                    >
                                        {printingId === comanda.id ? <CircularProgress size={20} /> : 'Imprimir'}
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleMarcarComoPagada(comanda.id)}
                                        disabled={submittingId === comanda.id}
                                    >
                                        {submittingId === comanda.id ? <CircularProgress size={20} /> : 'Cobrar y Cerrar Mesa'}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography sx={{ p: 2, width: '100%', textAlign: 'center' }}>No hay comandas pendientes de pago.</Typography>
                )}
            </Grid>
        </Container>
    );
};

export default CashierViewPage;