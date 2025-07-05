import { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import type { ComandaResponseDTO } from '../types';
import {
    getComandasPorMultiplesEstados,
    updateComandaEstado,
    getTicketData,
    type TicketData
} from '../services/comandaService';

import { useWebSocket } from '../context/WebSocketContext';
import { Container, Grid, Typography, Card, CardContent, CardActions, Button, CircularProgress, Alert } from '@mui/material';

// Importamos el formato del ticket y el CSS de impresión
import FormatoTicketCaja from '../components/formatos/FormatoTicketCaja';
import './print.css';

const CashierViewPage = () => {
    const [comandas, setComandas] = useState<ComandaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { stompClient, isConnected } = useWebSocket();
    const [submittingId, setSubmittingId] = useState<number | null>(null);
    const [dataParaImprimir, setDataParaImprimir] = useState<TicketData | null>(null);
    const componenteImprimibleRef = useRef<HTMLDivElement>(null);

    // --- LÓGICA PARA CARGAR COMANDAS (RESTAURADA) ---
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

    // --- LÓGICA DE WEBSOCKETS (RESTAURADA) ---
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

    // --- LÓGICA DE IMPRESIÓN (FINAL Y CORRECTA) ---
    const handlePrint = useReactToPrint({
        contentRef: componenteImprimibleRef,
        onBeforePrint: async () => {
            document.body.classList.add('imprimiendo-ticket');
        },
        onAfterPrint: () => {
            document.body.classList.remove('imprimiendo-ticket');
            setDataParaImprimir(null);
        }
    });

    // --- USEEFFECT PARA DISPARAR LA IMPRESIÓN (FINAL Y CORRECTO) ---
    useEffect(() => {
        if (dataParaImprimir) {
            handlePrint();
        }
    }, [dataParaImprimir, handlePrint]);

    // --- LÓGICA PARA PAGAR (RESTAURADA) ---
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

    // --- LÓGICA PARA GENERAR EL TICKET (FINAL Y CORRECTO) ---
    const handleGenerateAndPrintTicket = async (comandaId: number) => {
        try {
            const data = await getTicketData(comandaId);
            setDataParaImprimir(data);
        } catch (err) {
            console.error("Error al generar los datos del ticket:", err);
            alert("No se pudo generar el ticket para imprimir.");
        }
    };

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <div id="root-app-container">
            <Container sx={{ py: 4 }} maxWidth="xl">
                <Typography variant="h4" align="center" gutterBottom>Comandas por Cobrar</Typography>
                <Grid container spacing={3}>
                    {comandas.length > 0 ? (
                        comandas.map((comanda) => (
                            <Grid item key={comanda.id} xs={12} sm={6} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Mesa: {comanda.nombreMesa}</Typography>
                                        <Typography variant="h5" color="text.secondary" sx={{ my: 1 }}>
                                            Total: ${comanda.total.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption">Estado: {comanda.estado}</Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => handleGenerateAndPrintTicket(comanda.id)}
                                        >
                                            Imprimir
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

            <div className="ticket-print-container">
                {dataParaImprimir && <FormatoTicketCaja ticketData={dataParaImprimir} ref={componenteImprimibleRef} />}
            </div>
        </div>
    );
};

export default CashierViewPage;