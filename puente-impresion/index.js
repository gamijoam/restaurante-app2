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
        printer.println("Imprimiendo ticket...");
        printer.println(`Para la mesa: ${ticketData.nombreMesa}`);
        // ... (Aquí puedes añadir toda la lógica para construir tu ticket) ...
        printer.cut();
        
        await printer.execute();
        console.log("✅ Ticket enviado a la impresora exitosamente.");

    } catch (error) {
        console.error(`Error durante la impresión en "${printerTarget}":`, error);
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