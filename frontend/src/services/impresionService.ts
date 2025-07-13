import api from './api';

export const imprimirTicketCaja = async (comandaId: number): Promise<void> => {
  try {
    console.log(`🖨️ Iniciando impresión de ticket para comanda ${comandaId}...`);
    
    // Crear un timeout de 10 segundos
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout: La impresión tardó más de 10 segundos'));
      }, 10000);
    });

    // Hacer la llamada HTTP con timeout
    const printPromise = api.post(`/imprimir/ticket-caja/${comandaId}`);
    
    await Promise.race([printPromise, timeoutPromise]);
    
    console.log(`✅ Ticket enviado exitosamente para comanda ${comandaId}`);
  } catch (error) {
    console.error("❌ Error en el servicio de impresión:", error);
    throw error;
  }
};