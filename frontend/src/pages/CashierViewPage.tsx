import { useState, useEffect, useCallback, useRef } from 'react'; // 1. Añadido 'useRef'
import type { ComandaResponseDTO } from '../types';
import { getComandasPorMultiplesEstados, updateComandaEstado } from '../services/comandaService';
import { useWebSocket } from '../context/WebSocketContext';
import { Container, Grid, Typography, Card, CardContent, CardActions, Button, CircularProgress, Alert } from '@mui/material';

// --- NUEVAS IMPORTACIONES PARA IMPRESIÓN ---
import { getTicketData, type TicketData } from '../services/comandaService';
import TicketParaImprimir from '../components/TicketParaImprimir';
// -----------------------------------------

const CashierViewPage = () => {
    const [comandas, setComandas] = useState<ComandaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { stompClient, isConnected } = useWebSocket();
    const [submittingId, setSubmittingId] = useState<number | null>(null);

    // --- NUEVOS ESTADOS Y REFERENCIAS PARA IMPRESIÓN ---
    const [ticketToPrint, setTicketToPrint] = useState<TicketData | null>(null);
    const ticketRef = useRef<HTMLDivElement>(null);
    // ------------------------------------------------

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
                            return prevComandas;
                        }
                        return [comandaActualizada, ...prevComandas];
                    });
                }
            });

            return () => { subscription.unsubscribe(); };
        }
    }, [isConnected, stompClient, fetchInitialComandas]);
    
    // --- NUEVO USEEFFECT PARA DISPARAR LA IMPRESIÓN ---
    useEffect(() => {
        if (ticketToPrint && ticketRef.current) {
            window.print();
            setTicketToPrint(null); // Limpia el estado después de imprimir
        }
    }, [ticketToPrint]);
    // -------------------------------------------------

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
    
    // --- NUEVA FUNCIÓN PARA OBTENER DATOS DEL TICKET ---
    const handlePrintTicket = async (comandaId: number) => {
        try {
            const data = await getTicketData(comandaId);
            setTicketToPrint(data);
        } catch (error) {
            console.error("Error al obtener los datos del ticket:", error);
            alert("No se pudo generar el ticket para imprimir.");
        }
    };
    // ---------------------------------------------------

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        // Usamos React.Fragment para poder tener un elemento hermano al Container
        <>
            <Container sx={{ py: 4 }} maxWidth="xl">
                <Typography variant="h4" align="center" gutterBottom>Comandas por Cobrar (En Tiempo Real)</Typography>
                <Grid container spacing={3}>
                    {comandas.length > 0 ? (
                        comandas.map((comanda) => (
                            <Grid item key={comanda.id} xs={12} sm={6} md={4}>
                                <Card>
                                    <CardContent>
                                        {/* He usado comanda.nombreMesa en lugar de numeroMesa para coincidir con el DTO */}
                                        <Typography variant="h6">Mesa: {comanda.nombreMesa}</Typography> 
                                        <Typography variant="h5" color="text.secondary" sx={{ my: 1 }}>
                                            Total: ${comanda.total.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption">Estado: {comanda.estado}</Typography>
                                    </CardContent>
                                    <CardActions>
                                        {/* --- BOTÓN DE IMPRESIÓN AÑADIDO --- */}
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => handlePrintTicket(comanda.id)}
                                        >
                                            Imprimir
                                        </Button>
                                        {/* ------------------------------------- */}
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

            {/* --- COMPONENTE OCULTO PARA IMPRESIÓN --- */}
            <div className="ticket-print-area">
                <TicketParaImprimir ticketData={ticketToPrint} ref={ticketRef} />
            </div>
            {/* ---------------------------------------- */}
        </>
    );
};

export default CashierViewPage;