import { useWebSocket } from '../context/WebSocketContextProduction';
import { useNotification } from '../hooks/useNotification';

export interface PrintJob {
  printerType: string;
  printerTarget: string;
  ticketType: string;
  ticketData: any;
  area?: string;
  template?: any;
}

export interface PrintService {
  sendPrintJob: (printJob: PrintJob) => Promise<boolean>;
}

export const usePrintService = (): PrintService => {
  const { stompClient, isConnected, reconnect } = useWebSocket();
  const { showSuccess, showError } = useNotification();

  const sendPrintJob = async (printJob: PrintJob): Promise<boolean> => {
    // Si no hay conexión WebSocket, mostrar advertencia pero no bloquear
    if (!stompClient || !isConnected) {
      console.warn('⚠️ WebSocket no conectado, impresión no disponible');
      showError(
        'Impresión no disponible', 
        'El sistema de impresión no está conectado. La impresión no funcionará hasta que se restablezca la conexión.'
      );
      
      // Intentar reconectar en segundo plano
      setTimeout(() => {
        console.log('🔄 Intentando reconectar WebSocket para impresión...');
        reconnect();
      }, 2000);
      
      return false;
    }

    try {
      console.log('🖨️ Enviando trabajo de impresión...');
      
      // Timeout más corto para evitar bloqueos
      const printTimeout = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout de impresión (10 segundos)'));
        }, 10000); // 10 segundos timeout
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
        
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error enviando trabajo de impresión:', error);
      
      // Mostrar error específico según el tipo
      if (error instanceof Error) {
        if (error.message.includes('Timeout')) {
          showError(
            'Timeout de impresión', 
            'La impresión tardó demasiado en responder. Verifica la conexión del sistema de impresión.'
          );
        } else if (error.message.includes('Cliente STOMP no conectado')) {
          showError(
            'Conexión perdida', 
            'Se perdió la conexión con el sistema de impresión. Intentando reconectar...'
          );
          
          // Intentar reconectar
          setTimeout(() => {
            reconnect();
          }, 2000);
        } else {
          showError(
            'Error de impresión', 
            `No se pudo enviar el trabajo de impresión: ${error.message}`
          );
        }
      } else {
        showError(
          'Error de impresión', 
          'Ocurrió un error inesperado al enviar el trabajo de impresión.'
        );
      }
      
      return false;
    }
  };

  return {
    sendPrintJob
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