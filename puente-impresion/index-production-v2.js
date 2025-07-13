// --- 1. IMPORTACIONES ---
require('dotenv').config({ path: './config.env' });
const { Client } = require('@stomp/stompjs');
const WebSocket = require('ws');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

Object.assign(global, { WebSocket });

// --- 2. CONFIGURACIÓN PARA PRODUCCIÓN V2 ---
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'ws://localhost:8080/ws';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;
const PRINT_TIMEOUT = 30000; // 30 segundos para producción
const HEALTH_CHECK_INTERVAL = 15000; // 15 segundos
const CONNECTION_TIMEOUT = 10000; // 10 segundos

console.log('-----------------------------------------');
console.log('--- PUENTE DE IMPRESIÓN v5.0 (PRODUCCIÓN V2) ---');
console.log('-----------------------------------------');
console.log(`WebSocket URL: ${WEBSOCKET_URL}`);
console.log(`Modo: PRODUCCIÓN V2`);
console.log(`Timeout de impresión: ${PRINT_TIMEOUT/1000} segundos`);

// --- 3. VARIABLES DE CONTROL MEJORADAS ---
let reconnectAttempts = 0;
let isConnected = false;
let currentPrintJob = null;
let printTimeout = null;
let healthCheckInterval = null;
let isShuttingDown = false;
let lastPrintTime = null;
let connectionStartTime = null;
let printJobQueue = [];
let isProcessingQueue = false;

// --- 4. FUNCIÓN DE IMPRESIÓN MEJORADA ---
async function imprimirTicket(printJob) {
    // Agregar a la cola si hay un trabajo en curso
    if (currentPrintJob) {
        console.log('⚠️ Ya hay un trabajo de impresión en curso, agregando a cola...');
        printJobQueue.push(printJob);
        return;
    }

    currentPrintJob = printJob;
    const { printerType, printerTarget, ticketType, ticketData, template } = printJob;
    
    console.log(`\n🖨️ NUEVO TRABAJO DE IMPRESIÓN (PRODUCCIÓN V2):`);
    console.log(`   Tipo: ${printerType}`);
    console.log(`   Destino: ${printerTarget}`);
    console.log(`   Ticket: ${ticketType}`);
    console.log(`   Mesa: ${ticketData?.nombreMesa || 'N/A'}`);
    console.log(`   Plantilla: ${template?.name || 'Por defecto'}`);

    // Configurar timeout para producción
    printTimeout = setTimeout(() => {
        console.error('❌ Timeout de impresión alcanzado (30 segundos)');
        cleanupPrintJob();
        processNextInQueue();
    }, PRINT_TIMEOUT);

    try {
        // Validar datos básicos
        if (!ticketData || !ticketData.nombreMesa || !ticketData.items) {
            console.error('❌ Datos del ticket incompletos');
            cleanupPrintJob();
            processNextInQueue();
            return;
        }

        // Crear impresora con configuración mejorada
        const printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: printerTarget,
            driver: require('node-printer'),
            characterSet: 'PC850_MULTILINGUAL',
            timeout: 10000, // 10 segundos timeout
            removeSpecialCharacters: false
        });

        // Conectar a la impresora (no hay método isConnected en node-thermal-printer)
        console.log('🔄 Conectando a impresora...');
        try {
            await printer.connect();
            console.log('✅ Impresora conectada');
        } catch (connectError) {
            console.warn('⚠️ No se pudo conectar a la impresora, continuando...', connectError.message);
        }

        // Imprimir usando la plantilla personalizada si está disponible
        if (template && template.blocks && template.blocks.length > 0) {
            console.log('📋 Usando plantilla personalizada:', template.name);
            console.log('📋 Bloques de la plantilla:', JSON.stringify(template.blocks, null, 2));
            console.log('📋 Datos del ticket:', JSON.stringify(ticketData, null, 2));
            await imprimirConPlantillaPersonalizada(printer, ticketData, template);
        } else {
            console.log('📋 Usando plantilla por defecto (no hay plantilla personalizada)');
            console.log('📋 Template recibido:', JSON.stringify(template, null, 2));
            console.log('📋 Área del ticket:', ticketData.area || 'N/A');
            
            // Imprimir según el área del ticket
            const area = ticketData.area || ticketType;
            console.log('📋 Área para impresión:', area);
            
            if (area && (area.toUpperCase().includes('COCINA') || ticketType === "COCINA")) {
                console.log('📋 Imprimiendo ticket de COCINA');
                await imprimirTicketCocinaProduccion(printer, ticketData);
            } else {
                console.log('📋 Imprimiendo ticket de CAJA');
            await imprimirTicketCajaProduccion(printer, ticketData);
            }
        }
        
        await printer.execute();
        console.log("✅ Ticket enviado exitosamente (PRODUCCIÓN V2)");
        lastPrintTime = new Date();
        
        // Desconectar impresora después de imprimir (si existe el método)
        try {
            if (typeof printer.disconnect === 'function') {
                await printer.disconnect();
            }
        } catch (error) {
            console.warn('⚠️ Error desconectando impresora:', error.message);
        }
        
    } catch (error) {
        console.error(`❌ Error de impresión en producción V2: ${error.message}`);
        console.error(`Stack trace: ${error.stack}`);
        
        // Intentar reconectar WebSocket si hay error
        if (error.message.includes('connection') || error.message.includes('timeout')) {
            console.log('🔄 Error de conexión, intentando reconectar WebSocket...');
            setTimeout(() => {
                if (stompClient && !stompClient.connected) {
                    stompClient.activate();
                }
            }, 2000);
        }
        
    } finally {
        cleanupPrintJob();
        processNextInQueue();
    }
}

// Función para procesar siguiente trabajo en cola
function processNextInQueue() {
    if (printJobQueue.length > 0 && !currentPrintJob) {
        const nextJob = printJobQueue.shift();
        console.log('📋 Procesando siguiente trabajo en cola...');
        setTimeout(() => {
            imprimirTicket(nextJob);
        }, 1000); // Esperar 1 segundo entre impresiones
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

// --- FUNCIÓN PARA IMPRIMIR CON PLANTILLA PERSONALIZADA ---
async function imprimirConPlantillaPersonalizada(printer, ticketData, template) {
    try {
        console.log('📋 Procesando plantilla personalizada:', template.name);
        console.log('📋 Bloques de la plantilla:', template.blocks.length);
        
        // Procesar cada bloque de la plantilla
        for (const block of template.blocks) {
            console.log('📋 Procesando bloque:', block.type, block.value);
            
            switch (block.type) {
                case 'text':
                    // Configurar alineación
                    if (block.align === 'center') {
                        printer.alignCenter();
                    } else if (block.align === 'right') {
                        printer.alignRight();
                    } else {
                        printer.alignLeft();
                    }
                    
                    // Configurar negrita
                    if (block.bold) {
                        printer.bold(true);
                    }
                    
                    // Imprimir texto
                    const textValue = block.value || '';
                    console.log('📋 Imprimiendo texto:', textValue);
                    printer.println(textValue);
                    
                    // Restaurar formato
                    if (block.bold) {
                        printer.bold(false);
                    }
                    break;
                    
                case 'line':
                    console.log('📋 Imprimiendo línea separadora');
                    printer.println('--------------------------------');
                    break;
                    
                case 'datetime':
                    // Configurar alineación
                    if (block.align === 'center') {
                        printer.alignCenter();
                    } else if (block.align === 'right') {
                        printer.alignRight();
                    } else {
                        printer.alignLeft();
                    }
                    
                    // Imprimir fecha/hora
                    const now = new Date();
                    let dateTimeText = '';
                    
                    if (block.format === 'DD/MM/YYYY HH:mm') {
                        dateTimeText = now.toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    } else {
                        dateTimeText = now.toLocaleString();
                    }
                    
                    console.log('📋 Imprimiendo fecha/hora:', dateTimeText);
                    printer.println(dateTimeText);
                    break;
                    
                case 'table':
                    console.log('📋 Procesando tabla de items');
                    
                    // Imprimir encabezados de tabla
                    if (block.columns && block.columns.length > 0) {
                        printer.alignLeft();
                        const headerLine = block.columns.join(' | ');
                        console.log('📋 Encabezado de tabla:', headerLine);
                        printer.println(headerLine);
                        printer.println('--------------------------------');
                    }
                    
                    // Imprimir items
                    if (ticketData.items && ticketData.items.length > 0) {
                        ticketData.items.forEach((item, index) => {
                            const cantidad = item.cantidad || 0;
                            const producto = item.nombreProducto || 'Producto';
                            const precio = item.precioTotal || 0;
                            const total = cantidad * precio;
                            
                            console.log(`📋 Item ${index + 1}: ${cantidad}x ${producto} - $${precio}`);
                            
                            // Formatear línea según columnas
                            let itemLine = '';
                            if (block.columns && block.columns.includes('Producto')) {
                                itemLine = `${cantidad} | ${producto} | $${precio.toFixed(2)} | $${total.toFixed(2)}`;
                            } else {
                                itemLine = `${cantidad} x ${producto} - $${precio.toFixed(2)}`;
                            }
                            
                            printer.println(itemLine);
                            
                            // Imprimir notas si existen
                            if (item.notas && item.notas.trim()) {
                                printer.println(`     Nota: ${item.notas}`);
                            }
                        });
                    }
                    break;
                    
                case 'total':
                    console.log('📋 Procesando total');
                    printer.alignRight();
                    
                    const total = ticketData.total || 0;
                    const totalText = block.label || 'Total';
                    console.log('📋 Imprimiendo total:', `${totalText}: $${total.toFixed(2)}`);
                    printer.println(`${totalText}: $${total.toFixed(2)}`);
                    break;
                    
                default:
                    console.log('📋 Tipo de bloque no reconocido:', block.type);
                    break;
            }
        }
        
        // Cortar ticket al final
        printer.cut();
        console.log('✅ Plantilla personalizada procesada correctamente');
        
    } catch (error) {
        console.error('❌ Error procesando plantilla personalizada:', error.message);
        throw error;
    }
}

// --- FUNCIÓN PARA TICKETS DE COCINA (PRODUCCIÓN V2) ---
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
        console.error('❌ Error en ticket cocina (producción V2):', error.message);
        throw error;
    }
}

// --- FUNCIÓN PARA TICKETS DE CAJA (PRODUCCIÓN V2) ---
async function imprimirTicketCajaProduccion(printer, ticketData) {
    try {
        printer.alignCenter();
        printer.println("TICKET DE CAJA");
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
        console.error('❌ Error en ticket caja (producción V2):', error.message);
        throw error;
    }
}

// --- 5. CLIENTE STOMP MEJORADO PARA PRODUCCIÓN V2 ---
const stompClient = new Client({
    brokerURL: WEBSOCKET_URL,
    reconnectDelay: RECONNECT_DELAY,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    connectionTimeout: CONNECTION_TIMEOUT
});

stompClient.onConnect = () => {
    console.log('✅ WebSocket conectado (PRODUCCIÓN V2)');
    isConnected = true;
    reconnectAttempts = 0;
    connectionStartTime = new Date();
    
    stompClient.subscribe('/topic/print-jobs', async (message) => {
        try {
            const printJob = JSON.parse(message.body);
            console.log('📨 Trabajo de impresión recibido (PRODUCCIÓN V2)');
            await imprimirTicket(printJob);
        } catch (error) {
            console.error('❌ Error procesando mensaje (PRODUCCIÓN V2):', error.message);
        }
    });
    
    console.log("✅ Suscrito a '/topic/print-jobs' (PRODUCCIÓN V2)");
};

stompClient.onDisconnect = () => {
    console.log('❌ WebSocket desconectado (PRODUCCIÓN V2)');
    isConnected = false;
    
    // Reconexión automática mejorada
    if (!isShuttingDown && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`🔄 Reconexión automática ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} (PRODUCCIÓN V2)`);
        setTimeout(() => {
            if (!isConnected && !isShuttingDown) {
                stompClient.activate();
            }
        }, RECONNECT_DELAY);
    }
};

stompClient.onStompError = (frame) => {
    console.error('❌ Error STOMP (PRODUCCIÓN V2):', frame.headers['message']);
    isConnected = false;
    
    // Reconexión limitada para producción
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !isShuttingDown) {
        reconnectAttempts++;
        console.log(`🔄 Reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} (PRODUCCIÓN V2)`);
        setTimeout(() => {
            if (!isConnected && !isShuttingDown) {
                stompClient.activate();
            }
        }, RECONNECT_DELAY);
    }
};

stompClient.onWebSocketError = (error) => {
    console.error('❌ Error WebSocket (PRODUCCIÓN V2):', error.message);
    isConnected = false;
    
    // Reconexión limitada para producción
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !isShuttingDown) {
        reconnectAttempts++;
        console.log(`🔄 Reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} (PRODUCCIÓN V2)`);
        setTimeout(() => {
            if (!isConnected && !isShuttingDown) {
                stompClient.activate();
            }
        }, RECONNECT_DELAY);
    }
};

stompClient.onWebSocketClose = () => {
    console.log('❌ WebSocket cerrado (PRODUCCIÓN V2)');
    isConnected = false;
};

// --- 6. FUNCIÓN DE LIMPIEZA MEJORADA ---
function cleanup() {
    console.log('🧹 Limpiando recursos (PRODUCCIÓN V2)...');
    isShuttingDown = true;
    
    cleanupPrintJob();
    
    // Limpiar cola de impresión
    printJobQueue = [];
    
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
    }
}

// --- 7. INICIALIZACIÓN ---
console.log('🔄 Conectando al broker STOMP (PRODUCCIÓN V2)...');
stompClient.activate();

// --- 8. HEALTH CHECK MEJORADO PARA PRODUCCIÓN V2 ---
healthCheckInterval = setInterval(() => {
    if (!isShuttingDown) {
        if (!isConnected && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            console.log('⚠️ Desconectado, intentando reconectar (PRODUCCIÓN V2)...');
            stompClient.activate();
        } else if (isConnected) {
            const uptime = connectionStartTime ? Math.floor((new Date() - connectionStartTime) / 1000) : 0;
            console.log(`✅ Sistema funcionando correctamente (PRODUCCIÓN V2) - Uptime: ${uptime}s`);
            if (lastPrintTime) {
                console.log(`📅 Última impresión: ${lastPrintTime.toLocaleTimeString()}`);
            }
            if (printJobQueue.length > 0) {
                console.log(`📋 Trabajos en cola: ${printJobQueue.length}`);
            }
        }
    }
}, HEALTH_CHECK_INTERVAL);

// --- 9. MANEJO DE SEÑALES ---
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando puente de impresión (PRODUCCIÓN V2)...');
    cleanup();
    setTimeout(() => {
        stompClient.deactivate();
        process.exit(0);
    }, 1000);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando puente de impresión (PRODUCCIÓN V2)...');
    cleanup();
    setTimeout(() => {
        stompClient.deactivate();
        process.exit(0);
    }, 1000);
});

// --- 10. MANEJO DE ERRORES MEJORADO ---
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado (PRODUCCIÓN V2):', error.message);
    console.error('Stack trace:', error.stack);
    cleanup();
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Promesa rechazada (PRODUCCIÓN V2):', reason);
    cleanup();
});

console.log('🚀 Puente de impresión V2 iniciado correctamente (PRODUCCIÓN V2)'); 