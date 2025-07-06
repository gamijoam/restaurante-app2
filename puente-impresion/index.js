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

// --- 3. FUNCIÓN DE IMPRESIÓN (VERSIÓN FINAL) ---
async function imprimirTicket(printJob) {
    const { printerType, printerTarget, ticketData } = printJob;
    console.log(`\n--- Nuevo trabajo de impresión recibido ---`);
    console.log(`Tipo: ${printerType}, Destino: ${printerTarget}`);

    const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: printerTarget, // El destino se recibe del backend
        driver: require('node-printer'),
        // CORRECCIÓN FINAL: Se especifica el juego de caracteres para español
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
        
        // Encabezado del ticket
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
        
        // Tabla de items
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
        
        await printer.execute();
        console.log("✅ Ticket enviado a la impresora exitosamente.");

    } catch (error) {
        console.error(`❌ Error durante la impresión en "${printerTarget}":`, error);
    }
}

// --- 4. LÓGICA DE CONEXIÓN CON STOMP (Sin cambios) ---
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
    console.error('Error en el broker STOMP: ' + frame.headers['message']);
};

// --- 5. INICIAR EL CLIENTE ---
console.log(`Intentando conectar a: ${WEBSOCKET_URL}`);
stompClient.activate();