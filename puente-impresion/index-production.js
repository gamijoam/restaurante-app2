// --- 1. IMPORTACIONES ---
require('dotenv').config({ path: './config.env' });
const { Client } = require('@stomp/stompjs');
const WebSocket = require('ws');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

Object.assign(global, { WebSocket });

// --- 2. CONFIGURACIÓN PARA PRODUCCIÓN ---
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'ws://localhost:8080/ws';
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 5000;
const PRINT_TIMEOUT = 25000; // 25 segundos para producción
const HEALTH_CHECK_INTERVAL = 20000; // 20 segundos

console.log('-----------------------------------------');
console.log('--- PUENTE DE IMPRESIÓN v4.0 (PRODUCCIÓN) ---');
console.log('-----------------------------------------');
console.log(`WebSocket URL: ${WEBSOCKET_URL}`);
console.log(`Modo: PRODUCCIÓN`);
console.log(`Timeout de impresión: ${PRINT_TIMEOUT/1000} segundos`);

// --- 3. VARIABLES DE CONTROL ---
let reconnectAttempts = 0;
let isConnected = false;
let currentPrintJob = null;
let printTimeout = null;
let healthCheckInterval = null;
let isShuttingDown = false;
let lastPrintTime = null;

// --- 4. FUNCIÓN DE IMPRESIÓN PARA PRODUCCIÓN ---
async function imprimirTicket(printJob) {
    // Evitar trabajos simultáneos
    if (currentPrintJob) {
        console.log('⚠️ Ya hay un trabajo de impresión en curso, ignorando...');
        return;
    }

    currentPrintJob = printJob;
    const { printerType, printerTarget, ticketType, ticketData } = printJob;
    
    console.log(`\n🖨️ NUEVO TRABAJO DE IMPRESIÓN (PRODUCCIÓN):`);
    console.log(`   Tipo: ${printerType}`);
    console.log(`   Destino: ${printerTarget}`);
    console.log(`   Ticket: ${ticketType}`);
    console.log(`   Mesa: ${ticketData?.nombreMesa || 'N/A'}`);

    // Configurar timeout para producción
    printTimeout = setTimeout(() => {
        console.error('❌ Timeout de impresión alcanzado (25 segundos)');
        cleanupPrintJob();
    }, PRINT_TIMEOUT);

    try {
        // Validar datos básicos
        if (!ticketData || !ticketData.nombreMesa || !ticketData.items) {
            console.error('❌ Datos del ticket incompletos');
            cleanupPrintJob();
            return;
        }

        // Crear impresora con configuración para producción
        const printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: printerTarget,
            driver: require('node-printer'),
            characterSet: 'PC850_MULTILINGUAL',
            timeout: 8000 // 8 segundos timeout para producción
        });

        // Imprimir según el tipo
        if (ticketType === "COCINA") {
            await imprimirTicketCocinaProduccion(printer, ticketData);
        } else {
            await imprimirTicketCajaProduccion(printer, ticketData);
        }
        
        await printer.execute();
        console.log("✅ Ticket enviado exitosamente (PRODUCCIÓN)");
        lastPrintTime = new Date();
        
    } catch (error) {
        console.error(`❌ Error de impresión en producción: ${error.message}`);
        console.error(`Stack trace: ${error.stack}`);
        
        // No intentar reconectar automáticamente en producción
        cleanupPrintJob();
    }
}

// Función para limpiar trabajo de impresión
function cleanupPrintJob() {
    if (printTimeout) {
        clearTimeout(printTimeout);
        printTimeout = null;
    }
    currentPrintJob = null;
}

// --- FUNCIÓN PARA TICKETS DE COCINA (PRODUCCIÓN) ---
async function imprimirTicketCocinaProduccion(printer, ticketData) {
    try {
        printer.alignCenter();
        printer.println("COCINA");
        printer.println("================================");
        printer.alignLeft();
        
        printer.println(`Mesa: ${ticketData.nombreMesa}`);
        printer.println(`Comanda: ${ticketData.comandaId || 'N/A'}`);
        printer.println(`Hora: ${new Date().toLocaleTimeString()}`);
        printer.println("--------------------------------");
        
        printer.println("Cant. | Producto");
        printer.println("--------------------------------");
        
        ticketData.items.forEach((item, index) => {
            const cantidad = (item.cantidad || 0).toString().padStart(3);
            const producto = (item.nombreProducto || "Producto").substring(0, 25);
            printer.println(`${cantidad} x ${producto}`);
            
            if (item.notas && item.notas.trim()) {
                printer.println(`     Nota: ${item.notas}`);
            }
        });
        
        printer.println("--------------------------------");
        printer.alignCenter();
        printer.println("¡LISTO PARA PREPARAR!");
        printer.println("");
        printer.cut();
        
    } catch (error) {
        console.error('❌ Error en ticket cocina (producción):', error.message);
        throw error;
    }
}

// --- FUNCIÓN PARA TICKETS DE CAJA (PRODUCCIÓN) ---
async function imprimirTicketCajaProduccion(printer, ticketData) {
    try {
        printer.alignCenter();
        printer.println("Restaurante 'El Buen Sabor'");
        printer.println("================================");
        printer.alignLeft();
        
        printer.println(`Mesa: ${ticketData.nombreMesa}`);
        printer.println(`Comanda: ${ticketData.comandaId || 'N/A'}`);
        printer.println(`Fecha: ${new Date().toLocaleString()}`);
        printer.println("--------------------------------");
        
        printer.println("Cant. | Producto | Total");
        printer.println("--------------------------------");
        
        ticketData.items.forEach((item, index) => {
            const cantidad = (item.cantidad || 0).toString().padStart(3);
            const producto = (item.nombreProducto || "Producto").substring(0, 20).padEnd(20);
            const precio = item.precioTotal || 0;
            const total = `$${precio.toFixed(2)}`.padStart(8);
            printer.println(`${cantidad} | ${producto} | ${total}`);
        });
        
        printer.println("--------------------------------");
        printer.alignRight();
        const total = ticketData.total || 0;
        printer.println(`TOTAL: $${total.toFixed(2)}`);
        printer.alignCenter();
        printer.println("¡Gracias por su visita!");
        printer.println("");
        printer.cut();
        
    } catch (error) {
        console.error('❌ Error en ticket caja (producción):', error.message);
        throw error;
    }
}

// --- 5. CLIENTE STOMP PARA PRODUCCIÓN ---
const stompClient = new Client({
    brokerURL: WEBSOCKET_URL,
    reconnectDelay: RECONNECT_DELAY,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000
});

stompClient.onConnect = () => {
    console.log('✅ WebSocket conectado (PRODUCCIÓN)');
    isConnected = true;
    reconnectAttempts = 0;
    
    stompClient.subscribe('/topic/print-jobs', async (message) => {
        try {
            const printJob = JSON.parse(message.body);
            console.log('📨 Trabajo de impresión recibido (PRODUCCIÓN)');
            await imprimirTicket(printJob);
        } catch (error) {
            console.error('❌ Error procesando mensaje (PRODUCCIÓN):', error.message);
        }
    });
    
    console.log("✅ Suscrito a '/topic/print-jobs' (PRODUCCIÓN)");
};

stompClient.onDisconnect = () => {
    console.log('❌ WebSocket desconectado (PRODUCCIÓN)');
    isConnected = false;
};

stompClient.onStompError = (frame) => {
    console.error('❌ Error STOMP (PRODUCCIÓN):', frame.headers['message']);
    isConnected = false;
    
    // Reconexión limitada para producción
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !isShuttingDown) {
        reconnectAttempts++;
        console.log(`🔄 Reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} (PRODUCCIÓN)`);
        setTimeout(() => {
            if (!isConnected && !isShuttingDown) {
                stompClient.activate();
            }
        }, RECONNECT_DELAY);
    }
};

stompClient.onWebSocketError = (error) => {
    console.error('❌ Error WebSocket (PRODUCCIÓN):', error.message);
    isConnected = false;
    
    // Reconexión limitada para producción
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !isShuttingDown) {
        reconnectAttempts++;
        console.log(`🔄 Reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} (PRODUCCIÓN)`);
        setTimeout(() => {
            if (!isConnected && !isShuttingDown) {
                stompClient.activate();
            }
        }, RECONNECT_DELAY);
    }
};

stompClient.onWebSocketClose = () => {
    console.log('❌ WebSocket cerrado (PRODUCCIÓN)');
    isConnected = false;
};

// --- 6. FUNCIÓN DE LIMPIEZA ---
function cleanup() {
    console.log('🧹 Limpiando recursos (PRODUCCIÓN)...');
    isShuttingDown = true;
    
    cleanupPrintJob();
    
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
    }
}

// --- 7. INICIALIZACIÓN ---
console.log('🔄 Conectando al broker STOMP (PRODUCCIÓN)...');
stompClient.activate();

// --- 8. HEALTH CHECK PARA PRODUCCIÓN ---
healthCheckInterval = setInterval(() => {
    if (!isShuttingDown) {
        if (!isConnected && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            console.log('⚠️ Desconectado, intentando reconectar (PRODUCCIÓN)...');
            stompClient.activate();
        } else if (isConnected) {
            console.log('✅ Sistema funcionando correctamente (PRODUCCIÓN)');
            if (lastPrintTime) {
                console.log(`📅 Última impresión: ${lastPrintTime.toLocaleTimeString()}`);
            }
        }
    }
}, HEALTH_CHECK_INTERVAL);

// --- 9. MANEJO DE SEÑALES ---
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando puente de impresión (PRODUCCIÓN)...');
    cleanup();
    setTimeout(() => {
        stompClient.deactivate();
        process.exit(0);
    }, 1000);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando puente de impresión (PRODUCCIÓN)...');
    cleanup();
    setTimeout(() => {
        stompClient.deactivate();
        process.exit(0);
    }, 1000);
});

// --- 10. MANEJO DE ERRORES ---
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado (PRODUCCIÓN):', error.message);
    console.error('Stack trace:', error.stack);
    cleanup();
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Promesa rechazada (PRODUCCIÓN):', reason);
    cleanup();
});

console.log('🚀 Puente de impresión iniciado correctamente (PRODUCCIÓN)'); 