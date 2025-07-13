import { useWebSocket } from '../context/WebSocketContextProduction';
import { useNotification } from '../hooks/useNotification';

interface PrintJob {
  printerType: string;
  printerTarget: string;
  ticketType: 'COCINA' | 'CAJA';
  ticketData: any;
  template?: any;
}

interface PrintService {
  sendPrintJob: (printJob: PrintJob) => Promise<boolean>;
  isConnected: boolean;
  reconnect: () => void;
}

export const usePrintService = (): PrintService => {
  const { stompClient, isConnected, reconnect } = useWebSocket();
  const { showSuccess, showError } = useNotification();

  const sendPrintJob = async (printJob: PrintJob): Promise<boolean> => {
    if (!stompClient || !isConnected) {
      showError(
        'Error de conexión', 
        'El sistema de impresión no está conectado. Intentando reconectar...'
      );
      
      // Intentar reconectar automáticamente
      setTimeout(() => {
        reconnect();
      }, 2000);
      
      return false;
    }

    try {
      console.log('🖨️ Enviando trabajo de impresión (PRODUCCIÓN)...');
      
      // Timeout más largo para producción
      const printTimeout = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout de impresión (30 segundos)'));
        }, 30000); // 30 segundos timeout para producción
      });

      // Enviar el trabajo de impresión
      const printPromise = new Promise<boolean>((resolve, reject) => {
        try {
          // Verificar que el cliente esté conectado antes de enviar
          if (!stompClient.connected) {
            reject(new Error('Cliente STOMP no conectado'));
            return;
          }

          stompClient.publish({
            destination: '/app/print',
            body: JSON.stringify(printJob),
            headers: {
              'content-type': 'application/json'
            }
          });
          
          // Resolver inmediatamente después de enviar
          resolve(true);
          
        } catch (error) {
          reject(error);
        }
      });

      // Competir entre el timeout y la impresión
      const result = await Promise.race([printPromise, printTimeout]);
      
      if (result) {
        showSuccess(
          'Impresión enviada', 
          `Ticket enviado a ${printJob.printerTarget}`
        );
        
        // Disparar evento personalizado para el monitor
        window.dispatchEvent(new CustomEvent('print-completed', {
          detail: { printJob, timestamp: new Date() }
        }));
        
        // Verificar conexión después de imprimir
        setTimeout(() => {
          if (!stompClient.connected) {
            console.log('🔄 WebSocket desconectado después de imprimir, reconectando...');
            reconnect();
          }
        }, 1000);
        
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error enviando trabajo de impresión (PRODUCCIÓN):', error);
      
      let errorMessage = 'Error desconocido al enviar impresión';
      
      if (error instanceof Error) {
        if (error.message.includes('Timeout')) {
          errorMessage = 'La impresión tardó demasiado. Verifique la conexión.';
        } else if (error.message.includes('connection') || error.message.includes('Cliente STOMP')) {
          errorMessage = 'Error de conexión. Intentando reconectar...';
          // Reconectar automáticamente
          setTimeout(() => {
            reconnect();
          }, 3000);
        } else {
          errorMessage = error.message;
        }
      }
      
      showError('Error de impresión', errorMessage);
      return false;
    }
  };

  return {
    sendPrintJob,
    isConnected,
    reconnect
  };
};

// Función utilitaria para crear trabajos de impresión
export const createPrintJob = (
  printerType: string,
  printerTarget: string,
  ticketType: 'COCINA' | 'CAJA',
  ticketData: any,
  template?: any
): PrintJob => {
  return {
    printerType,
    printerTarget,
    ticketType,
    ticketData,
    template
  };
};

// Función para validar datos de impresión
export const validatePrintData = (ticketData: any): boolean => {
  if (!ticketData) {
    console.error('❌ Datos del ticket son null o undefined');
    return false;
  }
  
  if (!ticketData.nombreMesa) {
    console.error('❌ nombreMesa es requerido');
    return false;
  }
  
  if (!ticketData.items || !Array.isArray(ticketData.items)) {
    console.error('❌ items debe ser un array válido');
    return false;
  }
  
  if (ticketData.items.length === 0) {
    console.error('❌ El ticket debe tener al menos un item');
    return false;
  }
  
  return true;
}; 