const { Client } = require('@stomp/stompjs');

class WebSocketReconnectionTester {
    constructor() {
        this.websocketUrl = process.env.WEBSOCKET_URL || 'ws://localhost:8080/ws';
        this.testResults = [];
        this.currentTest = 0;
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            'INFO': 'ℹ️',
            'SUCCESS': '✅',
            'ERROR': '❌',
            'WARNING': '⚠️'
        }[type] || 'ℹ️';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
        this.testResults.push({ timestamp, message, type });
    }

    async testInitialConnection() {
        this.log('🔍 Prueba 1: Conexión inicial...');
        
        return new Promise((resolve) => {
            const client = new Client({
                brokerURL: this.websocketUrl,
                reconnectDelay: 3000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            });

            let connectionTimeout = setTimeout(() => {
                this.log('❌ Timeout de conexión inicial', 'ERROR');
                client.deactivate();
                resolve(false);
            }, 10000);

            client.onConnect = () => {
                clearTimeout(connectionTimeout);
                this.log('✅ Conexión inicial exitosa', 'SUCCESS');
                client.deactivate();
                resolve(true);
            };

            client.onStompError = (frame) => {
                clearTimeout(connectionTimeout);
                this.log(`❌ Error STOMP inicial: ${frame.headers['message']}`, 'ERROR');
                resolve(false);
            };

            client.onWebSocketError = (error) => {
                clearTimeout(connectionTimeout);
                this.log(`❌ Error WebSocket inicial: ${error.message}`, 'ERROR');
                resolve(false);
            };

            try {
                client.activate();
            } catch (error) {
                clearTimeout(connectionTimeout);
                this.log(`❌ Error activando cliente inicial: ${error.message}`, 'ERROR');
                resolve(false);
            }
        });
    }

    async testReconnection() {
        this.log('🔍 Prueba 2: Reconexión después de desconexión...');
        
        return new Promise((resolve) => {
            const client = new Client({
                brokerURL: this.websocketUrl,
                reconnectDelay: 2000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            });

            let connectionAttempts = 0;
            let maxAttempts = 3;
            let reconnectionTimeout;

            client.onConnect = () => {
                connectionAttempts++;
                this.log(`✅ Conexión ${connectionAttempts} exitosa`, 'SUCCESS');
                
                if (connectionAttempts === 1) {
                    // Simular desconexión después de la primera conexión
                    setTimeout(() => {
                        this.log('🔄 Simulando desconexión...');
                        client.deactivate();
                    }, 2000);
                } else if (connectionAttempts === 2) {
                    // Segunda conexión exitosa
                    clearTimeout(reconnectionTimeout);
                    client.deactivate();
                    resolve(true);
                }
            };

            client.onDisconnect = () => {
                this.log('❌ Cliente desconectado');
            };

            client.onStompError = (frame) => {
                this.log(`❌ Error STOMP: ${frame.headers['message']}`, 'ERROR');
                if (connectionAttempts === 0) {
                    clearTimeout(reconnectionTimeout);
                    resolve(false);
                }
            };

            client.onWebSocketError = (error) => {
                this.log(`❌ Error WebSocket: ${error.message}`, 'ERROR');
                if (connectionAttempts === 0) {
                    clearTimeout(reconnectionTimeout);
                    resolve(false);
                }
            };

            reconnectionTimeout = setTimeout(() => {
                this.log('❌ Timeout de reconexión', 'ERROR');
                client.deactivate();
                resolve(false);
            }, 15000);

            try {
                client.activate();
            } catch (error) {
                this.log(`❌ Error activando cliente: ${error.message}`, 'ERROR');
                clearTimeout(reconnectionTimeout);
                resolve(false);
            }
        });
    }

    async testMultipleConnections() {
        this.log('🔍 Prueba 3: Múltiples conexiones simultáneas...');
        
        const promises = [];
        const numConnections = 3;
        
        for (let i = 0; i < numConnections; i++) {
            promises.push(this.createTestConnection(i + 1));
        }
        
        try {
            const results = await Promise.all(promises);
            const successCount = results.filter(r => r).length;
            this.log(`✅ ${successCount}/${numConnections} conexiones exitosas`, 'SUCCESS');
            return successCount === numConnections;
        } catch (error) {
            this.log(`❌ Error en prueba de múltiples conexiones: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async createTestConnection(id) {
        return new Promise((resolve) => {
            const client = new Client({
                brokerURL: this.websocketUrl,
                reconnectDelay: 1000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            });

            let timeout = setTimeout(() => {
                this.log(`❌ Timeout conexión ${id}`, 'ERROR');
                client.deactivate();
                resolve(false);
            }, 5000);

            client.onConnect = () => {
                clearTimeout(timeout);
                this.log(`✅ Conexión ${id} exitosa`, 'SUCCESS');
                client.deactivate();
                resolve(true);
            };

            client.onStompError = (frame) => {
                clearTimeout(timeout);
                this.log(`❌ Error STOMP conexión ${id}: ${frame.headers['message']}`, 'ERROR');
                resolve(false);
            };

            client.onWebSocketError = (error) => {
                clearTimeout(timeout);
                this.log(`❌ Error WebSocket conexión ${id}: ${error.message}`, 'ERROR');
                resolve(false);
            };

            try {
                client.activate();
            } catch (error) {
                clearTimeout(timeout);
                this.log(`❌ Error activando conexión ${id}: ${error.message}`, 'ERROR');
                resolve(false);
            }
        });
    }

    async runAllTests() {
        this.log('🚀 Iniciando pruebas de reconexión WebSocket...');
        this.log(`🔗 URL: ${this.websocketUrl}`);
        
        const tests = [
            { name: 'Conexión inicial', test: () => this.testInitialConnection() },
            { name: 'Reconexión', test: () => this.testReconnection() },
            { name: 'Múltiples conexiones', test: () => this.testMultipleConnections() }
        ];

        let passedTests = 0;
        
        for (const test of tests) {
            this.currentTest++;
            this.log(`\n📋 Ejecutando prueba ${this.currentTest}: ${test.name}`);
            
            try {
                const result = await test.test();
                if (result) {
                    passedTests++;
                    this.log(`✅ Prueba ${this.currentTest} PASÓ`, 'SUCCESS');
                } else {
                    this.log(`❌ Prueba ${this.currentTest} FALLÓ`, 'ERROR');
                }
            } catch (error) {
                this.log(`❌ Error en prueba ${this.currentTest}: ${error.message}`, 'ERROR');
            }
            
            // Pausa entre pruebas
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        this.log('\n📊 RESUMEN DE PRUEBAS');
        this.log(`✅ Pruebas pasadas: ${passedTests}/${tests.length}`);
        this.log(`❌ Pruebas fallidas: ${tests.length - passedTests}/${tests.length}`);
        
        if (passedTests === tests.length) {
            this.log('🎉 TODAS LAS PRUEBAS PASARON - WebSocket funciona correctamente', 'SUCCESS');
        } else {
            this.log('⚠️ ALGUNAS PRUEBAS FALLARON - Revisar configuración WebSocket', 'WARNING');
        }

        return passedTests === tests.length;
    }
}

// Ejecutar pruebas
if (require.main === module) {
    const tester = new WebSocketReconnectionTester();
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Error ejecutando pruebas:', error);
        process.exit(1);
    });
}

module.exports = WebSocketReconnectionTester; 