#!/usr/bin/env node

const { Client } = require('@stomp/stompjs');
const WebSocket = require('ws');

Object.assign(global, { WebSocket });

console.log('🧪 PRUEBA SIMPLE DEL PUENTE DE IMPRESIÓN');
console.log('==========================================');

const client = new Client({
    brokerURL: 'ws://localhost:8080/ws',
    reconnectDelay: 3000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000
});

let testCompleted = false;

client.onConnect = () => {
    console.log('✅ Conectado al WebSocket');
    
    // Enviar trabajo de prueba
    const testJob = {
        printerType: 'THERMAL',
        printerTarget: 'TEST_PRINTER',
        ticketType: 'COCINA',
        ticketData: {
            nombreMesa: 'Mesa de Prueba',
            comandaId: 'TEST-001',
            items: [
                {
                    nombreProducto: 'Producto de Prueba',
                    cantidad: 1,
                    precioTotal: 10.00
                }
            ],
            total: 10.00
        }
    };
    
    console.log('📤 Enviando trabajo de prueba...');
    
    client.publish({
        destination: '/app/print',
        body: JSON.stringify(testJob),
        headers: {
            'content-type': 'application/json'
        }
    });
    
    console.log('✅ Trabajo enviado, esperando 5 segundos...');
    
    setTimeout(() => {
        console.log('✅ Prueba completada exitosamente');
        testCompleted = true;
        client.deactivate();
        process.exit(0);
    }, 5000);
};

client.onStompError = (frame) => {
    console.error('❌ Error STOMP:', frame.headers['message']);
    process.exit(1);
};

client.onWebSocketError = (error) => {
    console.error('❌ Error WebSocket:', error.message);
    process.exit(1);
};

// Timeout de seguridad
setTimeout(() => {
    if (!testCompleted) {
        console.error('❌ Timeout de prueba (10 segundos)');
        process.exit(1);
    }
}, 10000);

console.log('🔄 Conectando...');
client.activate(); 