// --- 1. IMPORTACIONES ---
require('dotenv').config();
const { Client } = require('@stomp/stompjs');
const WebSocket = require('ws');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

Object.assign(global, { WebSocket });

// --- 2. CONFIGURACIÓN ---
const WEBSOCKET_URL = process.env.WEBSOCKET_URL;

console.log('-----------------------------------------');
console.log('--- PUENTE DE IMPRESIÓN (MODO OPERATIVO) ---');
console.log('-----------------------------------------');

if (!WEBSOCKET_URL) {
    console.error('ERROR: La variable WEBSOCKET_URL no está definida en el archivo .env');
    process.exit(1);
}

// --- 3. FUNCIÓN DE IMPRESIÓN CON PLANTILLAS DINÁMICAS ---
async function imprimirTicket(printJob) {
    const { printerType, printerTarget, ticketType, ticketData, template } = printJob;
    console.log(`\n--- Nuevo trabajo de impresión recibido ---`);
    console.log(`Tipo: ${printerType}, Destino: ${printerTarget}, Ticket: ${ticketType}`);

    const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: printerTarget,
        driver: require('node-printer'),
        characterSet: 'PC850_MULTILINGUAL' 
    });

    try {
        console.log("Datos del ticket recibidos:", JSON.stringify(ticketData, null, 2));
        
        // Validar que los datos necesarios estén presentes
        if (!ticketData.nombreMesa) {
            console.error("❌ Error: nombreMesa es null o undefined");
            return;
        }
        
        if (!ticketData.items || !Array.isArray(ticketData.items)) {
            console.error("❌ Error: items no es un array válido");
            return;
        }
        
        // Usar plantilla dinámica si está disponible, sino usar formato por defecto
        if (template && template.blocks && template.blocks.length > 0) {
            await imprimirConPlantilla(printer, ticketData, template);
        } else {
            // Fallback a formato por defecto
            if (ticketType === "COCINA") {
                await imprimirTicketCocina(printer, ticketData);
            } else {
                await imprimirTicketCaja(printer, ticketData);
            }
        }
        
        await printer.execute();
        console.log("✅ Ticket enviado a la impresora exitosamente.");

    } catch (error) {
        console.error(`❌ Error durante la impresión en "${printerTarget}":`, error);
    }
}

// --- FUNCIÓN PARA IMPRIMIR CON PLANTILLA DINÁMICA ---
async function imprimirConPlantilla(printer, ticketData, template) {
    console.log("🎨 Usando plantilla personalizada:", template.name);
    
    for (const block of template.blocks) {
        await procesarBloque(printer, block, ticketData);
    }
    
    printer.cut();
}

// --- FUNCIÓN PARA PROCESAR CADA BLOQUE DE LA PLANTILLA ---
async function procesarBloque(printer, block, ticketData) {
    switch (block.type) {
        case 'text':
            if (block.align === 'center') {
                printer.alignCenter();
            } else if (block.align === 'right') {
                printer.alignRight();
            } else {
                printer.alignLeft();
            }
            
            if (block.bold) {
                printer.bold(true);
            }
            
            printer.println(block.value || '');
            
            if (block.bold) {
                printer.bold(false);
            }
            break;
            
        case 'line':
            printer.println('--------------------------------');
            break;
            
        case 'datetime':
            const now = new Date();
            let format = block.format || 'DD/MM/YYYY HH:mm';
            
            // Aplicar formato personalizado
            let dateStr = now.toLocaleString('es-ES');
            if (format.includes('DD/MM/YYYY')) {
                dateStr = now.toLocaleDateString('es-ES');
            } else if (format.includes('HH:mm')) {
                dateStr = now.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }
            
            printer.println(dateStr);
            break;
            
        case 'table':
            // Imprimir encabezado de tabla
            if (block.columns && block.columns.length > 0) {
                const header = block.columns.join(' | ');
                printer.println(header);
                printer.println('--------------------------------');
            }
            
            // Imprimir items
            ticketData.items.forEach((item, index) => {
                try {
                    const cantidad = (item.cantidad || 0).toString().padStart(3);
                    const producto = (item.nombreProducto || "Producto desconocido").substring(0, 20).padEnd(20);
                    const precioTotal = item.precioTotal || 0;
                    const total = `$${precioTotal.toFixed(2)}`.padStart(8);
                    printer.println(`${cantidad} | ${producto} | ${total}`);
                } catch (e) {
                    console.error(`❌ Error procesando item ${index}:`, e);
                    printer.println(`ERR | Error en item ${index} | $0.00`);
                }
            });
            break;
            
        case 'total':
            const total = ticketData.total || 0;
            printer.alignRight();
            printer.println(`${block.label || 'Total'}: $${total.toFixed(2)}`);
            printer.alignLeft();
            break;
            
        case 'qr':
            if (block.value) {
                printer.alignCenter();
                printer.printQR(block.value);
                printer.alignLeft();
            }
            break;
            
        case 'logo':
            printer.alignCenter();
            printer.println('[LOGO]');
            printer.alignLeft();
            break;
            
        default:
            console.warn(`⚠️ Tipo de bloque no reconocido: ${block.type}`);
            break;
    }
}

// --- FUNCIÓN PARA TICKETS DE COCINA (SIMPLIFICADO) ---
async function imprimirTicketCocina(printer, ticketData) {
    // Encabezado del ticket de cocina
    printer.alignCenter();
    printer.println("COCINA");
    printer.println("================================");
    printer.alignLeft();
    
    // Información básica
    printer.println(`Mesa: ${ticketData.nombreMesa}`);
    printer.println(`Comanda #: ${ticketData.comandaId}`);
    
    // Manejar la fecha
    let fechaStr = "Fecha no disponible";
    if (ticketData.fechaHora) {
        try {
            if (typeof ticketData.fechaHora === 'string') {
                fechaStr = new Date(ticketData.fechaHora).toLocaleString();
            } else if (Array.isArray(ticketData.fechaHora)) {
                const fecha = new Date(ticketData.fechaHora[0], ticketData.fechaHora[1]-1, ticketData.fechaHora[2], 
                                     ticketData.fechaHora[3], ticketData.fechaHora[4], ticketData.fechaHora[5]);
                fechaStr = fecha.toLocaleString();
            }
        } catch (e) {
            console.warn("⚠️ No se pudo parsear la fecha:", ticketData.fechaHora);
        }
    }
    printer.println(`Hora: ${fechaStr}`);
    printer.println("--------------------------------");
    
    // Lista simple de productos para cocina
    printer.println("Cant. | Producto");
    printer.println("--------------------------------");
    
    ticketData.items.forEach((item, index) => {
        try {
            const cantidad = (item.cantidad || 0).toString().padStart(3);
            const producto = (item.nombreProducto || "Producto desconocido");
            printer.println(`${cantidad} x ${producto}`);
            
            // Si hay notas, las mostramos
            if (item.notas && item.notas.trim() !== "") {
                printer.println(`     Nota: ${item.notas}`);
            }
        } catch (e) {
            console.error(`❌ Error procesando item ${index}:`, e);
            printer.println(`ERR | Error en item ${index}`);
        }
    });
    
    printer.println("--------------------------------");
    printer.alignCenter();
    printer.println("¡LISTO PARA PREPARAR!");
    printer.println("");
    printer.cut();
}

// --- FUNCIÓN PARA TICKETS DE CAJA (CON PRECIOS) ---
async function imprimirTicketCaja(printer, ticketData) {
    // Encabezado del ticket de caja
    printer.alignCenter();
    printer.println("Restaurante 'El Buen Sabor'");
    printer.println("================================");
    printer.alignLeft();
    
    // Información de la mesa y comanda
    printer.println(`Mesa: ${ticketData.nombreMesa}`);
    printer.println(`Comanda #: ${ticketData.comandaId}`);
    
    // Manejar la fecha de manera más robusta
    let fechaStr = "Fecha no disponible";
    if (ticketData.fechaHora) {
        try {
            if (typeof ticketData.fechaHora === 'string') {
                fechaStr = new Date(ticketData.fechaHora).toLocaleString();
            } else if (Array.isArray(ticketData.fechaHora)) {
                // Si es un array (formato ISO), convertirlo
                const fecha = new Date(ticketData.fechaHora[0], ticketData.fechaHora[1]-1, ticketData.fechaHora[2], 
                                     ticketData.fechaHora[3], ticketData.fechaHora[4], ticketData.fechaHora[5]);
                fechaStr = fecha.toLocaleString();
            }
        } catch (e) {
            console.warn("⚠️ No se pudo parsear la fecha:", ticketData.fechaHora);
        }
    }
    printer.println(`Fecha: ${fechaStr}`);
    printer.println("--------------------------------");
    
    // Tabla de items con precios
    printer.println("Cant. | Producto | Total");
    printer.println("--------------------------------");
    
    ticketData.items.forEach((item, index) => {
        try {
            const cantidad = (item.cantidad || 0).toString().padStart(3);
            const producto = (item.nombreProducto || "Producto desconocido").substring(0, 20).padEnd(20);
            const precioTotal = item.precioTotal || 0;
            const total = `$${precioTotal.toFixed(2)}`.padStart(8);
            printer.println(`${cantidad} | ${producto} | ${total}`);
        } catch (e) {
            console.error(`❌ Error procesando item ${index}:`, e);
            printer.println(`ERR | Error en item ${index} | $0.00`);
        }
    });
    
    printer.println("--------------------------------");
    printer.alignRight();
    const total = ticketData.total || 0;
    printer.println(`TOTAL: $${total.toFixed(2)}`);
    printer.alignCenter();
    printer.println("¡Gracias por su visita!");
    printer.println("");
    printer.cut();
}

// --- 4. LÓGICA DE CONEXIÓN CON STOMP ---
const stompClient = new Client({
    brokerURL: WEBSOCKET_URL,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
});

stompClient.onConnect = (frame) => {
    console.log('✅ Conectado al broker STOMP: ' + frame);
    stompClient.subscribe('/topic/print-jobs', async (message) => {
        try {
            const printJob = JSON.parse(message.body);
            if (printJob.printerType && printJob.printerTarget && printJob.ticketData) {
                await imprimirTicket(printJob);
            }
        } catch (error) {
            console.error('Error al procesar el mensaje STOMP:', error);
        }
    });
    console.log("Suscrito a '/topic/print-jobs'");
};

stompClient.onStompError = (frame) => {
    console.error('Error STOMP:', frame);
};

stompClient.onWebSocketError = (error) => {
    console.error('Error WebSocket:', error);
};

stompClient.onWebSocketClose = () => {
    console.log('Conexión WebSocket cerrada');
};

// --- 5. INICIALIZACIÓN ---
console.log('🔄 Conectando al broker STOMP...');
stompClient.activate();

// Manejo de señales para cierre limpio
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando conexión STOMP...');
    stompClient.deactivate();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando conexión STOMP...');
    stompClient.deactivate();
    process.exit(0);
});