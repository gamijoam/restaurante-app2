// --- 1. IMPORTACIONES ---
require('dotenv').config({ path: './config.env' });
const { Client } = require('@stomp/stompjs');
const WebSocket = require('ws');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

Object.assign(global, { WebSocket });

// --- 2. CONFIGURACIÓN ---
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'ws://localhost:8080/ws';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;
const PRINT_TIMEOUT = 15000; // 15 segundos timeout para impresión
const HEALTH_CHECK_INTERVAL = 15000; // 15 segundos

console.log('-----------------------------------------');
console.log('--- PUENTE DE IMPRESIÓN v3.0 (ROBUSTO) ---');
console.log('-----------------------------------------');
console.log(`WebSocket URL: ${WEBSOCKET_URL}`);

// --- 3. VARIABLES DE CONTROL ---
let reconnectAttempts = 0;
let isConnected = false;
let currentPrintJob = null;
let printTimeout = null;
let healthCheckInterval = null;
let isShuttingDown = false;

// --- 4. FUNCIÓN DE IMPRESIÓN SIMPLIFICADA Y ROBUSTA ---
async function imprimirTicket(printJob) {
    // Evitar trabajos simultáneos
    if (currentPrintJob) {
        console.log('⚠️ Ya hay un trabajo de impresión en curso, ignorando...');
        return;
    }

    currentPrintJob = printJob;
    const { printerType, printerTarget, ticketType, ticketData } = printJob;
    
    console.log(`\n🖨️ Nuevo trabajo de impresión:`);
    console.log(`   Tipo: ${printerType}`);
    console.log(`   Destino: ${printerTarget}`);
    console.log(`   Ticket: ${ticketType}`);

    // Configurar timeout más corto
    printTimeout = setTimeout(() => {
        console.error('❌ Timeout de impresión alcanzado (15 segundos)');
        cleanupPrintJob();
    }, PRINT_TIMEOUT);

    try {
        // Validar datos básicos
        if (!ticketData || !ticketData.nombreMesa || !ticketData.items) {
            console.error('❌ Datos del ticket incompletos');
            cleanupPrintJob();
            return;
        }

        // Crear impresora con timeout más corto
        const printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: printerTarget,
            driver: require('node-printer'),
            characterSet: 'PC850_MULTILINGUAL',
            timeout: 5000 // 5 segundos timeout
        });

        // Imprimir según el tipo
        if (ticketType === "COCINA") {
            await imprimirTicketCocinaSimple(printer, ticketData);
        } else {
            await imprimirTicketCajaSimple(printer, ticketData);
        }
        
        await printer.execute();
        console.log("✅ Ticket enviado exitosamente");
        
    } catch (error) {
        console.error(`❌ Error de impresión: ${error.message}`);
        
        // No intentar reconectar automáticamente, solo limpiar
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

// --- FUNCIÓN PARA TICKETS DE COCINA SIMPLIFICADA ---
async function imprimirTicketCocinaSimple(printer, ticketData) {
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
        console.error('❌ Error en ticket cocina:', error.message);
        throw error;
    }
}

// --- FUNCIÓN PARA TICKETS DE CAJA SIMPLIFICADA ---
async function imprimirTicketCajaSimple(printer, ticketData) {
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
        console.error('❌ Error en ticket caja:', error.message);
        throw error;
    }
}

// --- 5. CLIENTE STOMP SIMPLIFICADO ---
const stompClient = new Client({
    brokerURL: WEBSOCKET_URL,
    reconnectDelay: RECONNECT_DELAY,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000
});

stompClient.onConnect = (frame) => {
    console.log('✅ Conectado al broker STOMP');
    isConnected = true;
    reconnectAttempts = 0;
    
    stompClient.subscribe('/topic/print-jobs', async (message) => {
        try {
            const printJob = JSON.parse(message.body);
            console.log('📨 Trabajo de impresión recibido');
            await imprimirTicket(printJob);
        } catch (error) {
            console.error('❌ Error procesando mensaje:', error.message);
        }
    });
    
    console.log("✅ Suscrito a '/topic/print-jobs'");
};

stompClient.onDisconnect = () => {
    console.log('❌ Desconectado del broker STOMP');
    isConnected = false;
};

stompClient.onStompError = (frame) => {
    console.error('❌ Error STOMP:', frame.headers['message']);
    isConnected = false;
};

stompClient.onWebSocketError = (error) => {
    console.error('❌ Error WebSocket:', error.message);
    isConnected = false;
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !isShuttingDown) {
        reconnectAttempts++;
        console.log(`🔄 Reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} en ${RECONNECT_DELAY/1000}s`);
        setTimeout(() => {
            if (!isConnected && !isShuttingDown) {
                stompClient.activate();
            }
        }, RECONNECT_DELAY);
    }
};

stompClient.onWebSocketClose = () => {
    console.log('❌ Conexión WebSocket cerrada');
    isConnected = false;
};

// --- 6. FUNCIÓN DE LIMPIEZA ---
function cleanup() {
    console.log('🧹 Limpiando recursos...');
    isShuttingDown = true;
    
    cleanupPrintJob();
    
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
    }
}

// --- 7. INICIALIZACIÓN ---
console.log('🔄 Conectando al broker STOMP...');
stompClient.activate();

// --- 8. HEALTH CHECK SIMPLIFICADO ---
healthCheckInterval = setInterval(() => {
    if (!isShuttingDown) {
        if (!isConnected && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            console.log('⚠️ Desconectado, intentando reconectar...');
            stompClient.activate();
        } else if (isConnected) {
            console.log('✅ Sistema funcionando correctamente');
        }
    }
}, HEALTH_CHECK_INTERVAL);

// --- 9. MANEJO DE SEÑALES ---
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando puente de impresión...');
    cleanup();
    setTimeout(() => {
        stompClient.deactivate();
        process.exit(0);
    }, 1000);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando puente de impresión...');
    cleanup();
    setTimeout(() => {
        stompClient.deactivate();
        process.exit(0);
    }, 1000);
});

// --- 10. MANEJO DE ERRORES ---
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error.message);
    cleanup();
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Promesa rechazada:', reason);
    cleanup();
});

console.log('🚀 Puente de impresión iniciado correctamente');