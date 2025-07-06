import api from './api';

export const imprimirTicketCaja = async (comandaId: number): Promise<void> => {
  try {
    await api.post(`/imprimir/ticket-caja/${comandaId}`);
  } catch (error) {
    // El error se manejará en el componente que llama a esta función
    console.error("Error en el servicio de impresión:", error);
    throw error;
  }
};