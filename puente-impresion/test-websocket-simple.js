const { Client } = require('@stomp/stompjs');

console.log('🧪 Prueba Simple de WebSocket');
console.log('================================');

const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'ws://localhost:8080/ws';

console.log(`🔗 URL: ${WEBSOCKET_URL}`);
console.log('');

// Función para probar conexión
function testConnection() {
    return new Promise((resolve) => {
        console.log('🔄 Intentando conectar...');
        
        const client = new Client({
            brokerURL: WEBSOCKET_URL,
            reconnectDelay: 3000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        let timeout = setTimeout(() => {
            console.log('❌ Timeout de conexión (10 segundos)');
            client.deactivate();
            resolve(false);
        }, 10000);

        client.onConnect = () => {
            clearTimeout(timeout);
            console.log('✅ Conexión exitosa');
            client.deactivate();
            resolve(true);
        };

        client.onStompError = (frame) => {
            clearTimeout(timeout);
            console.log(`❌ Error STOMP: ${frame.headers['message']}`);
            resolve(false);
        };

        client.onWebSocketError = (error) => {
            clearTimeout(timeout);
            console.log(`❌ Error WebSocket: ${error.message}`);
            resolve(false);
        };

        try {
            client.activate();
        } catch (error) {
            clearTimeout(timeout);
            console.log(`❌ Error activando cliente: ${error.message}`);
            resolve(false);
        }
    });
}

// Función para probar reconexión
async function testReconnection() {
    console.log('\n🔄 Probando reconexión...');
    
    const client = new Client({
        brokerURL: WEBSOCKET_URL,
        reconnectDelay: 2000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
    });

    return new Promise((resolve) => {
        let connectionCount = 0;
        let timeout = setTimeout(() => {
            console.log('❌ Timeout de reconexión');
            client.deactivate();
            resolve(false);
        }, 15000);

        client.onConnect = () => {
            connectionCount++;
            console.log(`✅ Conexión ${connectionCount} exitosa`);
            
            if (connectionCount === 1) {
                // Simular desconexión después de la primera conexión
                setTimeout(() => {
                    console.log('🔄 Simulando desconexión...');
                    client.deactivate();
                }, 2000);
            } else if (connectionCount === 2) {
                // Segunda conexión exitosa
                clearTimeout(timeout);
                client.deactivate();
                resolve(true);
            }
        };

        client.onDisconnect = () => {
            console.log('❌ Cliente desconectado');
        };

        client.onStompError = (frame) => {
            console.log(`❌ Error STOMP: ${frame.headers['message']}`);
            if (connectionCount === 0) {
                clearTimeout(timeout);
                resolve(false);
            }
        };

        client.onWebSocketError = (error) => {
            console.log(`❌ Error WebSocket: ${error.message}`);
            if (connectionCount === 0) {
                clearTimeout(timeout);
                resolve(false);
            }
        };

        try {
            client.activate();
        } catch (error) {
            console.log(`❌ Error activando cliente: ${error.message}`);
            clearTimeout(timeout);
            resolve(false);
        }
    });
}

// Ejecutar pruebas
async function runTests() {
    console.log('🚀 Iniciando pruebas...\n');
    
    // Prueba 1: Conexión inicial
    console.log('📋 Prueba 1: Conexión inicial');
    const test1Result = await testConnection();
    console.log(test1Result ? '✅ PASÓ' : '❌ FALLÓ');
    
    // Pausa entre pruebas
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Prueba 2: Reconexión
    console.log('\n📋 Prueba 2: Reconexión');
    const test2Result = await testReconnection();
    console.log(test2Result ? '✅ PASÓ' : '❌ FALLÓ');
    
    // Resumen
    console.log('\n📊 RESUMEN');
    console.log(`✅ Pruebas pasadas: ${(test1Result ? 1 : 0) + (test2Result ? 1 : 0)}/2`);
    console.log(`❌ Pruebas fallidas: ${(test1Result ? 0 : 1) + (test2Result ? 0 : 1)}/2`);
    
    if (test1Result && test2Result) {
        console.log('\n🎉 TODAS LAS PRUEBAS PASARON');
        console.log('✅ El WebSocket funciona correctamente');
    } else {
        console.log('\n⚠️ ALGUNAS PRUEBAS FALLARON');
        console.log('❌ Revisar configuración del WebSocket');
    }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
    runTests().catch(error => {
        console.error('❌ Error ejecutando pruebas:', error);
        process.exit(1);
    });
}

module.exports = { testConnection, testReconnection }; 